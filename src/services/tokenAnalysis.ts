import { getCache, setCache } from "../utils/cache";

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
const DEXSCREENER_BASE = "https://api.dexscreener.com/latest/dex";

export interface TokenCandidate {
	coingeckoId: string;
	symbol: string;
	name: string;
	marketCapRank: number | null;
	thumb?: string;
	priceUsd?: number;
	change24h?: number;
	marketCap?: number;
	totalVolume24h?: number;
	circulatingSupply?: number;
	totalSupply?: number;
	ath?: number;
	atl?: number;
	descriptionEn?: string;
	descriptionRu?: string;
	homepage?: string;
	dexTopPair?: {
		chainId: string;
		dexId: string;
		url: string;
		priceUsd?: string;
		liquidityUsd?: number;
		volume24h?: number;
		fdv?: number;
		pairAddress?: string;
		baseToken?: { address: string; name: string; symbol: string };
		quoteToken?: { address: string; name: string; symbol: string };
	};
	dexPairCount: number;
}

export interface TokenAnalysisResult {
	query: string;
	resolvedAt: number;
	candidates: TokenCandidate[];
	bestMatch: TokenCandidate | null;
	error?: string;
}

function translateDescription(desc: Record<string, string> | undefined): {
	en?: string;
	ru?: string;
} {
	if (!desc) return {};
	const en = desc.en?.replace(/<[^>]+>/g, "").trim();
	let ru: string | undefined;
	const ruRaw = desc.ru || desc["ru-RU"];
	if (ruRaw) {
		ru = ruRaw.replace(/<[^>]+>/g, "").trim();
	}
	return { en, ru };
}

async function fetchWithTimeout(
	url: string,
	timeoutMs: number = 12000
): Promise<Response> {
	const c = new AbortController();
	const id = setTimeout(() => c.abort(), timeoutMs);
	try {
		return await fetch(url, { signal: c.signal });
	} finally {
		clearTimeout(id);
	}
}

async function searchCoinGecko(query: string): Promise<any[]> {
	const cacheKey = `aicg_search_${query.toLowerCase()}`;
	const cached = getCache<any[]>(cacheKey);
	if (cached) return cached;
	const r = await fetchWithTimeout(
		`${COINGECKO_BASE}/search?query=${encodeURIComponent(query)}`
	);
	if (!r.ok) {
		if (r.status === 429) {
			throw new Error("CoinGecko rate limit (try again in a minute)");
		}
		throw new Error(`CoinGecko search ${r.status}`);
	}
	const j = await r.json();
	const coins = Array.isArray(j?.coins) ? j.coins : [];
	setCache(cacheKey, coins, 5 * 60_000);
	return coins;
}

async function fetchCoinDetails(coingeckoId: string): Promise<any | null> {
	const cacheKey = `aicg_coin_${coingeckoId}`;
	const cached = getCache<any>(cacheKey);
	if (cached) return cached;
	try {
		const r = await fetchWithTimeout(
			`${COINGECKO_BASE}/coins/${encodeURIComponent(coingeckoId)}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`
		);
		if (!r.ok) return null;
		const j = await r.json();
		setCache(cacheKey, j, 5 * 60_000);
		return j;
	} catch {
		return null;
	}
}

async function fetchDexScreener(symbolOrContract: string): Promise<any[]> {
	const cacheKey = `aids_search_${symbolOrContract.toLowerCase()}`;
	const cached = getCache<any[]>(cacheKey);
	if (cached) return cached;
	try {
		const r = await fetchWithTimeout(
			`${DEXSCREENER_BASE}/search?q=${encodeURIComponent(symbolOrContract)}`
		);
		if (!r.ok) return [];
		const j = await r.json();
		const pairs = Array.isArray(j?.pairs) ? j.pairs : [];
		setCache(cacheKey, pairs, 5 * 60_000);
		return pairs;
	} catch {
		return [];
	}
}

function bestDexPair(pairs: any[]): any | null {
	if (!pairs.length) return null;
	const scored = pairs
		.filter((p) => p?.liquidity?.usd && p.liquidity.usd > 0)
		.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));
	return scored[0] || pairs[0];
}

function isAddress(s: string): boolean {
	if (/^0x[a-fA-F0-9]{40}$/.test(s)) return true;
	if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s) && !/^[A-Z]+$/.test(s)) {
		return true;
	}
	if (/^(EQ|UQ|0Q|kQ)[A-Za-z0-9_-]{40,}$/.test(s)) return true;
	return false;
}

export async function analyzeToken(
	query: string
): Promise<TokenAnalysisResult> {
	const trimmed = query.trim();
	const cacheKey = `ai_analyze_${trimmed.toLowerCase()}`;
	const cached = getCache<TokenAnalysisResult>(cacheKey);
	if (cached) return cached;
	if (!trimmed) {
		return {
			query: "",
			resolvedAt: Date.now(),
			candidates: [],
			bestMatch: null,
			error: "Empty query",
		};
	}

	try {
		let coins: any[] = [];
		if (isAddress(trimmed)) {
			const pairs = await fetchDexScreener(trimmed);
			const symbolGuess = pairs[0]?.baseToken?.symbol;
			if (symbolGuess) {
				coins = await searchCoinGecko(symbolGuess);
			} else {
				coins = [];
			}
		} else {
			coins = await searchCoinGecko(trimmed);
		}

		const top = coins.slice(0, 5);
		if (!top.length) {
			return {
				query: trimmed,
				resolvedAt: Date.now(),
				candidates: [],
				bestMatch: null,
				error: "No tokens found on CoinGecko",
			};
		}

		const candidates: TokenCandidate[] = await Promise.all(
			top.map(async (c) => {
				const [details, dexPairs] = await Promise.all([
					fetchCoinDetails(c.id),
					fetchDexScreener((c.symbol || c.id).toUpperCase()),
				]);
				const md = details?.market_data;
				const desc = translateDescription(details?.description);
				const topPair = bestDexPair(dexPairs);
				return {
					coingeckoId: c.id,
					symbol: c.symbol,
					name: c.name,
					marketCapRank: c.market_cap_rank ?? null,
					thumb: c.thumb || details?.image?.thumb,
					priceUsd: md?.current_price?.usd,
					change24h: md?.price_change_percentage_24h,
					marketCap: md?.market_cap?.usd,
					totalVolume24h: md?.total_volume?.usd,
					circulatingSupply: md?.circulating_supply,
					totalSupply: md?.total_supply,
					ath: md?.ath?.usd,
					atl: md?.atl?.usd,
					descriptionEn: desc.en,
					descriptionRu: desc.ru,
					homepage: details?.links?.homepage?.[0],
					dexTopPair: topPair
						? {
								chainId: topPair.chainId,
								dexId: topPair.dexId,
								url: topPair.url,
								priceUsd: topPair.priceUsd,
								liquidityUsd: topPair.liquidity?.usd,
								volume24h: topPair.volume?.h24,
								fdv: topPair.fdv,
								pairAddress: topPair.pairAddress,
								baseToken: topPair.baseToken,
								quoteToken: topPair.quoteToken,
							}
						: undefined,
					dexPairCount: dexPairs.length,
				};
			})
		);

		candidates.sort((a, b) => {
			const ra = a.marketCapRank ?? 99999;
			const rb = b.marketCapRank ?? 99999;
			return ra - rb;
		});

		const bestMatch = candidates[0] || null;
		const result: TokenAnalysisResult = {
			query: trimmed,
			resolvedAt: Date.now(),
			candidates,
			bestMatch,
		};
		setCache(cacheKey, result, 5 * 60_000);
		return result;
	} catch (e: any) {
		const result: TokenAnalysisResult = {
			query: trimmed,
			resolvedAt: Date.now(),
			candidates: [],
			bestMatch: null,
			error: e?.message || "Unknown error",
		};
		setCache(cacheKey, result, 60_000);
		return result;
	}
}

export function formatTokenAnalysisCompact(result: TokenAnalysisResult): string {
	if (result.error && !result.bestMatch) {
		return JSON.stringify({
			error: result.error,
			query: result.query,
		});
	}
	const top = result.bestMatch;
	if (!top) {
		return JSON.stringify({ error: "No token data", query: result.query });
	}
	const compact = {
		symbol: top.symbol,
		name: top.name,
		coingeckoId: top.coingeckoId,
		rank: top.marketCapRank,
		priceUsd: top.priceUsd,
		change24hPct: top.change24h
			? Number(top.change24h.toFixed(2))
			: undefined,
		marketCapUsd: top.marketCap,
		volume24hUsd: top.totalVolume24h,
		circulatingSupply: top.circulatingSupply,
		totalSupply: top.totalSupply,
		dexLiquidityUsd: top.dexTopPair?.liquidityUsd,
		dexVolume24hUsd: top.dexTopPair?.volume24h,
		dexChain: top.dexTopPair?.chainId,
		dexUrl: top.dexTopPair?.url,
		dexPairCount: top.dexPairCount,
		homepage: top.homepage,
		descEn: top.descriptionEn?.slice(0, 600),
		descRu: top.descriptionRu?.slice(0, 600),
		otherCandidates: result.candidates.slice(1, 3).map((c) => ({
			symbol: c.symbol,
			name: c.name,
			rank: c.marketCapRank,
		})),
	};
	return JSON.stringify(compact);
}
