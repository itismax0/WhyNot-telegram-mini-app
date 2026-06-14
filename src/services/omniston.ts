export const OMNISTON_WS_URL = "wss://omni-ws.ston.fi";
export const OMNISTON_WS_URL_SANDBOX = "wss://omni-ws-sandbox.ston.fi";
export const TON_CHAIN_ID = 607;
export const SETTLEMENT_METHOD_SWAP = 0;
export const GASLESS_SETTLEMENT_POSSIBLE = 1;

export interface AssetAddress {
	blockchain: number;
	address: string;
}

export interface SwapChunk {
	protocol: number;
	bid_amount: string;
	ask_amount: string;
	extra: string;
	extra_version: number;
}

export interface SwapStep {
	bid_asset_address: AssetAddress;
	ask_asset_address: AssetAddress;
	chunks: SwapChunk[];
}

export interface SwapRoute {
	steps: SwapStep[];
	gas_budget: string;
}

export interface SwapParams {
	routes: SwapRoute[];
	min_ask_amount: string;
	recommended_min_ask_amount: string;
	recommended_slippage_bps: number;
}

export interface Quote {
	quote_id: string;
	resolver_id?: string;
	resolver_name?: string;
	bid_asset_address: AssetAddress;
	ask_asset_address: AssetAddress;
	bid_units: string;
	ask_units: string;
	referrer_address?: AssetAddress;
	referrer_fee_units?: string;
	protocol_fee_units?: string;
	quote_timestamp: number;
	trade_start_deadline: number;
	estimated_gas_consumption?: number;
	params: {
		swap: SwapParams;
	};
}

export interface TransferMessage {
	target_address: string;
	send_amount: string;
	payload: string;
}

export type TradeStatusType =
	| "awaiting_transfer"
	| "transferring"
	| "swapping"
	| "awaiting_fill"
	| "claim_available"
	| "refund_available"
	| "receiving_funds"
	| "trade_settled";

export interface TradeSettledData {
	result?: 1 | 2 | 3;
	tx_hash?: string;
}

export interface TradeStatusData {
	trade_settled?: TradeSettledData;
	[key: string]: unknown;
}

export type TradeStatusHandler = (
	status: TradeStatusType,
	data?: TradeStatusData
) => void;

type Listener = (data: any) => void;

class OmnistonClient {
	private ws: WebSocket | null = null;
	private url: string;
	private rpcId = 0;
	private pendingRpcs = new Map<
		number,
		{ resolve: (v: any) => void; reject: (e: any) => void }
	>();
	private listeners = new Map<string, Set<Listener>>();
	private pingTimer: ReturnType<typeof setInterval> | null = null;
	private connectPromise: Promise<void> | null = null;
	private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
	private isManualClose = false;
	private reconnectAttempts = 0;
	private readonly maxReconnectAttempts = 10;

	constructor(url: string = OMNISTON_WS_URL) {
		this.url = url;
	}

	connect(): Promise<void> {
		if (this.ws) {
			if (this.ws.readyState === WebSocket.OPEN) {
				return Promise.resolve();
			}
			if (
				this.ws.readyState === WebSocket.CONNECTING &&
				this.connectPromise
			) {
				return this.connectPromise;
			}
		}
		if (this.connectPromise) {
			return this.connectPromise;
		}

		this.connectPromise = new Promise((resolve, reject) => {
			try {
				this.ws = new WebSocket(this.url);
			} catch (e) {
				this.connectPromise = null;
				reject(e);
				return;
			}

			this.ws.onopen = () => {
				this.reconnectAttempts = 0;
				this.startPing();
				this.connectPromise = null;
				resolve();
			};

			this.ws.onerror = (err) => {
				if (this.connectPromise) {
					this.connectPromise = null;
					reject(err);
				}
			};

			this.ws.onclose = () => {
				this.stopPing();

				this.listeners.forEach((listenerSet) => {
					listenerSet.forEach((listener) => {
						try {
							listener({
								error:
									"WebSocket disconnected — subscription lost",
							});
						} catch {
							/* ignore */
						}
					});
				});
				this.listeners.clear();
				this.rejectAllPending(
					new Error("Omniston WebSocket closed")
				);

				if (this.isManualClose) return;
				if (
					this.reconnectAttempts >= this.maxReconnectAttempts
				) {
					console.warn(
						"[Omniston] Max reconnect attempts reached"
					);
					return;
				}

				const delay = Math.min(
					3000 * Math.pow(2, this.reconnectAttempts),
					60000
				);
				this.reconnectAttempts++;

				this.reconnectTimer = setTimeout(() => {
					this.connect().catch(() => undefined);
				}, delay);
			};

			this.ws.onmessage = (event) => {
				try {
					this.handleMessage(JSON.parse(event.data));
				} catch (e) {
					console.error("Failed to parse omniston message", e);
				}
			};
		});

		return this.connectPromise;
	}

	close() {
		this.isManualClose = true;
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}
		this.stopPing();
		this.listeners.clear();
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}
		this.rejectAllPending(new Error("Omniston client closed"));
		this.isManualClose = false;
	}

	private startPing() {
		this.stopPing();
		this.pingTimer = setInterval(() => {
			if (this.ws?.readyState === WebSocket.OPEN) {
				try {
					this.ws.send(
						JSON.stringify({
							jsonrpc: "2.0",
							method: "ping",
						})
					);
				} catch {
					/* ignore */
				}
			}
		}, 25000);
	}

	private stopPing() {
		if (this.pingTimer) {
			clearInterval(this.pingTimer);
			this.pingTimer = null;
		}
	}

	private rejectAllPending(err: Error) {
		this.pendingRpcs.forEach(({ reject }) => reject(err));
		this.pendingRpcs.clear();
	}

	private handleMessage(msg: any) {
		if (msg.method === "pong" || msg.method === "ping") {
			return;
		}

		if (
			typeof msg.id === "number" &&
			this.pendingRpcs.has(msg.id)
		) {
			const { resolve, reject } = this.pendingRpcs.get(msg.id)!;
			this.pendingRpcs.delete(msg.id);
			if (msg.error) {
				const errorMsg =
					typeof msg.error === "string"
						? msg.error
						: typeof msg.error?.message === "string"
							? msg.error.message
							: `RPC error: ${JSON.stringify(msg.error)}`;
				reject(new Error(errorMsg));
			} else {
				resolve(msg.result);
			}
			return;
		}

		if (msg.method === "event" || msg.method === "status") {
			const rawSub = msg.params?.subscription;
			const subId =
				typeof rawSub === "string" || typeof rawSub === "number"
					? String(rawSub)
					: "";
			if (!subId) return;
			const listeners = this.listeners.get(subId);
			if (listeners) {
				listeners.forEach((l) => {
					try {
						l(msg.params?.result);
					} catch (e) {
						console.error("Omniston listener error", e);
					}
				});
			}
		}
	}

	private sendRaw(payload: object) {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
			throw new Error("Omniston WebSocket is not open");
		}
		try {
			this.ws.send(JSON.stringify(payload));
		} catch (e) {
			throw new Error(
				`Omniston send failed: ${(e as Error).message}`
			);
		}
	}

	async requestQuote(args: {
		bidAddress: string;
		askAddress: string;
		bidUnits: string;
		walletAddress: string;
		slippageBps?: number;
		timeoutMs?: number;
	}): Promise<Quote | null> {
		const timeoutMs = args.timeoutMs ?? 15000;
		try {
			await this.connect();
		} catch (e) {
			console.warn("[Omniston] connect failed:", e);
			return null;
		}

		const id = ++this.rpcId;
		if (this.rpcId > 999999) this.rpcId = 1;

		const params = {
			bid_asset_address: {
				blockchain: TON_CHAIN_ID,
				address: args.bidAddress,
			},
			ask_asset_address: {
				blockchain: TON_CHAIN_ID,
				address: args.askAddress,
			},
			amount: {
				bid_units: args.bidUnits,
			},
			referrer_address: {
				blockchain: TON_CHAIN_ID,
				address: "",
			},
			referrer_fee_bps: 0,
			settlement_methods: [SETTLEMENT_METHOD_SWAP],
			settlement_params: {
				max_price_slippage_bps: args.slippageBps ?? 100,
				max_outgoing_messages: 4,
				gasless_settlement: GASLESS_SETTLEMENT_POSSIBLE,
				flexible_referrer_fee: false,
				wallet_address: {
					blockchain: TON_CHAIN_ID,
					address: args.walletAddress,
				},
			},
		};

		return new Promise<Quote | null>((resolve) => {
			let resolved = false;
			let handler: ((event: MessageEvent) => void) | null = null;

			const finish = (q: Quote | null) => {
				if (resolved) return;
				resolved = true;
				clearTimeout(timer);
				if (this.ws && handler) {
					this.ws.removeEventListener("message", handler);
				}
				if (!q) {
					console.warn(
						"[Omniston] no quote received",
						{ id, wsState: this.ws?.readyState }
					);
				}
				resolve(q);
			};

			handler = (event: MessageEvent) => {
				let data: any;
				try {
					data = JSON.parse(event.data);
				} catch {
					return;
				}

				if (data?.id === id) {
					if (data.error) {
						console.error(
							"[Omniston] quote RPC error",
							data.error
						);
						finish(null);
						return;
					}
					const quote =
						extractQuote(data.result) ||
						extractQuote(data);
					if (quote) {
						finish(quote);
					}
					return;
				}

				if (
					data?.method === "event" ||
					data?.method === "status"
				) {
					const quote =
						extractQuote(data?.params?.result) ||
						extractQuote(data);
					if (quote) {
						finish(quote);
					}
				}
			};

			const timer = setTimeout(() => {
				finish(null);
			}, timeoutMs);

			if (this.ws) {
				this.ws.addEventListener("message", handler);
			}
			try {
				this.sendRaw({
					jsonrpc: "2.0",
					id,
					method: "v1beta7.quote",
					params,
				});
			} catch (e) {
				console.error("[Omniston] sendRaw failed", e);
				finish(null);
			}
		});
	}

	private isValidTransferMessage(
		m: unknown
	): m is TransferMessage {
		if (!m || typeof m !== "object") return false;
		const msg = m as Record<string, unknown>;
		return (
			typeof msg.target_address === "string" &&
			msg.target_address.length > 0 &&
			typeof msg.send_amount === "string" &&
			/^\d+$/.test(msg.send_amount) &&
			typeof msg.payload === "string"
		);
	}

	async buildTransfer(
		quote: Quote,
		walletAddress: string
	): Promise<TransferMessage[]> {
		const result = await this.rpc("v1beta7.transaction.build_transfer", {
			quote,
			source_address: {
				blockchain: TON_CHAIN_ID,
				address: walletAddress,
			},
			destination_address: {
				blockchain: TON_CHAIN_ID,
				address: walletAddress,
			},
			gas_excess_address: {
				blockchain: TON_CHAIN_ID,
				address: walletAddress,
			},
			refund_address: {
				blockchain: TON_CHAIN_ID,
				address: walletAddress,
			},
			use_recommended_slippage: true,
		});

		const messages = result?.ton?.messages;
		if (!Array.isArray(messages) || messages.length === 0) {
			throw new Error("Omniston did not return any transfer messages");
		}

		const validated = messages.filter(
			(m) => this.isValidTransferMessage(m)
		);
		if (validated.length !== messages.length) {
			throw new Error(
				`Omniston returned ${messages.length - validated.length} invalid transfer message(s)`
			);
		}

		return validated;
	}

	async trackTrade(args: {
		quoteId: string;
		traderWalletAddress: string;
		outgoingTxHash: string;
		onStatus: TradeStatusHandler;
		onError?: (error: string) => void;
	}): Promise<() => void> {
		const result = await this.rpc("v1beta7.trade.track", {
			quote_id: args.quoteId,
			trader_wallet_address: {
				blockchain: TON_CHAIN_ID,
				address: args.traderWalletAddress,
			},
			outgoing_tx_hash: args.outgoingTxHash,
		});

		const rawSub = result?.subscription;
		const subId =
			typeof rawSub === "string" || typeof rawSub === "number"
				? String(rawSub)
				: "";
		if (!subId) {
			throw new Error("No subscription returned from trade.track");
		}

		const handler: Listener = (data) => {
			if (!data) return;

			if (data.error) {
				args.onError?.(
					typeof data.error === "string"
						? data.error
						: JSON.stringify(data.error)
				);
				return;
			}

			const tradeStatuses: TradeStatusType[] = [
				"awaiting_transfer",
				"transferring",
				"swapping",
				"awaiting_fill",
				"claim_available",
				"refund_available",
				"receiving_funds",
				"trade_settled",
			];

			for (const key of tradeStatuses) {
				if (key in data) {
					args.onStatus(key, data[key]);
					return;
				}
			}
		};

		if (!this.listeners.has(subId)) {
			this.listeners.set(subId, new Set());
		}
		this.listeners.get(subId)!.add(handler);

		return () => {
			const set = this.listeners.get(subId);
			if (set) {
				set.delete(handler);
				if (set.size === 0) {
					this.listeners.delete(subId);
				}
			}
		};
	}

	private async rpc(
		method: string,
		params: object,
		timeoutMs = 30000
	): Promise<any> {
		await this.connect();

		const id = ++this.rpcId;
		if (this.rpcId > 999999) this.rpcId = 1;

		let timeoutHandle: ReturnType<typeof setTimeout>;

		const result = await new Promise<any>((resolve, reject) => {
			this.pendingRpcs.set(id, { resolve, reject });

			timeoutHandle = setTimeout(() => {
				if (this.pendingRpcs.has(id)) {
					this.pendingRpcs.delete(id);
					reject(
						new Error(
							`Omniston RPC "${method}" timed out after ${timeoutMs}ms`
						)
					);
				}
			}, timeoutMs);

			try {
				this.sendRaw({
					jsonrpc: "2.0",
					id,
					method,
					params,
				});
			} catch (e) {
				clearTimeout(timeoutHandle);
				this.pendingRpcs.delete(id);
				reject(e);
			}
		});

		clearTimeout(timeoutHandle!);
		return result;
	}
}

function extractQuote(
	data: unknown,
	depth = 0
): Quote | null {
	const MAX_DEPTH = 10;

	if (!data || typeof data !== "object") return null;
	if (depth > MAX_DEPTH) return null;
	if (Array.isArray(data)) return null;

	const q = data as Record<string, unknown>;
	if (
		q.quote_id &&
		q.bid_units &&
		q.ask_units &&
		q.params &&
		typeof q.params === "object" &&
		(q.params as Record<string, unknown>)?.swap
	) {
		return data as Quote;
	}

	for (const key of Object.keys(q)) {
		const value = q[key];
		if (value && typeof value === "object" && !Array.isArray(value)) {
			const found = extractQuote(value, depth + 1);
			if (found) return found;
		}
	}

	return null;
}

export function createOmnistonClient(
	mode: "mainnet" | "testnet" | "devnet" = "mainnet"
): OmnistonClient {
	const url =
		mode === "mainnet" ? OMNISTON_WS_URL : OMNISTON_WS_URL_SANDBOX;
	return new OmnistonClient(url);
}

export const omniston = new OmnistonClient();
