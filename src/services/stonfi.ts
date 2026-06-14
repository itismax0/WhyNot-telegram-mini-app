import { cachedFetch } from "../utils/cache";

const STONFI_API = "https://api.ston.fi";

async function stonFetch(
	url: string,
	options: RequestInit = {},
	timeoutMs = 10000
): Promise<Response> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const res = await fetch(url, { ...options, signal: controller.signal });
		clearTimeout(timer);
		return res;
	} catch (e: any) {
		clearTimeout(timer);
		if (e.name === "AbortError") {
			throw new Error(`STON.fi API timeout after ${timeoutMs}ms: ${url}`);
		}
		throw e;
	}
}

export type StonfiAssetKind = "Ton" | "Jetton";

export interface StonfiAsset {
	contractAddress: string;
	kind: StonfiAssetKind;
	symbol: string;
	displayName: string;
	imageUrl: string;
	decimals: number;
	dexPriceUsd: string | null;
	popularityIndex: number;
	tags: string[];
	community: boolean;
	blacklisted: boolean;
	deprecated: boolean;
}

interface RawAsset {
	contract_address: string;
	kind: StonfiAssetKind;
	meta: {
		symbol: string;
		display_name: string;
		image_url: string;
		decimals: number;
	};
	dex_price_usd?: string;
	popularity_index: number;
	tags: string[];
	community?: boolean;
	blacklisted?: boolean;
	deprecated?: boolean;
}

interface RawAssetsResponse {
	asset_list: RawAsset[];
}

function normalizeAsset(raw: RawAsset): StonfiAsset {
	return {
		contractAddress: raw.contract_address,
		kind: raw.kind,
		symbol: raw.meta?.symbol ?? "",
		displayName: raw.meta?.display_name ?? raw.meta?.symbol ?? "",
		imageUrl: raw.meta?.image_url ?? "",
		decimals:
			Number.isInteger(raw.meta?.decimals) &&
			raw.meta!.decimals > 0 &&
			raw.meta!.decimals <= 18
				? raw.meta!.decimals
				: 9,
		dexPriceUsd: raw.dex_price_usd ?? null,
		popularityIndex: Number.isFinite(raw.popularity_index)
			? raw.popularity_index
			: 0,
		tags: Array.isArray(raw.tags) ? raw.tags : [],
		community: raw.community ?? false,
		blacklisted: raw.blacklisted ?? false,
		deprecated: raw.deprecated ?? false,
	};
}

export const POPULAR_TOKEN_ADDRESSES: string[] = [
	"EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
	"EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
	"EQAvlWFDxGF2lXm67y4yzC17wYKD9A0guwPkMs1gOsM__NOT",
	"EQCuPm01HldiduQ55xaBF_1kaW_WAUy5DHey8suqzU_MAJOR",
	"EQCvxJy4eG8hyHBFsZ7eePxrRsUQSFE_jpptRAYBmcG_DOGS",
];

const ASSETS_CACHE_KEY = "stonfi_assets_v1";
const ASSETS_CACHE_TTL = import.meta.env.DEV
	? 60 * 1000
	: 15 * 60 * 1000;

export async function fetchAllAssets(): Promise<StonfiAsset[]> {
	return cachedFetch(
		ASSETS_CACHE_KEY,
		async () => {
			const seen = new Set<string>();
			const all: RawAsset[] = [];
			const limit = 200;
			const maxIterations = 8;
			let offset = 0;
			for (let i = 0; i < maxIterations; i++) {
				const body = JSON.stringify({
					offset,
					limit,
					sort_by: ["popularity_index:desc"],
					condition: "!no_liquidity&!deprecated",
				});
				let res: Response;
				try {
					res = await stonFetch(
						`${STONFI_API}/v1/assets/query`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body,
						}
					);
				} catch (e: any) {
					if (all.length > 0) {
						console.warn(
							`[STON.fi] Pagination stopped at page ${i}:`,
							e.message
						);
						break;
					}
					throw e;
				}
				if (!res.ok) {
					if (all.length > 0) {
						console.warn(
							`[STON.fi] Pagination stopped at page ${i}, HTTP ${res.status}`
						);
						break;
					}
					throw new Error(`STON.fi /v1/assets/query ${res.status}`);
				}
				const data = (await res.json()) as RawAssetsResponse;
				const list = Array.isArray(data?.asset_list)
					? data.asset_list
					: [];
				let newOnes = 0;
				for (const item of list) {
					if (
						item?.contract_address &&
						!seen.has(item.contract_address)
					) {
						seen.add(item.contract_address);
						all.push(item);
						newOnes++;
					}
				}
				if (newOnes === 0 || list.length < limit) break;
				offset += limit;
			}
			return all.map(normalizeAsset);
		},
		ASSETS_CACHE_TTL
	);
}

export async function fetchAssetByAddress(
	address: string
): Promise<StonfiAsset | null> {
	const clean = address.trim();
	if (!clean) return null;
	if (!isValidJettonAddress(clean)) return null;
	try {
		const res = await stonFetch(
			`${STONFI_API}/v1/assets/${encodeURIComponent(clean)}`
		);
		if (!res.ok) return null;
		const data = await res.json();
		const raw: RawAsset | undefined = data?.asset;
		if (!raw) return null;
		return normalizeAsset(raw);
	} catch {
		return null;
	}
}

export function filterSwapableAssets(
	assets: StonfiAsset[],
	options: { includeCommunity?: boolean } = {}
): StonfiAsset[] {
	return assets.filter(
		(a) =>
			!a.deprecated &&
			!a.blacklisted &&
			(options.includeCommunity || !a.community) &&
			a.contractAddress.length > 0 &&
			a.decimals > 0 &&
			a.decimals <= 18 &&
			a.symbol.length > 0
	);
}

export function searchAssets(
	assets: StonfiAsset[],
	query: string,
	limit = 50
): StonfiAsset[] {
	const q = query.trim().toLowerCase().slice(0, 100);
	if (!q) return [];
	const tokens = q.split(/\s+/).filter(Boolean).slice(0, 5);
	if (tokens.length === 0) return [];
	return assets
		.filter((a) => {
			const hay = `${a.symbol} ${a.displayName} ${a.contractAddress}`.toLowerCase();
			return tokens.every((t) => hay.includes(t));
		})
		.slice(0, limit);
}

export interface SimulateSwapResponse {
	offer_address: string;
	ask_address: string;
	offer_jetton_wallet: string;
	ask_jetton_wallet: string;
	router_address: string;
	router: string;
	pool_address: string;
	offer_units: string;
	ask_units: string;
	slippage_tolerance: string;
	min_ask_units: string;
	recommended_slippage_tolerance: string;
	recommended_min_ask_units: string;
	swap_rate: string;
	price_impact: string;
	fee_address: string;
	fee_units: string;
	fee_percent: string;
	gas_params: Record<string, unknown>;
}

export async function simulateSwap(args: {
	offerAddress: string;
	askAddress: string;
	units: string;
	slippageTolerance?: string;
	poolAddress?: string;
}): Promise<SimulateSwapResponse | null> {
	const params = new URLSearchParams({
		offer_address: args.offerAddress,
		ask_address: args.askAddress,
		units: args.units,
		slippage_tolerance: args.slippageTolerance ?? "0.01",
	});
	if (args.poolAddress) {
		params.set("pool_address", args.poolAddress);
	}
	try {
		const res = await stonFetch(
			`${STONFI_API}/v1/swap/simulate?${params.toString()}`,
			{ method: "POST" }
		);
		if (!res.ok) return null;
		const data = await res.json();
		if (!data || typeof data.ask_units !== "string") return null;
		return data as SimulateSwapResponse;
	} catch {
		return null;
	}
}

export function isValidJettonAddress(input: string): boolean {
	const clean = input.trim();
	if (!clean) return false;
	// Friendly TON address (48 chars, valid prefix)
	if (/^[A-Za-z0-9_-]{48}$/.test(clean) && /^(EQ|UQ|kQ|0Q|Ef|Uf|kf|0f)/.test(clean)) return true;
	// Raw TON address (workchain:hex)
	if (/^(-1|0):[a-fA-F0-9]{64}$/.test(clean)) return true;
	// EVM address (0x + 40 hex)
	if (/^0x[a-fA-F0-9]{40}$/.test(clean)) return true;
	return false;
}
