const SYMBIOSIS_API_BASE = "https://api.symbiosis.finance/crosschain";
const SYMBIOSIS_PARTNER_ID = "whynot-mini-app";

export const SYMBIOSIS_CHAIN = {
	ETH: 1,
	BSC: 56,
	POLYGON: 137,
	ARBITRUM: 42161,
	OPTIMISM: 10,
	BASE: 8453,
	TON: 85918,
	SOLANA: 5426,
	BTC: 3652501241,
} as const;

export const SYMBIOSIS_NATIVE_ADDRESS =
	"0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export interface SymbiosisToken {
	chainId: number;
	address: string;
	decimals: number;
	amount?: string;
}

export interface SymbiosisSwapRequest {
	tokenAmountIn: SymbiosisToken;
	tokenOut: SymbiosisToken;
	from: string;
	to: string;
	slippage: number;
}

export interface SymbiosisSwapResponse {
	fee: {
		symbol: string;
		address: string;
		amount: string;
		chainId: number;
		decimals: number;
		priceUsd: number;
	};
	tokenAmountOut: {
		symbol: string;
		address: string;
		amount: string;
		chainId: number;
		decimals: number;
		priceUsd: number;
	};
	tokenAmountOutMin: {
		symbol: string;
		address: string;
		amount: string;
		chainId: number;
		decimals: number;
		priceUsd: number;
	};
	approveTo: string;
	type: "evm" | "tron" | "ton" | "solana" | "btc";
	tx: {
		chainId: number;
		data: string;
		value?: string;
		to?: string;
		from?: string;
	};
	estimatedTime: number;
	priceImpact: string;
	route?: any[];
}

export interface SymbiosisStatusResponse {
	hashIn: { value: string };
	hashOut?: { value: string };
	status: "pending" | "success" | "refund" | "fail";
}

function needsV2(srcChainId: number, dstChainId: number): boolean {
	return srcChainId === SYMBIOSIS_CHAIN.BTC || dstChainId === SYMBIOSIS_CHAIN.BTC;
}

async function callApi<T>(
	path: string,
	method: "GET" | "POST",
	body?: unknown
): Promise<T> {
	const res = await fetch(SYMBIOSIS_API_BASE + path, {
		method,
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: body ? JSON.stringify(body) : undefined,
	});
	const text = await res.text();
	if (!res.ok) {
		throw new Error(
			`Symbiosis ${method} ${path} ${res.status}: ${text.substring(0, 200)}`
		);
	}
	try {
		return JSON.parse(text) as T;
	} catch {
		throw new Error(`Symbiosis ${path} returned non-JSON: ${text.substring(0, 100)}`);
	}
}

export async function getSymbiosisChains(): Promise<
	Array<{ id: number; name: string; explorer: string; icon: string }>
> {
	return callApi("/v1/chains", "GET");
}

export async function getSymbiosisTokens(): Promise<
	Array<{
		symbol: string;
		name: string;
		icon: string;
		address: string;
		chainId: number;
		decimals: number;
		priceUsd: number;
		attributes?: Record<string, string>;
	}>
> {
	return callApi("/v1/tokens", "GET");
}

export async function getSymbiosisSwap(
	req: SymbiosisSwapRequest
): Promise<SymbiosisSwapResponse> {
	const body = { ...req, partnerId: SYMBIOSIS_PARTNER_ID };
	const path = needsV2(req.tokenAmountIn.chainId, req.tokenOut.chainId)
		? "/v2/swap"
		: "/v1/swap";
	return callApi<SymbiosisSwapResponse>(path, "POST", body);
}

export async function getSymbiosisStatus(
	chainId: number,
	txHash: string
): Promise<SymbiosisStatusResponse | null> {
	try {
		return await callApi<SymbiosisStatusResponse>(
			`/v2/tx/${chainId}/${txHash}`,
			"GET"
		);
	} catch {
		return null;
	}
}

export interface SymbiosisChainInfo {
	id: number;
	name: string;
	explorer: string;
	icon: string;
}

let chainsCache: { data: SymbiosisChainInfo[]; ts: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000;

export async function getSymbiosisChainsCached(): Promise<SymbiosisChainInfo[]> {
	if (chainsCache && Date.now() - chainsCache.ts < CACHE_TTL) {
		return chainsCache.data;
	}
	const data = await getSymbiosisChains();
	chainsCache = { data, ts: Date.now() };
	return data;
}
