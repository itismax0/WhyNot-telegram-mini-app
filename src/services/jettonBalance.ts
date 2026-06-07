import { getCache, setCache } from "../utils/cache";
import { Cell } from "@ton/ton";

const TONCENTER_API = "https://toncenter.com/api/v2";
const TONCENTER_TESTNET_API = "https://testnet.toncenter.com/api/v2";

const JETTON_BALANCE_TTL = 30 * 1000;

const cacheKey = (
	master: string,
	owner: string,
	mode: string
) => `jbal_${mode}_${master}_${owner}`;

export async function fetchJettonBalance(
	jettonMaster: string,
	ownerAddress: string,
	mode: "mainnet" | "testnet" | "devnet" = "mainnet"
): Promise<number> {
	const master = jettonMaster.trim();
	const owner = ownerAddress.trim();
	if (!master || !owner) return 0;

	const cached = getCache<number>(cacheKey(master, owner, mode));
	if (cached !== null) return cached;

	const base = mode === "mainnet" ? TONCENTER_API : TONCENTER_TESTNET_API;

	try {
		const walletRes = await fetch(
			`${base}/runGetMethod?address=${encodeURIComponent(
				master
			)}&method=get_wallet_address&stack=${encodeURIComponent(
				`[["tvm.Slice", "${owner}"]]`
			)}`
		);
		if (!walletRes.ok) {
			throw new Error(`get_wallet_address ${walletRes.status}`);
		}
		const walletData = await walletRes.json();
		if (!walletData.ok || !Array.isArray(walletData.result?.stack)) {
			throw new Error("Invalid jetton wallet response");
		}
		const sliceValue = walletData.result.stack[0]?.[1]?.bytes;
		const jettonWalletAddress = sliceValue
			? await readAddressFromSlice(sliceValue)
			: null;
		if (!jettonWalletAddress) {
			setCache(cacheKey(master, owner, mode), 0, JETTON_BALANCE_TTL);
			return 0;
		}

		const balRes = await fetch(
			`${base}/getAddressBalance?address=${encodeURIComponent(
				jettonWalletAddress
			)}`
		);
		if (!balRes.ok) {
			throw new Error(`getAddressBalance ${balRes.status}`);
		}
		const balData = await balRes.json();
		const rawBalance = balData?.ok ? Number(balData.result || 0) : 0;

		const decimalsRes = await fetch(
			`${base}/getTokenData?address=${encodeURIComponent(master)}`
		);
		let decimals = 9;
		if (decimalsRes.ok) {
			const decimalsData = await decimalsRes.json();
			const decStr = decimalsData?.result?.jetton_content?.data?.decimals;
			if (decStr) decimals = Number(decStr);
		}

		const humanBalance = rawBalance / 10 ** decimals;
		setCache(
			cacheKey(master, owner, mode),
			humanBalance,
			JETTON_BALANCE_TTL
		);
		return humanBalance;
	} catch (e) {
		console.warn("fetchJettonBalance failed", master, e);
		setCache(cacheKey(master, owner, mode), 0, JETTON_BALANCE_TTL);
		return 0;
	}
}

async function readAddressFromSlice(b64: string): Promise<string | null> {
	try {
		const cell = Cell.fromBoc(Buffer.from(b64, "base64"))[0];
		const slice = cell.beginParse();
		const addr = slice.loadAddress();
		if (!addr) return null;
		return addr.toString({ bounceable: false });
	} catch {
		return null;
	}
}
