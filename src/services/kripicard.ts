/**
 * KripiCard API Service
 * Base URL: https://home.kripicard.com/api/premium
 *
 * Authentication: x-api-key header + Authorization: Bearer header
 * User identity: Telegram user ID (primary) → TON wallet address (fallback)
 * Sent as `user_id` field with every request.
 *
 * All requests use POST with JSON body, except Get_CardDetails which
 * tries GET first with query params, then falls back to POST.
 */

const BASE_URL = "https://home.kripicard.com/api/premium";
const API_KEY = import.meta.env.VITE_KRIPICARD_API_KEY as string;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface KripiCardDetails {
  card_id: string;
  card_number: string; // full PAN, returned only from GetCardDetails
  cvv: string;
  expiry: string;     // MM/YY
  balance: number;
  status: "active" | "frozen" | "closed" | string;
  currency: string;
  card_type?: string;
  network?: string;
  holder_name?: string;
  billing_address?: string;
}

export interface KripiTransaction {
  id: string;
  type: "debit" | "credit" | "refund" | string;
  amount: number;
  currency: string;
  merchant?: string;
  description?: string;
  status: "approved" | "declined" | "pending" | string;
  created_at: string;
}

export interface CreateCardResult {
  success: boolean;
  card_id?: string;
  card_number?: string;
  cvv?: string;
  expiry?: string;
  error?: string;
  raw?: unknown;
}

export interface FundCardResult {
  success: boolean;
  new_balance?: number;
  transaction_id?: string;
  error?: string;
  raw?: unknown;
}

export interface FreezeResult {
  success: boolean;
  status?: string;
  error?: string;
  raw?: unknown;
}

export interface CardDetailsResult {
  success: boolean;
  data?: KripiCardDetails;
  transactions?: KripiTransaction[];
  error?: string;
  raw?: unknown;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildHeaders(extra: Record<string, string> = {}): HeadersInit {
  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": `Bearer ${API_KEY}`,
    "x-api-key": API_KEY,
    ...extra,
  };
}

async function kripiPost<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timer);

    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw_text: text };
    }

    if (!res.ok) {
      const errMsg =
        (data as any)?.message ||
        (data as any)?.error ||
        (data as any)?.msg ||
        (data as any)?.detail ||
        `HTTP ${res.status}`;
      throw new Error(errMsg);
    }
    return data as T;
  } catch (e: any) {
    clearTimeout(timer);
    if (e.name === "AbortError") throw new Error("Request timed out (20s)");
    if (e.message?.includes("fetch")) throw new Error("Network error — check your connection");
    throw e;
  }
}

async function kripiGet<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);

  try {
    const qs = Object.keys(params).length
      ? "?" + new URLSearchParams(params).toString()
      : "";
    const res = await fetch(`${BASE_URL}${endpoint}${qs}`, {
      method: "GET",
      headers: buildHeaders(),
      signal: controller.signal,
    });
    clearTimeout(timer);

    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw_text: text };
    }

    if (!res.ok) {
      const errMsg =
        (data as any)?.message ||
        (data as any)?.error ||
        (data as any)?.msg ||
        `HTTP ${res.status}`;
      throw new Error(errMsg);
    }
    return data as T;
  } catch (e: any) {
    clearTimeout(timer);
    if (e.name === "AbortError") throw new Error("Request timed out (20s)");
    if (e.message?.includes("fetch")) throw new Error("Network error — check your connection");
    throw e;
  }
}

// ─── User identity helpers ────────────────────────────────────────────────────

/**
 * Stable user reference: tg_{telegram_user_id} or ton_{first20ofAddress}
 * Used as `user_id` in every API call to uniquely identify the user.
 */
export function buildUserRef(telegramUserId?: number | string, tonAddress?: string): string {
  if (telegramUserId) return `tg_${telegramUserId}`;
  if (tonAddress) return `ton_${tonAddress.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20)}`;
  return `anon_${Date.now()}`;
}

/** Get Telegram user ID from WebApp if available */
export function getTelegramUserId(): number | undefined {
  return (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id;
}

/**
 * Get Telegram first name for cardholder.
 * Truncated to 26 chars (card standard), uppercase.
 */
export function getTelegramName(): string {
  const user = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
  if (!user) return "CARD HOLDER";
  const first = (user.first_name || "").toUpperCase().replace(/[^A-Z ]/g, "").slice(0, 12);
  const last = (user.last_name || "").toUpperCase().replace(/[^A-Z ]/g, "").slice(0, 12);
  const full = [first, last].filter(Boolean).join(" ").slice(0, 26);
  return full || "CARD HOLDER";
}

// ─── API Methods ─────────────────────────────────────────────────────────────

/**
 * Create a new virtual card.
 * Payload: { amount, currency, card_type, network, user_id, holder_name }
 * Cost: $5 issuance fee + min $10 initial balance = $15 USDT minimum.
 * Network: always "visa" per product requirement.
 */
export async function createCard(params: {
  initialAmount: number;      // min $10 — goes to card balance
  currency?: "USDT";
  network?: "visa";           // always visa
  userRef: string;
  holderName?: string;
}): Promise<CreateCardResult> {
  try {
    const holderNameFmt = (params.holderName ?? getTelegramName())
      .toUpperCase()
      .replace(/[^A-Z ]/g, "")
      .slice(0, 26)
      .trim() || "CARD HOLDER";

    const body: Record<string, unknown> = {
      // Primary field names used by KripiCard API
      amount: params.initialAmount,
      initialAmount: params.initialAmount,      // alt name fallback
      initial_amount: params.initialAmount,     // snake_case alt
      currency: params.currency ?? "USDT",
      card_type: "virtual",
      network: "visa",                           // locked to Visa
      user_id: params.userRef,
      userRef: params.userRef,                   // alt field name
      holder_name: holderNameFmt,
      holderName: holderNameFmt,                 // alt field name
    };

    const data = await kripiPost<any>("/Create_card", body);

    // Normalise various possible response shapes
    const cardId =
      data?.card_id   ||
      data?.cardId    ||
      data?.id        ||
      data?.data?.card_id ||
      data?.data?.id  ||
      null;

    const cardNum =
      data?.card_number ||
      data?.cardNumber  ||
      data?.number      ||
      data?.pan         ||
      data?.data?.card_number ||
      null;

    const cvv =
      data?.cvv   ||
      data?.cvv2  ||
      data?.data?.cvv ||
      null;

    const expiry =
      data?.expiry      ||
      data?.exp_date    ||
      data?.expiry_date ||
      data?.expiryDate  ||
      data?.data?.expiry ||
      null;

    if (!cardId) {
      console.error("[KripiCard] Create_card — no card_id in response:", data);
      return {
        success: false,
        error: "Card was not returned in the response. Please contact support.",
        raw: data,
      };
    }

    return {
      success: true,
      card_id: cardId,
      card_number: cardNum,
      cvv,
      expiry,
      raw: data,
    };
  } catch (e: any) {
    console.error("[KripiCard] createCard error:", e);
    return { success: false, error: e.message || "Unknown error" };
  }
}

/**
 * Fund (top-up) an existing card.
 * Payload: { card_id, amount, currency, user_id }
 * Fee: 4% + $1 processing fee applied on the amount.
 */
export async function fundCard(params: {
  cardId: string;
  amount: number;
  currency?: "USDT";
  userRef: string;
}): Promise<FundCardResult> {
  try {
    const body: Record<string, unknown> = {
      card_id: params.cardId,
      cardId: params.cardId,            // alt field name
      amount: params.amount,
      currency: params.currency ?? "USDT",
      user_id: params.userRef,
      userRef: params.userRef,
    };

    const data = await kripiPost<any>("/Fund_Card", body);

    return {
      success: true,
      new_balance:
        data?.balance       ??
        data?.new_balance   ??
        data?.card_balance  ??
        data?.data?.balance ??
        undefined,
      transaction_id:
        data?.transaction_id ||
        data?.tx_id          ||
        data?.id             ||
        undefined,
      raw: data,
    };
  } catch (e: any) {
    console.error("[KripiCard] fundCard error:", e);
    return { success: false, error: e.message || "Unknown error" };
  }
}

/**
 * Get card details including balance and transactions.
 * Tries GET with query params first, falls back to POST.
 */
export async function getCardDetails(params: {
  cardId: string;
  userRef: string;
}): Promise<CardDetailsResult> {
  try {
    let data: any;

    // Try GET first
    try {
      data = await kripiGet<any>("/Get_CardDetails", {
        card_id: params.cardId,
        user_id: params.userRef,
      });
    } catch {
      // Fall back to POST
      data = await kripiPost<any>("/Get_CardDetails", {
        card_id: params.cardId,
        cardId: params.cardId,
        user_id: params.userRef,
        userRef: params.userRef,
      });
    }

    // Unwrap nested `data` wrapper if present
    const raw = data?.data ?? data;

    // Normalise card details
    const card: KripiCardDetails = {
      card_id:     raw?.card_id      || raw?.cardId    || raw?.id       || params.cardId,
      card_number: raw?.card_number  || raw?.cardNumber || raw?.number  || raw?.pan     || "",
      cvv:         raw?.cvv          || raw?.cvv2      || "",
      expiry:      raw?.expiry       || raw?.exp_date  || raw?.expiry_date || raw?.expiryDate || "",
      balance:     parseFloat(raw?.balance ?? raw?.available_balance ?? raw?.card_balance ?? 0),
      status:      raw?.status       || "active",
      currency:    raw?.currency     || "USD",
      card_type:   raw?.card_type    || raw?.cardType  || "virtual",
      network:     raw?.network      || raw?.brand     || "visa",
      holder_name: raw?.holder_name  || raw?.holderName || raw?.cardholder_name || "",
    };

    // Normalise transactions
    const txRaw: any[] = raw?.transactions || raw?.history || raw?.tx_history || data?.transactions || [];
    const transactions: KripiTransaction[] = txRaw.map((tx: any, i: number) => ({
      id:          tx.id || tx.transaction_id || tx.txId || `tx-${i}`,
      type:        tx.type || (parseFloat(tx.amount) > 0 ? "credit" : "debit"),
      amount:      Math.abs(parseFloat(tx.amount ?? 0)),
      currency:    tx.currency || "USD",
      merchant:    tx.merchant || tx.merchant_name || tx.merchantName || "",
      description: tx.description || tx.memo || tx.merchant || "",
      status:      tx.status || "approved",
      created_at:  tx.created_at || tx.createdAt || tx.date || tx.timestamp || new Date().toISOString(),
    }));

    return { success: true, data: card, transactions };
  } catch (e: any) {
    console.error("[KripiCard] getCardDetails error:", e);
    return { success: false, error: e.message || "Unknown error" };
  }
}

/**
 * Freeze or unfreeze a card.
 * Payload: { card_id, freeze, action, user_id }
 * Sends both `freeze` (bool) and `action` (string) for maximum compatibility.
 */
export async function freezeUnfreezeCard(params: {
  cardId: string;
  freeze: boolean;
  userRef: string;
}): Promise<FreezeResult> {
  try {
    const body: Record<string, unknown> = {
      card_id: params.cardId,
      cardId: params.cardId,
      freeze: params.freeze,                         // bool form
      action: params.freeze ? "freeze" : "unfreeze", // string form (alt)
      user_id: params.userRef,
      userRef: params.userRef,
    };

    const data = await kripiPost<any>("/Freeze_Unfreeze", body);

    return {
      success: true,
      status:
        data?.status ||
        data?.card_status ||
        (params.freeze ? "frozen" : "active"),
      raw: data,
    };
  } catch (e: any) {
    console.error("[KripiCard] freezeUnfreezeCard error:", e);
    return { success: false, error: e.message || "Unknown error" };
  }
}

// ─── Fee calculators ──────────────────────────────────────────────────────────

export const CARD_ISSUANCE_FEE = 5;       // USD
export const CARD_MIN_INITIAL  = 10;      // USD
export const FUND_FEE_PERCENT  = 0.04;    // 4%
export const FUND_PROCESSING   = 1;       // USD fixed

/** Total cost to issue a new card (issuance fee + initial deposit) */
export function calcIssuanceCost(initialBalance: number = CARD_MIN_INITIAL): {
  issuanceFee: number;
  initialDeposit: number;
  total: number;
} {
  const deposit = Math.max(initialBalance, CARD_MIN_INITIAL);
  return {
    issuanceFee:    CARD_ISSUANCE_FEE,
    initialDeposit: deposit,
    total:          parseFloat((CARD_ISSUANCE_FEE + deposit).toFixed(2)),
  };
}

/** Total cost to top-up a card (amount + 4% + $1 gateway fee) */
export function calcFundCost(amount: number): {
  amount: number;
  percentFee: number;
  processingFee: number;
  total: number;
} {
  const pct = parseFloat((amount * FUND_FEE_PERCENT).toFixed(2));
  return {
    amount,
    percentFee:    pct,
    processingFee: FUND_PROCESSING,
    total:         parseFloat((amount + pct + FUND_PROCESSING).toFixed(2)),
  };
}
