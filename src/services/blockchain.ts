import { mnemonicToPrivateKey, sha256 } from "@ton/crypto";
import { WalletContractV4, TonClient, internal, SendMode } from "@ton/ton";
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

export const ASSETS = [
	{
		id: "ton",
		symbol: "TON",
		name: "Toncoin",
		network: "TON",
		cmc_id: "the-open-network",
		icon: "/icons/ton.png",
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
		const [tonNano, ethWei, solLamports] = await Promise.all([
			providers.ton
				.getBalance(wallets.ton.contract.address)
				.catch(() => 0n),
			providers.eth.getBalance(wallets.eth.address).catch(() => 0n),
			providers.sol
				.getBalance(wallets.sol.keypair.publicKey)
				.catch(() => 0),
		]);

		return {
			ton: Number(tonNano) / 1e9,
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
		const contract = providers.ton.open(wallets.ton.contract);
		let seqno = await contract.getSeqno().catch(() => 0);
		await contract.sendTransfer({
			seqno,
			secretKey: wallets.ton.keyPair.secretKey,
			messages: [
				internal({ to, value: amount.toString(), bounce: false }),
			],
			sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
		});
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

export async function registerUsername(username: string, tonAddress: string) {
	if (!username) return;
	const cleanUser = username.replace("@", "").trim().toLowerCase();
	try {
		await fetch(`https://kvdb.io/7zR8mWhynotWalletRegistry/${cleanUser}`, {
			method: "POST",
			body: tonAddress,
		});
		console.log(`Username @${cleanUser} registered to ${tonAddress}`);
	} catch (e) {
		console.error("Failed to register username", e);
	}
}

export async function resolveUsername(username: string): Promise<string> {
	const cleanUser = username.replace("@", "").trim().toLowerCase();
	try {
		const res = await fetch(
			`https://kvdb.io/7zR8mWhynotWalletRegistry/${cleanUser}`
		);
		if (res.ok) {
			const address = await res.text();
			if (
				address &&
				(address.startsWith("EQ") ||
					address.startsWith("UQ") ||
					address.startsWith("0Q") ||
					address.startsWith("kQ"))
			) {
				return address;
			}
		}
		throw new Error("Not found");
	} catch (e) {
		throw new Error("Username not found in registry");
	}
}
