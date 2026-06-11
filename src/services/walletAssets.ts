export interface WalletAsset {
	id: string;
	address: string;
	symbol: string;
	name: string;
	icon: string;
	decimals: number;
	network: string;
	kind: "Ton" | "Jetton" | "External";
	priceUsd: number;
	optimisticBalance?: number;
}

export interface DiscoveredWalletAsset {
	asset: WalletAsset;
	balance: number;
}

const storageKey = (walletAddress: string, networkMode: string) =>
	`wallet_assets_${networkMode}_${walletAddress}`;

export function getWalletAssets(
	walletAddress: string,
	networkMode: string
): WalletAsset[] {
	if (!walletAddress) return [];
	try {
		const parsed = JSON.parse(
			localStorage.getItem(storageKey(walletAddress, networkMode)) || "[]"
		);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

export function addWalletAsset(
	walletAddress: string,
	networkMode: string,
	asset: WalletAsset
) {
	if (!walletAddress || !asset.address) return;
	const assets = getWalletAssets(walletAddress, networkMode);
	const existing = assets.findIndex(
		(item) => item.address.toLowerCase() === asset.address.toLowerCase()
	);
	const next =
		existing >= 0
			? assets.map((item, index) =>
					index === existing ? { ...item, ...asset } : item
				)
			: [...assets, asset];

	localStorage.setItem(storageKey(walletAddress, networkMode), JSON.stringify(next));
}

export function saveWalletAssets(
	walletAddress: string,
	networkMode: string,
	assets: WalletAsset[]
) {
	if (!walletAddress) return;
	localStorage.setItem(
		storageKey(walletAddress, networkMode),
		JSON.stringify(assets)
	);
}

export async function discoverTonJettons(
	walletAddress: string,
	networkMode: string
): Promise<DiscoveredWalletAsset[]> {
	if (!walletAddress || networkMode !== "mainnet") return [];

	const response = await fetch(
		`https://tonapi.io/v2/accounts/${encodeURIComponent(walletAddress)}/jettons`
	);
	if (!response.ok) {
		throw new Error(`TonAPI jettons ${response.status}`);
	}

	const data = await response.json();
	const balances = Array.isArray(data?.balances) ? data.balances : [];

	return balances.flatMap((item: any) => {
		const jetton = item?.jetton;
		const address = String(jetton?.address || "").trim();
		const decimals = Number(jetton?.decimals ?? 9);
		const rawBalance = String(item?.balance ?? "0");
		if (!address || !Number.isFinite(decimals)) return [];

		let balance = 0;
		try {
			balance = Number(BigInt(rawBalance)) / 10 ** decimals;
		} catch {
			return [];
		}
		if (!Number.isFinite(balance) || balance <= 0) return [];

		const priceUsd = Number(item?.price?.prices?.USD ?? 0);
		const symbol = String(jetton?.symbol || "JETTON").trim();

		return [
			{
				asset: {
					id: address,
					address,
					symbol,
					name: String(jetton?.name || symbol).trim(),
					icon: String(jetton?.image || ""),
					decimals,
					network: "TON",
					kind: "Jetton" as const,
					priceUsd: Number.isFinite(priceUsd) ? priceUsd : 0,
				},
				balance,
			},
		];
	});
}
