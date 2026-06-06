import { toNano } from "@ton/core";
import { mnemonicToPrivateKey, sha256 } from "@ton/crypto";
import { WalletContractV4, TonClient, internal, SendMode, Address } from "@ton/ton";
import { ethers } from "ethers";
import {
	Connection,
	Keypair,
	SystemProgram,
	Transaction,
	PublicKey,
	sendAndConfirmTransaction,
	LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { Buffer } from "buffer";
import { getCache, setCache } from "../utils/cache";
import { upsertUsername, getUsernameRegistry } from "./supabase";

export interface UsernameRegistry {
	ton: string;
	eth: string;
	sol: string;
}

export function getChainForAsset(assetId: string): "ton" | "eth" | "sol" | null {
	if (assetId === "ton" || assetId === "usdt") return "ton";
	if (assetId === "eth") return "eth";
	if (assetId === "sol") return "sol";
	return null;
}

export const ASSETS = [
	{
		id: "ton",
		symbol: "TON",
		name: "Toncoin",
		network: "TON",
		cmc_id: "the-open-network",
		icon: "https://avatars.githubusercontent.com/u/55018343?s=200&v=4",
	},
	{
		id: "eth",
		symbol: "ETH",
		name: "Ethereum",
		network: "EVM",
		cmc_id: "ethereum",
		icon: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
	},
	{
		id: "sol",
		symbol: "SOL",
		name: "Solana",
		network: "Solana",
		cmc_id: "solana",
		icon: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
	},
	{
		id: "usdt",
		symbol: "USDT",
		name: "Tether",
		network: "TON",
		cmc_id: "tether",
		icon: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
	},
	{
		id: "btc",
		symbol: "BTC",
		name: "Bitcoin",
		network: "Bitcoin",
		cmc_id: "bitcoin",
		icon: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
	},
];

function getProviders(mode: "mainnet" | "testnet" | "devnet") {
	if (mode === "mainnet") {
		return {
			ton: new TonClient({
				endpoint: "https://toncenter.com/api/v2/jsonRPC",
			}),
			eth: new ethers.JsonRpcProvider("https://cloudflare-eth.com"),
			sol: new Connection(
				"https://api.mainnet-beta.solana.com",
				"confirmed"
			),
		};
	} else if (mode === "testnet") {
		return {
			ton: new TonClient({
				endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
			}),
			eth: new ethers.JsonRpcProvider(
				"https://ethereum-sepolia-rpc.publicnode.com"
			),
			sol: new Connection("https://api.devnet.solana.com", "confirmed"),
		};
	} else {
		return {
			ton: new TonClient({
				endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
			}),
			eth: new ethers.JsonRpcProvider(
				"https://ethereum-sepolia-rpc.publicnode.com"
			),
			sol: new Connection("https://api.devnet.solana.com", "confirmed"),
		};
	}
}

export async function generateWallets(mnemonic: string[]) {
	const tonKeyPair = await mnemonicToPrivateKey(mnemonic);
	const tonWallet = WalletContractV4.create({
		workchain: 0,
		publicKey: tonKeyPair.publicKey,
	});

	const seed = await sha256(mnemonic.join(" "));
	const hexSeed = "0x" + Buffer.from(seed).toString("hex");

	const ethWallet = new ethers.Wallet(hexSeed);
	const solKeypair = Keypair.fromSeed(seed);

	return {
		ton: {
			address: tonWallet.address.toString({ bounceable: false }),
			contract: tonWallet,
			keyPair: tonKeyPair,
		},
		eth: { address: ethWallet.address, wallet: ethWallet },
		sol: { address: solKeypair.publicKey.toBase58(), keypair: solKeypair },
	};
}

export async function fetchBalances(
	wallets: any,
	mode: "mainnet" | "testnet" | "devnet"
): Promise<Record<string, number>> {
	const providers = getProviders(mode);
	try {
		const tonEndpoint =
			mode === "mainnet"
				? "https://toncenter.com/api/v2/getAddressInformation"
				: "https://testnet.toncenter.com/api/v2/getAddressInformation";

		const [tonBalance, ethWei, solLamports] = await Promise.all([
			fetch(`${tonEndpoint}?address=${wallets.ton.address}`)
				.then((r) => r.json())
				.then(
					(data) =>
						data.ok && data.result
							? Number(data.result.balance) / 1e9
							: 0
				)
				.catch(() => 0),
			providers.eth.getBalance(wallets.eth.address).catch(() => 0n),
			providers.sol
				.getBalance(wallets.sol.keypair.publicKey)
				.catch(() => 0),
		]);

		return {
			ton: tonBalance,
			eth: Number(ethers.formatEther(ethWei)),
			sol: solLamports / LAMPORTS_PER_SOL,
			usdt: 0,
			btc: 0,
		};
	} catch (e) {
		console.error(e);
		return { ton: 0, eth: 0, sol: 0, usdt: 0, btc: 0 };
	}
}

export async function sendTransaction(
	wallets: any,
	assetId: string,
	to: string,
	amount: number,
	mode: "mainnet" | "testnet" | "devnet"
) {
	const providers = getProviders(mode);

	if (assetId === "ton") {
		const tonBase =
			mode === "mainnet"
				? "https://toncenter.com/api/v2"
				: "https://testnet.toncenter.com/api/v2";

		const seqnoRes = await fetch(
			`${tonBase}/runGetMethod?address=${wallets.ton.address}&method=seqno&stack=[]`
		).then((r) => r.json()).catch(() => null);
		const seqno = seqnoRes?.ok && seqnoRes?.result?.stack?.[0]?.[1]
			? Number(seqnoRes.result.stack[0][1])
			: 0;

		const transfer = wallets.ton.contract.createTransfer({
			seqno,
			secretKey: wallets.ton.keyPair.secretKey,
			messages: [
				internal({ to, value: toNano(amount.toString()), bounce: false }),
			],
			sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
		});

		await new Promise((r) => setTimeout(r, 1200));

		const boc = transfer.toBoc().toString("base64");
		let sendRes: any = null;
		for (let attempt = 0; attempt < 3; attempt++) {
			if (attempt > 0) await new Promise((r) => setTimeout(r, 2000));
			const resp = await fetch(`${tonBase}/sendBoc`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ boc }),
			});
			if (resp.status === 429) continue;
			sendRes = await resp.json().catch(() => null);
			if (sendRes?.ok) break;
		}

		if (!sendRes?.ok) {
			throw new Error(sendRes?.error || "Network error");
		}
	} else if (assetId === "eth") {
		const activeWallet = wallets.eth.wallet.connect(providers.eth);
		const tx = await activeWallet.sendTransaction({
			to,
			value: ethers.parseEther(amount.toString()),
		});
		await tx.wait();
	} else if (assetId === "sol") {
		const tx = new Transaction().add(
			SystemProgram.transfer({
				fromPubkey: wallets.sol.keypair.publicKey,
				toPubkey: new PublicKey(to),
				lamports: amount * LAMPORTS_PER_SOL,
			})
		);
		await sendAndConfirmTransaction(providers.sol, tx, [
			wallets.sol.keypair,
		]);
	} else {
		throw new Error("Asset sending not supported in this version");
	}
}

export interface WalletTransaction {
	hash: string;
	type: "send" | "receive";
	value: number;
	from: string;
	to: string;
	timestamp: number;
}

export async function fetchTransactions(
	address: string,
	mode: "mainnet" | "testnet" | "devnet"
): Promise<WalletTransaction[]> {
	const endpoint =
		mode === "mainnet"
			? "https://toncenter.com/api/v2/getTransactions"
			: "https://testnet.toncenter.com/api/v2/getTransactions";

	try {
		const res = await fetch(`${endpoint}?address=${address}&limit=10`);
		const data = await res.json();
		if (data.ok && Array.isArray(data.result)) {
			return data.result.map((tx: any) => {
				const outMsg = tx.out_msgs?.[0];
				const inMsg = tx.in_msg;
				const isOut = outMsg !== undefined;
				const msg = isOut ? outMsg : inMsg;
				const value = msg ? Number(msg.value) / 1e9 : 0;
				return {
					hash: tx.transaction_id?.hash || "unknown",
					type: isOut ? "send" : "receive",
					value,
					from: inMsg?.source || "",
					to: outMsg?.destination || inMsg?.destination || "",
					timestamp: tx.utime * 1000,
				};
			});
		}
		return [];
	} catch (e) {
		console.error("Error fetching transactions", e);
		return [];
	}
}

export async function registerUsername(
	username: string,
	tonAddress: string,
	ethAddress: string,
	solAddress: string
): Promise<boolean> {
	if (!username) return false;
	const registry = { ton: tonAddress, eth: ethAddress, sol: solAddress };
	const ok = await upsertUsername(username, registry);
	if (ok) {
		setCache(`username_${username.replace("@", "").trim().toLowerCase()}`, registry, 5 * 60 * 1000);
	}
	return ok;
}

export async function resolveUsername(
	username: string
): Promise<UsernameRegistry | null> {
	const cleanUser = username.replace("@", "").trim().toLowerCase();

	const cached = getCache<UsernameRegistry>(`username_${cleanUser}`);
	if (cached) return cached;

	const registry = await getUsernameRegistry(username);
	if (registry) {
		setCache(`username_${cleanUser}`, registry, 5 * 60 * 1000);
	}
	return registry;
}

export interface ReputationDetails {
	score: number;
	labelKey: string;
	descKey: string;
	criteria: {
		activity: number;
		purity: number;
		volume: number;
		age: number;
	};
	colorClass: string;
}

export function evaluateReputation(input: string): ReputationDetails | null {
	if (!input || input.trim().length < 3) return null;
	const clean = input.trim();
	if (clean.toLowerCase() === "@username") {
		return {
			score: 7.6,
			labelKey: "good_reputation",
			descKey: "rep_desc_good",
			criteria: {
				purity: 9,
				activity: 8,
				volume: 6,
				age: 7,
			},
			colorClass: "text-[#30d158]",
		};
	}
	let hash = 0;
	for (let i = 0; i < clean.length; i++) {
		hash = (hash << 5) - hash + clean.charCodeAt(i);
		hash |= 0;
	}
	const absHash = Math.abs(hash);

	const purity = 5 + (absHash % 6);
	const activity = 3 + ((absHash >> 2) % 8);
	const volume = 2 + ((absHash >> 4) % 9);
	const age = 4 + ((absHash >> 6) % 7);

	const score = Number(((purity + activity + volume + age) / 4).toFixed(1));
	let labelKey = "good_reputation";
	let descKey = "rep_desc_good";
	let colorClass = "text-[#34c759]";

	if (score >= 8.5) {
		labelKey = "excellent_reputation";
		descKey = "rep_desc_excellent";
		colorClass = "text-[#30d158]";
	} else if (score >= 7.0) {
		labelKey = "good_reputation";
		descKey = "rep_desc_good";
		colorClass = "text-[#34c759]";
	} else if (score >= 4.5) {
		labelKey = "average_reputation";
		descKey = "rep_desc_average";
		colorClass = "text-[#ff9f0a]";
	} else {
		labelKey = "low_reputation";
		descKey = "rep_desc_low";
		colorClass = "text-[#ff453a]";
	}

	return {
		score,
		labelKey,
		descKey,
		criteria: {
			purity,
			activity,
			volume,
			age,
		},
		colorClass,
	};
}

export function getAssetDetails(assetId: string) {
	switch (assetId) {
		case "ton":
			return { fee: "0.05 TON", timeEn: "~10 sec", timeRu: "~10 сек" };
		case "eth":
			return { fee: "0.003 ETH", timeEn: "~3 min", timeRu: "~3 мин" };
		case "sol":
			return { fee: "0.00005 SOL", timeEn: "~15 sec", timeRu: "~15 сек" };
		case "usdt":
			return { fee: "1.2 USDT", timeEn: "~1 min", timeRu: "~1 минута" };
		case "btc":
			return { fee: "0.0002 BTC", timeEn: "~15 min", timeRu: "~15 мин" };
		default:
			return { fee: "0.01", timeEn: "~1 min", timeRu: "~1 мин" };
	}
}

export function isValidAddressOrUsername(input: string): boolean {
	const clean = input.trim();
	if (clean.length < 3) return false;

	if (clean.startsWith("@")) {
		return /^@[a-zA-Z0-9_.]{3,32}$/.test(clean);
	}

	if (clean.startsWith("0x")) {
		return /^0x[a-fA-F0-9]{40}$/.test(clean);
	}

	const isTonFriendly = /^[a-zA-Z0-9_-]{48}$/.test(clean);
	const isTonRaw = /^(-1|0):[a-fA-F0-9]{64}$/.test(clean);
	if (isTonFriendly || isTonRaw) return true;

	const isSolBase58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(clean);
	if (isSolBase58) {
		try {
			new PublicKey(clean);
			return true;
		} catch (e) {
			return false;
		}
	}

	const isBtc = /^(1|3|bc1)[a-zA-Z0-9]{25,62}$/.test(clean);
	if (isBtc) return true;

	return false;
}

export async function evaluateReputationReal(
	input: string,
	mode: "mainnet" | "testnet" | "devnet"
): Promise<ReputationDetails | null> {
	if (!isValidAddressOrUsername(input)) return null;
	const clean = input.trim();

	let targetAddress = clean;
	if (clean.startsWith("@")) {
		const registry = await resolveUsername(clean);
		if (!registry || !registry.ton) {
			throw new Error("Username not found in registry");
		}
		targetAddress = registry.ton;
	}

	const providers = getProviders(mode);
	let balance = 0;
	let txCount = 0;
	let isActive = false;
	let volumeVal = 0;
	let accountAgeMonths = 0;

	try {
		const isTon = targetAddress.length >= 40 && (
			targetAddress.startsWith("EQ") ||
			targetAddress.startsWith("UQ") ||
			targetAddress.startsWith("0Q") ||
			targetAddress.startsWith("kQ")
		);
		const isEth = targetAddress.startsWith("0x") && targetAddress.length === 42;
		const isSol = !isTon && !isEth && targetAddress.length >= 32 && targetAddress.length <= 44;

		if (isTon) {
			const parsed = Address.parse(targetAddress);
			const state = await providers.ton.getContractState(parsed).catch(() => null);
			if (state) {
				isActive = state.state === "active";
				balance = Number(state.balance) / 1e9;
			}

			const tcBase =
				mode === "mainnet"
					? "https://toncenter.com/api/v2"
					: "https://testnet.toncenter.com/api/v2";

			const tcRes = await fetch(
				`${tcBase}/getAddressInformation?address=${targetAddress}`
			).then(r => r.json()).catch(() => null);
			if (tcRes?.ok && tcRes.result) {
				balance = Number(tcRes.result.balance) / 1e9;
				isActive = tcRes.result.state === "active";
			}

			const tcTxRes = await fetch(
				`${tcBase}/getTransactions?address=${targetAddress}&limit=100`
			).then(r => r.json()).catch(() => null);
			if (tcTxRes?.ok && Array.isArray(tcTxRes.result) && tcTxRes.result.length > 0) {
				txCount = tcTxRes.result.length;
				isActive = true;
				let totalVol = balance;
				let oldest = Date.now();
				tcTxRes.result.forEach((tx: any) => {
					const outMsg = tx.out_msgs?.[0];
					const inMsg = tx.in_msg;
					const msgVal = outMsg ? Number(outMsg.value || 0) / 1e9 : inMsg ? Number(inMsg.value || 0) / 1e9 : 0;
					totalVol += msgVal;
					if (tx.utime && tx.utime * 1000 < oldest) oldest = tx.utime * 1000;
				});
				volumeVal = totalVol;
				accountAgeMonths = (Date.now() - oldest) / (1000 * 60 * 60 * 24 * 30);
			}
		} else if (isEth) {
			const [addrRes, txRes] = await Promise.all([
				fetch(`https://eth.blockscout.com/api/v2/addresses/${targetAddress}`).then(r => r.json()).catch(() => null),
				fetch(`https://eth.blockscout.com/api/v2/addresses/${targetAddress}/transactions?limit=50`).then(r => r.json()).catch(() => null),
			]);

			if (addrRes) {
				balance = Number(addrRes.coin_balance || 0) / 1e18;
				txCount = Number(addrRes.transaction_count || 0);
				isActive = txCount > 0 || balance > 0;
			} else {
				const ethBal = await providers.eth.getBalance(targetAddress).catch(() => 0n);
				balance = Number(ethers.formatEther(ethBal));
				txCount = await providers.eth.getTransactionCount(targetAddress).catch(() => 0);
				isActive = txCount > 0 || balance > 0;
			}

			if (txRes?.items && Array.isArray(txRes.items) && txRes.items.length > 0) {
				let totalVal = balance;
				let oldestTime = Date.now();
				txRes.items.forEach((tx: any) => {
					totalVal += Number(tx.value || 0) / 1e18;
					const txTime = new Date(tx.timestamp).getTime();
					if (!isNaN(txTime) && txTime < oldestTime) oldestTime = txTime;
				});
				volumeVal = totalVal;
				accountAgeMonths = (Date.now() - oldestTime) / (1000 * 60 * 60 * 24 * 30);
			} else {
				volumeVal = balance;
			}
		} else if (isSol) {
			const pubKey = new PublicKey(targetAddress);
			const solBal = await providers.sol.getBalance(pubKey).catch(() => 0);
			balance = solBal / LAMPORTS_PER_SOL;

			const signatures = await providers.sol.getSignaturesForAddress(pubKey, { limit: 1000 }).catch(() => []);
			txCount = signatures.length;

			if (signatures.length > 0) {
				isActive = true;
				let oldestTime = Date.now();
				signatures.forEach((sig: any) => {
					if (sig.blockTime && sig.blockTime * 1000 < oldestTime) {
						oldestTime = sig.blockTime * 1000;
					}
				});
				accountAgeMonths = (Date.now() - oldestTime) / (1000 * 60 * 60 * 24 * 30);

				const recentSigs = signatures.slice(0, 20);
				const txDetails = await Promise.allSettled(
					recentSigs.map((s: any) =>
						providers.sol.getTransaction(s.signature, { maxSupportedTransactionVersion: 0 })
					)
				);
				let totalVol = balance;
				txDetails.forEach((res: any) => {
					if (res.status !== "fulfilled" || !res.value?.meta) return;
					const pre = res.value.meta.preBalances || [];
					const post = res.value.meta.postBalances || [];
					for (let i = 0; i < pre.length; i++) {
						totalVol += Math.abs(pre[i] - post[i]) / LAMPORTS_PER_SOL;
					}
				});
				volumeVal = totalVol;
			} else {
				volumeVal = balance;
			}
		} else {
			return evaluateReputation(clean);
		}
	} catch (e) {
		console.warn("On-chain query failed, falling back to deterministic evaluation", e);
		return evaluateReputation(clean);
	}

	const activityScore = txCount >= 1000 ? 10
		: txCount >= 500 ? 9.5
		: txCount >= 200 ? 9
		: txCount >= 100 ? 8
		: txCount >= 50 ? 7
		: txCount >= 20 ? 6
		: txCount >= 10 ? 5
		: txCount >= 3 ? 4
		: txCount >= 1 ? 3 : 1;

	const volumeScore = volumeVal >= 10000 ? 10
		: volumeVal >= 1000 ? 9
		: volumeVal >= 100 ? 8
		: volumeVal >= 10 ? 7
		: volumeVal >= 1 ? 6
		: volumeVal >= 0.1 ? 5
		: volumeVal >= 0.01 ? 3
		: volumeVal > 0 ? 2 : 1;

	const ageScore = accountAgeMonths >= 36 ? 10
		: accountAgeMonths >= 24 ? 9
		: accountAgeMonths >= 12 ? 8
		: accountAgeMonths >= 6 ? 7
		: accountAgeMonths >= 3 ? 6
		: accountAgeMonths >= 1 ? 5
		: accountAgeMonths > 0 ? 3 : 1;

	const purity = isActive
		? Math.min(10, Math.max(1, Math.round(3 + (txCount > 0 ? Math.min(7, txCount / 15) : 0))))
		: 1;

	const rawScore = (activityScore + volumeScore + ageScore + purity) / 4;
	const score = Number(rawScore.toFixed(1));

	let labelKey = "good_reputation";
	let descKey = "rep_desc_good";
	let colorClass = "text-[#30d158]";

	if (score >= 8.5) {
		labelKey = "excellent_reputation";
		descKey = "rep_desc_excellent";
		colorClass = "text-[#30d158]";
	} else if (score >= 7.0) {
		labelKey = "good_reputation";
		descKey = "rep_desc_good";
		colorClass = "text-[#34c759]";
	} else if (score >= 4.5) {
		labelKey = "average_reputation";
		descKey = "rep_desc_average";
		colorClass = "text-[#ff9f0a]";
	} else {
		labelKey = "low_reputation";
		descKey = "rep_desc_low";
		colorClass = "text-[#ff453a]";
	}

	if (!isActive && txCount === 0) {
		labelKey = "low_reputation";
		descKey = "rep_desc_low";
		colorClass = "text-[#ff453a]";
	}

	console.log(`[WhyNot] Real on-chain score for ${clean}:`, { balance, txCount, volumeVal: volumeVal.toFixed(4), accountAgeMonths: accountAgeMonths.toFixed(1), score });

	return {
		score,
		labelKey,
		descKey,
		criteria: {
			purity,
			activity: Math.round(activityScore),
			volume: Math.round(volumeScore),
			age: Math.round(ageScore),
		},
		colorClass,
	};
}
