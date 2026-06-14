import { mnemonicToPrivateKey, sha256 } from "@ton/crypto";
import { WalletContractV4, TonClient, internal, SendMode, Address, Cell } from "@ton/ton";
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
import { getCache, setCache, cachedFetch, removeCache } from "../utils/cache";
import { upsertUsername, getUsernameRegistry } from "./supabase";

const TONCENTER_KEY = import.meta.env.VITE_TONCENTER_KEY ?? "";

const TONCENTER_BASE = {
	mainnet: "https://toncenter.com/api/v2",
	testnet: "https://testnet.toncenter.com/api/v2",
	devnet: "https://testnet.toncenter.com/api/v2",
} as const;

function toncenterFetch(
	url: string,
	params: Record<string, string> = {},
	init: RequestInit = {}
): Promise<Response> {
	const searchParams = new URLSearchParams(params);
	const headers = new Headers(init.headers);
	if (TONCENTER_KEY) {
		headers.set("X-API-Key", TONCENTER_KEY);
	}
	const fullUrl =
		Object.keys(params).length > 0
			? `${url}?${searchParams.toString()}`
			: url;
	return fetch(fullUrl, { ...init, headers });
}

function withTimeout<T>(
	promise: Promise<T>,
	ms: number,
	fallback: T
): Promise<T> {
	return Promise.race([
		promise,
		new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
	]);
}

export interface WalletSet {
	ton: {
		address: string;
		contract: import("@ton/ton").WalletContractV4;
		keyPair: import("@ton/crypto").KeyPair;
	};
	eth: {
		address: string;
		wallet: import("ethers").Wallet;
	};
	sol: {
		address: string;
		keypair: import("@solana/web3.js").Keypair;
	};
}

export function clearWalletSecrets(wallets: WalletSet | null): void {
	if (!wallets) return;
	wallets.ton.keyPair.secretKey.fill(0);
	wallets.sol.keypair.secretKey.fill(0);
	// ethers stores its private key as an immutable JS string, which cannot be
	// overwritten reliably. Dropping all references is the best available action.
}

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

function amountToSmallestUnit(amount: number): bigint {
	if (!Number.isFinite(amount) || amount < 0) return BigInt(0);
	const str = amount.toFixed(9);
	const parts = str.split(".");
	if (parts.length === 1) return BigInt(parts[0]) * BigInt(1_000_000_000);
	const intPart = parts[0];
	const fracPart = parts[1].slice(0, 9).padEnd(9, "0");
	return BigInt(intPart) * BigInt(1_000_000_000) + BigInt(fracPart);
}

export const ASSETS = [
	{
		id: "whynot",
		symbol: "WhyNot",
		name: "WhyNot Token",
		network: "TON",
		cmc_id: "whynot",
		icon: "https://i.ibb.co/fz63qR23/photo-2026-05-28-22-00-53.jpg",
		decimals: 9,
		swappable: false,
	},
	{
		id: "ton",
		symbol: "TON",
		name: "Toncoin",
		network: "TON",
		cmc_id: "the-open-network",
		icon: "https://avatars.githubusercontent.com/u/55018343?s=200&v=4",
		address: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
		decimals: 9,
		swappable: true,
		chainId: 85918,
		symbiosisAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
	},
	{
		id: "eth",
		symbol: "ETH",
		name: "Ethereum",
		network: "EVM",
		cmc_id: "ethereum",
		icon: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
		decimals: 18,
		swappable: false,
		chainId: 1,
		symbiosisAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
	},
	{
		id: "sol",
		symbol: "SOL",
		name: "Solana",
		network: "Solana",
		cmc_id: "solana",
		icon: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
		decimals: 9,
		swappable: false,
		chainId: 5426,
		symbiosisAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
	},
	{
		id: "usdt",
		symbol: "USDT",
		name: "Tether",
		network: "TON",
		cmc_id: "tether",
		icon: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
		address: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
		decimals: 6,
		swappable: true,
		chainId: 85918,
		symbiosisAddress: "0x9328Eb759596C38a25f59028B146Fecdc3621Dfe",
	},
	{
		id: "btc",
		symbol: "BTC",
		name: "Bitcoin",
		network: "Bitcoin",
		cmc_id: "bitcoin",
		icon: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
		decimals: 8,
		swappable: false,
		chainId: 3652501241,
		symbiosisAddress: "0x1dfc1e32d75b3f4cb2f2b1bcecad984e99eeba05",
	},
];

const providerCache: Record<string, any> = {};

export function resetProviders(): void {
	Object.keys(providerCache).forEach((key) => delete providerCache[key]);
}

function getProviders(mode: "mainnet" | "testnet" | "devnet") {
	if (providerCache[mode]) return providerCache[mode];
	if (mode === "mainnet") {
		return (providerCache[mode] = {
			ton: new TonClient({
				endpoint: "https://toncenter.com/api/v2/jsonRPC",
			}),
			eth: new ethers.JsonRpcProvider("https://cloudflare-eth.com"),
			sol: new Connection(
				"https://api.mainnet-beta.solana.com",
				"finalized"
			),
		});
	} else if (mode === "testnet") {
		return (providerCache[mode] = {
			ton: new TonClient({
				endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
			}),
			eth: new ethers.JsonRpcProvider(
				"https://ethereum-sepolia-rpc.publicnode.com"
			),
			sol: new Connection("https://api.devnet.solana.com", "confirmed"),
		});
	} else {
		return (providerCache[mode] = {
			ton: new TonClient({
				endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
			}),
			eth: new ethers.JsonRpcProvider(
				"https://ethereum-sepolia-rpc.publicnode.com"
			),
			sol: new Connection("https://api.devnet.solana.com", "confirmed"),
		});
	}
}

export async function generateWallets(mnemonic: string[]): Promise<WalletSet> {
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
	wallets: WalletSet,
	mode: "mainnet" | "testnet" | "devnet"
): Promise<Record<string, number>> {
	const providers = getProviders(mode);
	try {
		const [tonBalance, ethWei, solLamports] = await Promise.all([
			withTimeout(
				toncenterFetch(
					`${TONCENTER_BASE[mode]}/getAddressInformation`,
					{ address: wallets.ton.address }
				)
					.then((r) => r.json())
					.then((data) =>
						data.ok && data.result
							? Number(data.result.balance) / 1e9
							: 0
					)
					.catch(() => 0),
				8000,
				0
			),
			withTimeout(
				providers.eth.getBalance(wallets.eth.address).catch((e: any) => {
					console.error(
						"[fetchBalances] ETH balance fetch failed:",
						e?.message ?? e
					);
					return 0n;
				}),
				8000,
				0n
			),
			withTimeout(
				providers.sol
					.getBalance(wallets.sol.keypair.publicKey)
					.catch((e: any) => {
						console.error(
							"[fetchBalances] SOL balance fetch failed:",
							e?.message ?? e
						);
						return 0;
					}),
				8000,
				0
			),
		]);

		return {
			whynot: 0,
			ton: tonBalance,
			eth: Number.parseFloat(ethers.formatEther(ethWei).slice(0, 20)),
			sol: solLamports / LAMPORTS_PER_SOL,
			usdt: 0,
			btc: 0,
		};
	} catch (e) {
		console.error(e);
		return { whynot: 0, ton: 0, eth: 0, sol: 0, usdt: 0, btc: 0 };
	}
}

export async function sendTransaction(
	wallets: WalletSet,
	assetId: string,
	to: string,
	amount: number,
	mode: "mainnet" | "testnet" | "devnet"
) {
	const providers = getProviders(mode);

	if (assetId === "ton") {
		const contract = providers.ton.open(wallets.ton.contract);
		let seqno: number;
		try {
			seqno = await contract.getSeqno();
		} catch {
			throw new Error(
				"Failed to fetch wallet sequence number. Check your connection and try again."
			);
		}
		await contract.sendTransfer({
			seqno,
			secretKey: wallets.ton.keyPair.secretKey,
			messages: [
				internal({ to: Address.parse(to), value: amountToSmallestUnit(amount), bounce: true }),
			],
			sendMode: SendMode.PAY_GAS_SEPARATELY,
		});
		removeCache(`txs_${mode}_${wallets.ton.address}`);
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
				lamports: Number(amountToSmallestUnit(amount)),
			})
		);
		await sendAndConfirmTransaction(providers.sol, tx, [
			wallets.sol.keypair,
		]);
	} else {
		throw new Error("Asset sending not supported in this version");
	}
}

export interface OmnistonTransferMessage {
	target_address: string;
	send_amount: string;
	payload: string;
}

export interface SymbiosisTransaction {
	to: string;
	data: string;
	value: string;
	chainId: number;
	approveTo?: string;
	approveData?: string;
	approveValue?: string;
	fromTokenAddress: string;
}

export async function executeSymbiosisSwap(
	wallets: WalletSet,
	symbTx: SymbiosisTransaction,
	sourceChain: "eth" | "ton" | "sol" | "btc",
	mode: "mainnet" | "testnet" | "devnet"
): Promise<{ txHash: string; explorerUrl: string }> {
	const providers = getProviders(mode);

	if (sourceChain === "eth") {
		const activeWallet = wallets.eth.wallet.connect(providers.eth);

		if (symbTx.approveTo && symbTx.approveData) {
			const ALLOWED_CONTRACTS = [
				"0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
				"0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
				"0x9328Eb759596C38a25f59028B146Fecdc3621Dfe",
			];
			const normalizedApproveTo = symbTx.approveTo.toLowerCase();
			const normalizedAllowlist = ALLOWED_CONTRACTS.map((a) =>
				a.toLowerCase()
			);
			if (!normalizedAllowlist.includes(normalizedApproveTo)) {
				throw new Error(
					`Transaction blocked: approveTo address ${symbTx.approveTo} is not in the allowlist`
				);
			}
			const approveTx = await activeWallet.sendTransaction({
				to: symbTx.approveTo,
				data: symbTx.approveData,
				value: symbTx.approveValue ?? "0x0",
			});
			await approveTx.wait();
		}

		const tx = await activeWallet.sendTransaction({
			to: symbTx.to,
			data: symbTx.data,
			value: symbTx.value,
		});
		const receipt = await tx.wait();
		const hash = receipt?.hash ?? tx.hash;
		return {
			txHash: hash,
			explorerUrl: `https://etherscan.io/tx/${hash}`,
		};
	}

	if (sourceChain === "ton") {
		const contract = providers.ton.open(wallets.ton.contract);
		let seqno: number;
		try {
			seqno = await contract.getSeqno();
		} catch {
			throw new Error(
				"Failed to fetch wallet sequence number. Check your connection and try again."
			);
		}
		const transfer = contract.createTransfer({
			seqno,
			secretKey: wallets.ton.keyPair.secretKey,
			messages: [
				internal({
					to: Address.parse(symbTx.to),
					value: BigInt(symbTx.value || "0"),
					bounce: true,
					body: (() => {
						let cells: Cell[];
						try {
							cells = Cell.fromBoc(
								Buffer.from(symbTx.data, "base64")
							);
						} catch {
							throw new Error(
								"Invalid swap payload: cannot parse TON cell data"
							);
						}
						if (cells.length !== 1) {
							throw new Error(
								`Swap payload BOC must contain exactly 1 root cell, got ${cells.length}`
							);
						}
						return cells[0];
					})(),
				}),
			],
			sendMode: SendMode.PAY_GAS_SEPARATELY,
		});
		const txHash = transfer.message.hash().toString("hex");
		const boc = transfer.message.toBoc(false);
		const bocBase64 = Buffer.from(boc).toString("base64");
		const endpoint = `${TONCENTER_BASE[mode]}/sendBoc`;
		const res = await toncenterFetch(endpoint, {}, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ boc: bocBase64 }),
		});
		if (!res.ok) {
			throw new Error(`Toncenter sendBoc failed: ${res.status}`);
		}
		const data = await res.json().catch(() => ({}));
		if (data && data.ok === false) {
			throw new Error(
				`Toncenter rejected: ${data.error || "unknown error"}`
			);
		}
		return {
			txHash,
			explorerUrl: `https://tonviewer.com/transaction/${txHash}`,
		};
	}

	throw new Error(
		`Symbiosis execution not implemented for source chain: ${sourceChain}`
	);
}

export async function executeSwap(
	wallets: WalletSet,
	messages: OmnistonTransferMessage[],
	mode: "mainnet" | "testnet" | "devnet"
): Promise<{ txHash: string }> {
	const providers = getProviders(mode);
	const contract = providers.ton.open(wallets.ton.contract);

	let seqno: number;
	try {
		seqno = await contract.getSeqno();
	} catch {
		throw new Error(
			"Failed to fetch wallet sequence number. Check your connection and try again."
		);
	}

	const internalMessages = messages.map((m) => {
		let body: Cell | undefined;
		if (m.payload) {
			let cells: Cell[];
			try {
				cells = Cell.fromBoc(Buffer.from(m.payload, "base64"));
			} catch {
				throw new Error(
					`Invalid payload format for message to ${m.target_address}`
				);
			}
			if (cells.length !== 1) {
				throw new Error(
					`Payload BOC must contain exactly 1 root cell, got ${cells.length}`
				);
			}
			body = cells[0];
		}
		return internal({
			to: Address.parse(m.target_address),
			value: BigInt(m.send_amount),
			bounce: true,
			body,
		});
	});

	const transfer = contract.createTransfer({
		seqno,
		secretKey: wallets.ton.keyPair.secretKey,
		messages: internalMessages,
		sendMode: SendMode.PAY_GAS_SEPARATELY,
	});

	const txHash = transfer.message.hash().toString("hex");
	const boc = transfer.message.toBoc(false);
	const bocBase64 = Buffer.from(boc).toString("base64");

	const endpoint = `${TONCENTER_BASE[mode]}/sendBoc`;

	const res = await toncenterFetch(endpoint, {}, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ boc: bocBase64 }),
	});

	if (!res.ok) {
		throw new Error(`Toncenter sendBoc failed: ${res.status}`);
	}

	const data = await res.json().catch(() => ({}));
	if (data && data.ok === false) {
		throw new Error(
			`Toncenter rejected the transaction: ${data.error || "unknown error"}`
		);
	}

	return { txHash };
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
	const cacheKey = `txs_${mode}_${address}`;
	return cachedFetch(
		cacheKey,
		async () => {
			try {
				const res = await toncenterFetch(
					`${TONCENTER_BASE[mode]}/getTransactions`,
					{ address, limit: "10" }
				);
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
		},
		30_000
	);
}

export async function registerUsername(
	username: string,
	tonAddress: string,
	ethAddress: string,
	solAddress: string
): Promise<boolean> {
	if (!username) return false;
	const registryEndpoint = import.meta.env.VITE_USERNAME_REGISTRY_ENDPOINT;
	if (!registryEndpoint || !registryEndpoint.trim()) {
		console.warn(
			"Username registry writes are disabled until a verified backend endpoint is configured"
		);
		return false;
	}
	const cleanUser = username.replace("@", "").trim().toLowerCase();
	const cached = getCache<UsernameRegistry>(`username_${cleanUser}`);
	if (cached && cached.ton === tonAddress && cached.eth === ethAddress && cached.sol === solAddress) {
		return true;
	}
	const existing = await getUsernameRegistry(username);
	if (existing && existing.ton === tonAddress && existing.eth === ethAddress && existing.sol === solAddress) {
		setCache(`username_${cleanUser}`, existing, 5 * 60 * 1000);
		return true;
	}
	const registry = { ton: tonAddress, eth: ethAddress, sol: solAddress };
	const ok = await upsertUsername(username, registry);
	if (ok) {
		setCache(`username_${cleanUser}`, registry, 5 * 60 * 1000);
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
		try {
			return ethers.getAddress(clean) === clean || ethers.getAddress(clean).toLowerCase() === clean.toLowerCase();
		} catch {
			return false;
		}
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
			const state = await providers.ton
				.getContractState(parsed)
				.catch(() => null);
			if (state) {
				isActive = state.state === "active";
				balance = Number(state.balance) / 1e9;
			}

			const [tcRes, tcTxRes] = await Promise.all([
				toncenterFetch(
					`${TONCENTER_BASE[mode]}/getAddressInformation`,
					{ address: targetAddress }
				)
					.then((r) => r.json())
					.catch(() => null),
				toncenterFetch(`${TONCENTER_BASE[mode]}/getTransactions`, {
					address: targetAddress,
					limit: "100",
				})
					.then((r) => r.json())
					.catch(() => null),
			]);

			if (tcRes?.ok && tcRes.result) {
				balance = Number(tcRes.result.balance) / 1e9;
				isActive = tcRes.result.state === "active";
			}

			if (
				tcTxRes?.ok &&
				Array.isArray(tcTxRes.result) &&
				tcTxRes.result.length > 0
			) {
				txCount = tcTxRes.result.length;
				isActive = true;
				let totalVol = 0;
				let oldest = Date.now();
				tcTxRes.result.forEach((tx: any) => {
					const outMsg = tx.out_msgs?.[0];
					const inMsg = tx.in_msg;
					const msgVal = outMsg
						? Number(outMsg.value || 0) / 1e9
						: inMsg
						? Number(inMsg.value || 0) / 1e9
						: 0;
					totalVol += msgVal;
					if (tx.utime && tx.utime * 1000 < oldest)
						oldest = tx.utime * 1000;
				});
				volumeVal = totalVol;
				accountAgeMonths =
					(Date.now() - oldest) / (1000 * 60 * 60 * 24 * 30);
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
				let totalVal = 0;
				let oldestTime = Date.now();
				txRes.items.forEach((tx: any) => {
					totalVal += Number(tx.value || 0) / 1e18;
					const txTime = new Date(tx.timestamp).getTime();
					if (!isNaN(txTime) && txTime < oldestTime) oldestTime = txTime;
				});
				volumeVal = totalVal;
				accountAgeMonths = (Date.now() - oldestTime) / (1000 * 60 * 60 * 24 * 30);
			} else {
				volumeVal = 0;
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
				let totalVol = 0;
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
				volumeVal = 0;
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

	if (import.meta.env.DEV) {
		console.debug(`[WhyNot] On-chain score computed:`, { score });
	}

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
