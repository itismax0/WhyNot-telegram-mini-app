import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
	ArrowDown,
	ArrowUp,
	ArrowUpDown,
	CheckCircle2,
	ChevronLeft,
	ChevronDown,
	Clock,
	Loader2,
	XCircle,
} from "lucide-react";
import { useWallet } from "../store/WalletContext";
import { addWalletAsset } from "../services/walletAssets";
import {
	executeSwap,
	executeSymbiosisSwap,
	fetchBalances,
	type WalletSet,
} from "../services/blockchain";
import {
	omniston,
	type Quote,
	type TradeStatusType,
} from "../services/omniston";
import {
	getSymbiosisSwap,
	getSymbiosisStatus,
	SYMBIOSIS_CHAIN,
	SYMBIOSIS_NATIVE_ADDRESS,
	type SymbiosisSwapResponse,
} from "../services/symbiosis";
import { TokenPickerModal, type SwapToken } from "./TokenPickerModal";
import { fetchJettonBalance } from "../services/jettonBalance";
import { simulateSwap } from "../services/stonfi";
import { formatFiat } from "../utils/fiat";

type QuoteState = "idle" | "loading" | "ready" | "no_quote" | "error";
type SwapStage = "form" | "submitting" | "tracking" | "success" | "error";

const SWAP_STATUS_LABELS_EN: Record<TradeStatusType, string> = {
	awaiting_transfer: "Waiting for transfer",
	transferring: "Transferring funds",
	swapping: "Swapping on DEX",
	awaiting_fill: "Awaiting fill",
	claim_available: "Claim available",
	refund_available: "Refund available",
	receiving_funds: "Receiving funds",
	trade_settled: "Trade settled",
};

const SWAP_STATUS_LABELS_RU: Record<TradeStatusType, string> = {
	awaiting_transfer: "Ожидание перевода",
	transferring: "Отправка средств",
	swapping: "Обмен через DEX",
	awaiting_fill: "Ожидание исполнения",
	claim_available: "Доступен клейм",
	refund_available: "Доступен возврат",
	receiving_funds: "Получение средств",
	trade_settled: "Обмен завершён",
};

const toUnits = (amount: string, decimals: number): string => {
	if (!amount || amount === "0") return "0";
	const n = Number(amount);
	if (!isFinite(n) || n <= 0) return "0";

	const [intPart, fracPart = ""] = amount.split(".");
	const paddedFrac = fracPart.slice(0, decimals).padEnd(decimals, "0");
	const result =
		BigInt(intPart) * BigInt(10) ** BigInt(decimals) + BigInt(paddedFrac);
	return result.toString();
};

const fromUnits = (units: string, decimals: number): number => {
	try {
		if (!units || units === "0") return 0;
		const big = BigInt(units);
		const divisor = BigInt(10) ** BigInt(decimals);
		const intPart = big / divisor;
		const fracPart = big % divisor;
		return Number(intPart) + Number(fracPart) / 10 ** decimals;
	} catch {
		return 0;
	}
};

const TON_NATIVE_TOKEN: SwapToken = {
	address: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
	symbol: "TON",
	name: "Toncoin",
	icon: "https://avatars.githubusercontent.com/u/55018343?s=200&v=4",
	decimals: 9,
	kind: "Ton",
	priceUsd: 0,
	popularityIndex: Number.MAX_SAFE_INTEGER,
	chainId: SYMBIOSIS_CHAIN.TON,
	symbiosisAddress: SYMBIOSIS_NATIVE_ADDRESS,
	sourceChain: "ton",
};

const USDT_JETTON_TOKEN: SwapToken = {
	address: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
	symbol: "USDT",
	name: "Tether",
	icon: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
	decimals: 6,
	kind: "Jetton",
	priceUsd: 0,
	popularityIndex: 100,
	chainId: SYMBIOSIS_CHAIN.TON,
	symbiosisAddress: "0x9328Eb759596C38a25f59028B146Fecdc3621Dfe",
	sourceChain: "ton",
};

const ADDRESS_TO_ID: Record<string, string> = {
	[TON_NATIVE_TOKEN.address]: "ton",
	[USDT_JETTON_TOKEN.address]: "usdt",
};

function getWalletAddressForToken(
	wallets: WalletSet | null,
	token: SwapToken
): string | null {
	const ch = tokenChain(token);
	if (ch === "ton") return wallets?.ton?.address ?? null;
	if (ch === "eth") return wallets?.eth?.address ?? null;
	if (ch === "sol") return wallets?.sol?.address ?? null;
	return null;
}

function tokenChain(t: SwapToken): "ton" | "eth" | "sol" | "btc" | null {
	if (t.sourceChain) return t.sourceChain;
	if (t.chainId === SYMBIOSIS_CHAIN.TON) return "ton";
	if (t.chainId === SYMBIOSIS_CHAIN.ETH) return "eth";
	if (t.chainId === SYMBIOSIS_CHAIN.SOLANA) return "sol";
	if (t.chainId === SYMBIOSIS_CHAIN.BTC) return "btc";
	if (t.kind === "Ton" || t.kind === "Jetton") return "ton";
	return null;
}

function isCrossChain(a: SwapToken, b: SwapToken): boolean {
	return (a.chainId ?? 0) !== (b.chainId ?? 0);
}

function isOmnistonCompatible(a: SwapToken, b: SwapToken): boolean {
	return (
		tokenChain(a) === "ton" &&
		tokenChain(b) === "ton" &&
		a.kind !== "External" &&
		b.kind !== "External"
	);
}

function canUseSymbiosis(a: SwapToken, b: SwapToken): boolean {
	return Boolean(a.chainId && b.chainId && a.symbiosisAddress && b.symbiosisAddress);
}

export const SwapView = () => {
	const {
		setView,
		wallets,
		balances,
		setBalances,
		rates,
		changes,
		language,
		showToast,
		networkMode,
		baseCurrency,
	} = useWallet();

	const [fromToken, setFromToken] = useState<SwapToken>(TON_NATIVE_TOKEN);
	const [toToken, setToToken] = useState<SwapToken>(USDT_JETTON_TOKEN);
	const [fromAmount, setFromAmount] = useState("");
	const [showFromPicker, setShowFromPicker] = useState(false);
	const [showToPicker, setShowToPicker] = useState(false);
	const [jettonBalances, setJettonBalances] = useState<
		Record<string, number>
	>({});

	const [quoteState, setQuoteState] = useState<QuoteState>("idle");
	const [quote, setQuote] = useState<Quote | null>(null);
	const [symbQuote, setSymbQuote] = useState<SymbiosisSwapResponse | null>(
		null
	);
	const [stonfiAskUnits, setStonfiAskUnits] = useState<string | null>(null);
	const [quoteError, setQuoteError] = useState<string | null>(null);

	const [stage, setStage] = useState<SwapStage>("form");
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [trackStatus, setTrackStatus] = useState<TradeStatusType | null>(
		null
	);
	const [txHash, setTxHash] = useState<string | null>(null);
	const [explorerUrl, setExplorerUrl] = useState<string | null>(null);
	const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
	const [swapResult, setSwapResult] = useState<{
		fromAmount: number;
		toAmount: number;
	} | null>(null);

	const cancelQuoteRef = useRef<{ cancelled: boolean }>({ cancelled: false });
	const unsubscribeTrackRef = useRef<(() => void) | null>(null);
	const isSubmittingRef = useRef(false);
	const jettonBalancesRef = useRef<Record<string, number>>({});
	const walletId = useMemo(
		() =>
			`${wallets?.ton?.address}_${wallets?.eth?.address}_${wallets?.sol?.address}`,
		[
			wallets?.ton?.address,
			wallets?.eth?.address,
			wallets?.sol?.address,
		]
	);
	const langRef = useRef(language);
	langRef.current = language;

	const fromId = ADDRESS_TO_ID[fromToken.address] ?? fromToken.address;
	const toId = ADDRESS_TO_ID[toToken.address] ?? toToken.address;
	const fromBalance =
		balances[fromId] ?? jettonBalances[fromToken.address] ?? 0;
	const toBalance = balances[toId] ?? jettonBalances[toToken.address] ?? 0;
	const fromRate = rates[fromId] ?? fromToken.priceUsd;
	const toRate = rates[toId] ?? toToken.priceUsd;

	const bidUnits = useMemo(
		() => toUnits(fromAmount, fromToken.decimals ?? 9),
		[fromAmount, fromToken.decimals]
	);

	const askUnits = quote?.ask_units ?? "0";
	const symbOutAmount = symbQuote?.tokenAmountOut?.amount ?? "0";
	const stonfiOutAmount = stonfiAskUnits ?? "0";
	const expectedToAmount = useMemo(
		() =>
			quote
				? fromUnits(askUnits, toToken.decimals ?? 6)
				: symbQuote
					? fromUnits(symbOutAmount, toToken.decimals ?? 6)
					: stonfiAskUnits
						? fromUnits(stonfiOutAmount, toToken.decimals ?? 6)
						: 0,
		[quote, symbQuote, stonfiAskUnits, askUnits, symbOutAmount, stonfiOutAmount, toToken.decimals]
	);
	const usdIn = useMemo(
		() => Number(fromAmount) * fromRate,
		[fromAmount, fromRate]
	);
	const usdOut = useMemo(
		() => expectedToAmount * toRate,
		[expectedToAmount, toRate]
	);
	const exchangeRate = useMemo(
		() =>
			Number(fromAmount) > 0 && expectedToAmount > 0
				? expectedToAmount / Number(fromAmount)
				: 0,
		[fromAmount, expectedToAmount]
	);

	const changePercent = changes[fromId] || 0;
	const isPositive = changePercent >= 0;

	useEffect(() => {
		return () => {
			cancelQuoteRef.current.cancelled = true;
			unsubscribeTrackRef.current?.();
		};
	}, []);

	useEffect(() => {
		if (!wallets?.ton?.address) return;
		if (
			fromToken.kind === "Ton" ||
			fromToken.address === USDT_JETTON_TOKEN.address
		)
			return;
		if (jettonBalancesRef.current[fromToken.address] !== undefined)
			return;

		let cancelled = false;
		fetchJettonBalance(fromToken.address, wallets.ton.address, networkMode)
			.then((bal) => {
				if (cancelled) return;
				jettonBalancesRef.current[fromToken.address] = bal;
				setJettonBalances((prev) => ({
					...prev,
					[fromToken.address]: bal,
				}));
			})
			.catch((e) => {
				if (import.meta.env.DEV) {
					console.warn(
						"Jetton balance fetch failed",
						fromToken.address,
						e
					);
				} else {
					console.warn(
						"Jetton balance fetch failed:",
						e?.message ?? "unknown"
					);
				}
			});
		return () => {
			cancelled = true;
		};
	}, [
		fromToken.address,
		fromToken.kind,
		wallets?.ton?.address,
		networkMode,
	]);

	useEffect(() => {
		if (!wallets?.ton?.address) return;
		if (
			toToken.kind === "Ton" ||
			toToken.address === USDT_JETTON_TOKEN.address
		)
			return;
		if (jettonBalancesRef.current[toToken.address] !== undefined) return;

		let cancelled = false;
		fetchJettonBalance(toToken.address, wallets.ton.address, networkMode)
			.then((bal) => {
				if (cancelled) return;
				jettonBalancesRef.current[toToken.address] = bal;
				setJettonBalances((prev) => ({
					...prev,
					[toToken.address]: bal,
				}));
			})
			.catch((e) =>
				console.warn("Jetton balance fetch failed", toToken.address, e)
			);
		return () => {
			cancelled = true;
		};
	}, [toToken.address, toToken.kind, wallets?.ton?.address, networkMode]);

	useEffect(() => {
		const token = { cancelled: false };
		cancelQuoteRef.current.cancelled = true;
		cancelQuoteRef.current = token;

		if (!fromAmount || Number(fromAmount) <= 0) {
			setQuote(null);
			setSymbQuote(null);
			setStonfiAskUnits(null);
			setQuoteState("idle");
			setQuoteError(null);
			setEstimatedTime(null);
			return;
		}

		if (
			!fromToken.address ||
			!toToken.address
		) {
			setQuoteState("error");
			setQuoteError(
				language === "ru" ? "Выберите токены" : "Select tokens"
			);
			return;
		}

		if (fromToken.kind === "External" && tokenChain(fromToken) === "btc") {
			setQuoteState("error");
			setQuoteError(
				language === "ru"
					? "BTC как исходный токен пока не поддерживается"
					: "BTC as source token is not supported yet"
			);
			return;
		}

		if (!wallets) {
			setQuoteState("idle");
			return;
		}

		const isOmniston = isOmnistonCompatible(fromToken, toToken);
		const isSymbiosis = canUseSymbiosis(fromToken, toToken);

		if (!isOmniston && !isSymbiosis) {
			setQuoteState("error");
			setQuoteError(
				language === "ru"
					? "Эта пара токенов пока не поддерживается"
					: "This pair is not supported yet"
			);
			return;
		}

		setQuoteState("loading");
		setQuote(null);
		setSymbQuote(null);
		setStonfiAskUnits(null);
		setQuoteError(null);
		setEstimatedTime(null);

		const timer = setTimeout(async () => {
			if (token.cancelled) return;

			let omnistonResult: Quote | null = null;
			let symbiosisResult: SymbiosisSwapResponse | null = null;
			let stonfiResult: string | null = null;

			if (isOmniston && wallets.ton?.address) {
				try {
					const result = await omniston.requestQuote({
						bidAddress: fromToken.address!,
						askAddress: toToken.address!,
						bidUnits,
						walletAddress: wallets.ton.address,
						slippageBps: 100,
					});
					if (token.cancelled) return;
					if (result && Number(result.ask_units) > 0) {
						omnistonResult = result;
					}
				} catch (e: any) {
					if (token.cancelled) return;
					if (import.meta.env.DEV) {
						console.error("Omniston quote error", e);
					} else {
						console.error("Omniston quote error:", e?.message ?? "unknown");
					}
				}
			}

			if (!omnistonResult && isSymbiosis) {
				try {
					const sourceWallet = getWalletAddressForToken(
						wallets,
						fromToken
					);
					const destWallet = getWalletAddressForToken(
						wallets,
						toToken
					);
					if (!sourceWallet || !destWallet) {
						setQuoteState("error");
						setQuoteError(
							langRef.current === "ru"
								? "Кошелёк для этой сети не найден"
								: "Wallet for this network not found"
						);
						return;
					}
					const result = await getSymbiosisSwap({
						tokenAmountIn: {
							chainId: fromToken.chainId!,
							address: fromToken.symbiosisAddress!,
							decimals: fromToken.decimals,
							amount: bidUnits,
						},
						tokenOut: {
							chainId: toToken.chainId!,
							address: toToken.symbiosisAddress!,
							decimals: toToken.decimals,
						},
						from: sourceWallet,
						to: destWallet,
						slippage: 300,
					});
					if (token.cancelled) return;
					if (
						result &&
						result.tokenAmountOut?.amount &&
						result.tokenAmountOut.amount !== "0"
					) {
						symbiosisResult = result;
					}
				} catch (e: any) {
					if (token.cancelled) return;
					if (import.meta.env.DEV) {
						console.error("Symbiosis quote error", e);
					} else {
						console.error("Symbiosis quote error:", e?.message ?? "unknown");
					}
				}
			}

			if (!omnistonResult && !symbiosisResult) {
				try {
					const result = await simulateSwap({
						offerAddress: fromToken.address!,
						askAddress: toToken.address!,
						units: bidUnits,
						slippageTolerance: "0.01",
					});
					if (token.cancelled) return;
					if (result && result.ask_units && Number(result.ask_units) > 0) {
						stonfiResult = result.ask_units;
					}
				} catch (e: any) {
					if (token.cancelled) return;
					if (import.meta.env.DEV) {
						console.error("STON.fi simulate error", e);
					} else {
						console.error("STON.fi simulate error:", e?.message ?? "unknown");
					}
				}
			}

			if (token.cancelled) return;

			if (omnistonResult) {
				setQuote(omnistonResult);
				setQuoteState("ready");
			} else if (symbiosisResult) {
				setSymbQuote(symbiosisResult);
				setEstimatedTime(symbiosisResult.estimatedTime);
				setQuoteState("ready");
			} else if (stonfiResult) {
				setStonfiAskUnits(stonfiResult);
				setQuoteState("ready");
			} else {
				setQuote(null);
				setSymbQuote(null);
				setStonfiAskUnits(null);
				setQuoteState("no_quote");
			}
		}, 500);

		return () => clearTimeout(timer);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		fromAmount,
		fromToken,
		toToken,
		bidUnits,
		walletId,
	]);

	const canContinue =
		quoteState === "ready" &&
		(!!quote || !!symbQuote || !!stonfiAskUnits) &&
		!isNaN(Number(fromAmount)) &&
		Number(fromAmount) > 0 &&
		Number(fromAmount) <= fromBalance &&
		(fromToken.address !== toToken.address ||
			fromToken.chainId !== toToken.chainId) &&
		stage === "form";

	const swapAssets = () => {
		const prev = fromToken;
		setFromToken(toToken);
		setToToken(prev);
		setFromAmount("");
		setShowFromPicker(false);
		setQuote(null);
		setSymbQuote(null);
		setQuoteState("idle");
		setQuoteError(null);
	};

	const handleMax = () => {
		const NETWORK_FEE_RESERVE: Partial<Record<string, number>> = {
			ton: 0.05,
			eth: 0.003,
			sol: 0.001,
		};
		const chain = tokenChain(fromToken);
		const reserve = (chain && NETWORK_FEE_RESERVE[chain]) ?? 0;
		const safeMax = Math.max(0, fromBalance - reserve);
		setFromAmount(safeMax > 0 ? safeMax.toFixed(6) : "0");
	};

	const handleContinue = async () => {
		if (isSubmittingRef.current) return;
		if (!canContinue || (!quote && !symbQuote) || !wallets) return;

		isSubmittingRef.current = true;
		setStage("submitting");
		setSubmitError(null);
		setTrackStatus("awaiting_transfer");
		setTxHash(null);
		setExplorerUrl(null);

		try {
			if (quote && wallets.ton?.address) {
				const messages = await omniston.buildTransfer(
					quote,
					wallets.ton.address
				);

				const { txHash } = await executeSwap(
					wallets,
					messages,
					networkMode
				);
				setTxHash(txHash);
				setStage("tracking");

				unsubscribeTrackRef.current?.();
				unsubscribeTrackRef.current = await omniston.trackTrade({
					quoteId: quote.quote_id,
					traderWalletAddress: wallets.ton.address,
					outgoingTxHash: txHash,
					onStatus: (status, data) => {
						setTrackStatus(status);
						if (status === "trade_settled") {
							const result = data?.result;
							if (result === 1 || result === 2) {
								if (
									toToken.kind === "Jetton" &&
									wallets.ton?.address &&
									!ADDRESS_TO_ID[toToken.address]
								) {
									addWalletAsset(wallets.ton.address, networkMode, {
										id: toToken.address,
										address: toToken.address,
										symbol: toToken.symbol,
										name: toToken.name,
										icon: toToken.icon,
										decimals: toToken.decimals,
										network: toToken.network || "TON",
										kind: toToken.kind,
										priceUsd: toToken.priceUsd,
										optimisticBalance: expectedToAmount,
									});
								}
								setSwapResult({
									fromAmount: Number(fromAmount),
									toAmount: expectedToAmount,
								});
								setStage("success");
								showToast(
									language === "ru"
										? "Обмен завершён"
										: "Swap completed"
								);
								fetchBalances(wallets, networkMode)
									.then(setBalances)
									.catch((e) => {
										if (import.meta.env.DEV) {
											console.error(
												"Swap balance fetch failed",
												e
											);
										} else {
											console.error(
												"Swap balance fetch failed:",
												e?.message ?? "unknown"
											);
										}
									});
							} else if (result === 3) {
								setSubmitError(
									language === "ru"
										? "Обмен отменён"
										: "Swap aborted"
								);
								setStage("error");
							}
						} else if (status === "refund_available") {
							setSubmitError(
								language === "ru"
									? "Транзакция истекла, средства можно вернуть"
									: "Transaction expired, refund available"
							);
							setStage("error");
						}
					},
					onError: (err) => {
						if (import.meta.env.DEV) {
							console.error("Trade track error", err);
						} else {
							console.error("Trade track error:", err?.message ?? "unknown");
						}
					},
				});
			} else if (symbQuote) {
				const sourceChain = (tokenChain(fromToken) ??
					"eth") as "eth" | "ton";
				const { txHash, explorerUrl } = await executeSymbiosisSwap(
					wallets,
					{
						to: symbQuote.tx.to ?? symbQuote.approveTo,
						data: symbQuote.tx.data,
						value: symbQuote.tx.value ?? "0x0",
						chainId: symbQuote.tx.chainId,
						approveTo: symbQuote.approveTo,
						approveData: symbQuote.approveTx?.data,
						fromTokenAddress: fromToken.symbiosisAddress!,
					},
					sourceChain,
					networkMode
				);
				setTxHash(txHash);
				setExplorerUrl(explorerUrl);
				setStage("tracking");
				setTrackStatus("transferring");

				const MAX_POLL_ATTEMPTS = 90; // 12 minutes
				let pollAttempts = 0;

				const pollInterval = setInterval(async () => {
					pollAttempts++;
					if (pollAttempts >= MAX_POLL_ATTEMPTS) {
						clearInterval(pollInterval);
						setSubmitError(
							language === "ru"
								? "Превышено время ожидания. Проверьте транзакцию в explorer."
								: "Timeout exceeded. Check your transaction in the explorer."
						);
						setStage("error");
						return;
					}

					try {
						const status = await getSymbiosisStatus(
							fromToken.chainId!,
							txHash
						);
						if (status?.status === "success") {
							clearInterval(pollInterval);
							if (
								toToken.kind === "Jetton" &&
								wallets.ton?.address &&
								!ADDRESS_TO_ID[toToken.address]
							) {
								addWalletAsset(wallets.ton.address, networkMode, {
									id: toToken.address,
									address: toToken.address,
									symbol: toToken.symbol,
									name: toToken.name,
									icon: toToken.icon,
									decimals: toToken.decimals,
									network: toToken.network || "TON",
									kind: toToken.kind,
									priceUsd: toToken.priceUsd,
									optimisticBalance: expectedToAmount,
								});
							}
							setSwapResult({
								fromAmount: Number(fromAmount),
								toAmount: expectedToAmount,
							});
							setStage("success");
							showToast(
								language === "ru"
									? "Обмен завершён"
									: "Swap completed"
							);
							fetchBalances(wallets, networkMode)
								.then(setBalances)
								.catch((e) =>
									console.error("Swap balance fetch failed", e)
								);
						} else if (
							status?.status === "refund" ||
							status?.status === "fail"
						) {
							clearInterval(pollInterval);
							setSubmitError(
								language === "ru"
									? "Транзакция не прошла, средства можно вернуть"
									: "Transaction failed, refund available"
							);
							setStage("error");
						}
					} catch (e) {
						console.warn("[Symbiosis] Status poll error, retrying:", e);
					}
				}, 8000);

				unsubscribeTrackRef.current?.();
				unsubscribeTrackRef.current = () => clearInterval(pollInterval);
			}
		} catch (e: any) {
			console.error("Swap failed", e);
			const rawMsg: string = e?.message ?? "";
			let userMsg: string;

			if (
				rawMsg.includes("user rejected") ||
				rawMsg.includes("User denied")
			) {
				userMsg =
					language === "ru"
						? "Транзакция отклонена"
						: "Transaction rejected";
			} else if (
				rawMsg.includes("insufficient funds") ||
				rawMsg.includes("Insufficient")
			) {
				userMsg =
					language === "ru"
						? "Недостаточно средств"
						: "Insufficient funds";
			} else if (
				rawMsg.includes("sequence number") ||
				rawMsg.includes("seqno")
			) {
				userMsg =
					language === "ru"
						? "Ошибка последовательности — повторите"
						: "Sequence error — please retry";
			} else {
				userMsg =
					language === "ru"
						? "Не удалось выполнить обмен"
						: "Swap failed";
			}

			setSubmitError(userMsg);
			setStage("error");
		} finally {
			isSubmittingRef.current = false;
		}
	};

	const handleBack = () => {
		if (stage === "success" || stage === "error") {
			unsubscribeTrackRef.current?.();
			unsubscribeTrackRef.current = null;
			setStage("form");
			setSubmitError(null);
			setTrackStatus(null);
			setSwapResult(null);
			setTxHash(null);
			return;
		}
		setView("main");
	};

	const renderAssetButton = (
		token: SwapToken,
		side: "from" | "to"
	) => (
		<button
			onClick={() => {
				if (side === "from") {
					setShowFromPicker(true);
					setShowToPicker(false);
				} else {
					setShowToPicker(true);
					setShowFromPicker(false);
				}
			}}
			className="flex items-center gap-2.5 bg-[#1c1c1e] hover:bg-[#252528] active:scale-95 px-4 py-3 rounded-[16px] border border-[#2c2c2e]/60 cursor-pointer transition-all"
		>
			<div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-[#0a0a0c]">
				<img
					src={token.icon}
					alt={token.symbol}
					className="w-full h-full object-contain"
					onError={(e) => {
						(e.currentTarget as HTMLImageElement).src =
							"https://avatars.githubusercontent.com/u/55018343?s=200&v=4";
					}}
				/>
			</div>
			<span className="font-bold text-[17px] text-white">
				{token.symbol}
			</span>
			<ChevronDown size={16} className="text-gray-400" />
		</button>
	);

	if (stage === "success" && swapResult) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="flex flex-col min-h-screen bg-black text-white p-5 pb-32 select-none"
			>
				<div className="flex justify-between items-center mt-4 mb-6">
					<button
						onClick={handleBack}
						className="p-2 bg-[#121214] border border-[#202023]/60 rounded-full hover:bg-[#1a1a1d] transition-all"
					>
						<ChevronLeft size={20} />
					</button>
					<div className="text-center flex-1">
						<h2 className="font-semibold text-[17px] text-white">
							{language === "ru" ? "Обмен" : "Swap"}
						</h2>
						<p className="text-[11px] text-gray-500 font-medium tracking-wide mt-0.5">
							WhyNotWallet
						</p>
					</div>
					<div className="w-9 h-9" />
				</div>

				<div className="flex flex-col items-center justify-center pt-12 pb-8">
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{
							type: "spring",
							stiffness: 260,
							damping: 20,
						}}
						className="w-24 h-24 mb-6 rounded-full bg-green-500/10 flex items-center justify-center"
					>
						<CheckCircle2 size={56} className="text-green-500" />
					</motion.div>
					<h1 className="text-[26px] font-bold text-white mb-2">
						{language === "ru" ? "Обмен завершён" : "Swap completed"}
					</h1>
					<p className="text-[14px] text-[#8e8e93] text-center max-w-[260px]">
						{language === "ru"
							? "Средства зачислены на ваш кошелёк"
							: "Funds have been credited to your wallet"}
					</p>
				</div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-[#121214] border border-[#202023]/60 rounded-[24px] overflow-hidden mb-4"
				>
					<div className="flex justify-between items-center px-5 py-4 border-b border-[#202023]/60">
						<span className="text-[14px] text-[#8e8e93]">
							{language === "ru" ? "Отправлено" : "Sent"}
						</span>
						<span className="text-[15px] font-semibold text-white font-mono">
							{swapResult.fromAmount.toLocaleString("en-US", {
								maximumFractionDigits: 6,
							})}{" "}
							{fromToken.symbol}
						</span>
					</div>
					<div className="flex justify-between items-center px-5 py-4 border-b border-[#202023]/60">
						<span className="text-[14px] text-[#8e8e93]">
							{language === "ru" ? "Получено" : "Received"}
						</span>
						<span className="text-[15px] font-semibold text-[#30d158] font-mono">
							≈ {swapResult.toAmount.toLocaleString("en-US", {
								maximumFractionDigits: 6,
							})}{" "}
							{toToken.symbol}
						</span>
					</div>
					{txHash && (
						<div className="flex justify-between items-center px-5 py-4">
							<span className="text-[14px] text-[#8e8e93]">
								{language === "ru" ? "Транзакция" : "Transaction"}
							</span>
							{explorerUrl ? (
								<a
									href={explorerUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-[12px] text-[#387aff] font-mono truncate max-w-[200px] hover:underline"
								>
									{txHash.slice(0, 10)}…{txHash.slice(-6)} ↗
								</a>
							) : (
								<span className="text-[12px] text-white font-mono truncate max-w-[180px]">
									{txHash.slice(0, 10)}…{txHash.slice(-6)}
								</span>
							)}
						</div>
					)}
				</motion.div>

				<div className="mt-auto">
					<button
						onClick={handleBack}
						className="w-full py-4 bg-[#387aff] hover:bg-[#2d6de0] active:bg-[#2460c7] text-white text-[17px] font-semibold rounded-[18px] transition-all"
					>
						{language === "ru" ? "Новый обмен" : "New swap"}
					</button>
				</div>
			</motion.div>
		);
	}

	if (stage === "submitting" || stage === "tracking") {
		const statusLabel = trackStatus
			? language === "ru"
				? SWAP_STATUS_LABELS_RU[trackStatus]
				: SWAP_STATUS_LABELS_EN[trackStatus]
			: language === "ru"
				? "Подготовка транзакции…"
				: "Preparing transaction…";

		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="flex flex-col min-h-screen bg-black text-white p-5 pb-32 select-none"
			>
				<div className="flex justify-between items-center mt-4 mb-6">
					<div className="w-9 h-9" />
					<div className="text-center flex-1">
						<h2 className="font-semibold text-[17px] text-white">
							{language === "ru" ? "Обмен" : "Swap"}
						</h2>
						<p className="text-[11px] text-gray-500 font-medium tracking-wide mt-0.5">
							WhyNotWallet
						</p>
					</div>
					<div className="w-9 h-9" />
				</div>

				<div className="flex flex-col items-center justify-center pt-16 pb-8">
					<Loader2
						size={56}
						className="text-[#387aff] animate-spin mb-6"
					/>
					<h1 className="text-[22px] font-bold text-white mb-2">
						{language === "ru"
							? "Обмен выполняется…"
							: "Swap in progress…"}
					</h1>
					<p className="text-[14px] text-[#8e8e93] text-center max-w-[260px]">
						{statusLabel}
					</p>
				</div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-[#121214] border border-[#202023]/60 rounded-[24px] overflow-hidden mb-4"
				>
				<div className="flex justify-between items-center px-5 py-4 border-b border-[#202023]/60">
					<span className="text-[14px] text-[#8e8e93]">
						{language === "ru" ? "Отправляете" : "You send"}
					</span>
					<span className="text-[15px] font-semibold text-white font-mono">
						{Number(fromAmount).toLocaleString("en-US", {
							maximumFractionDigits: 6,
						})}{" "}
						{fromToken.symbol}
					</span>
				</div>
				<div className="flex justify-between items-center px-5 py-4 border-b border-[#202023]/60">
					<span className="text-[14px] text-[#8e8e93]">
						{language === "ru" ? "Получаете" : "You receive"}
					</span>
					<span className="text-[15px] font-semibold text-[#30d158] font-mono">
						≈{" "}
						{expectedToAmount.toLocaleString("en-US", {
							maximumFractionDigits: 6,
						})}{" "}
						{toToken.symbol}
					</span>
				</div>
					{txHash && (
						<div className="flex justify-between items-center px-5 py-4">
							<span className="text-[14px] text-[#8e8e93]">
								{language === "ru" ? "Хэш" : "Hash"}
							</span>
							{explorerUrl ? (
								<a
									href={explorerUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-[12px] text-[#387aff] font-mono truncate max-w-[220px] hover:underline"
								>
									{txHash.slice(0, 10)}…{txHash.slice(-6)} ↗
								</a>
							) : (
								<span className="text-[12px] text-white font-mono truncate max-w-[200px]">
									{txHash.slice(0, 10)}…{txHash.slice(-6)}
								</span>
							)}
						</div>
					)}
				</motion.div>

				<div className="mt-auto">
					<button
						onClick={() => stage === "tracking" && handleBack()}
						className={`w-full py-4 text-[16px] font-medium rounded-[18px] transition-all ${
							stage === "submitting"
								? "bg-[#1c1c1e]/50 text-gray-500 cursor-not-allowed"
								: "bg-[#1c1c1e] hover:bg-[#252528] text-white"
						}`}
						disabled={stage === "submitting"}
					>
						{language === "ru" ? "Отмена" : "Cancel"}
					</button>
				</div>
			</motion.div>
		);
	}

	if (stage === "error") {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="flex flex-col min-h-screen bg-black text-white p-5 pb-32 select-none"
			>
				<div className="flex justify-between items-center mt-4 mb-6">
					<button
						onClick={handleBack}
						className="p-2 bg-[#121214] border border-[#202023]/60 rounded-full hover:bg-[#1a1a1d] transition-all"
					>
						<ChevronLeft size={20} />
					</button>
					<div className="text-center flex-1">
						<h2 className="font-semibold text-[17px] text-white">
							{language === "ru" ? "Обмен" : "Swap"}
						</h2>
						<p className="text-[11px] text-gray-500 font-medium tracking-wide mt-0.5">
							WhyNotWallet
						</p>
					</div>
					<div className="w-9 h-9" />
				</div>

				<div className="flex flex-col items-center justify-center pt-16 pb-8">
					<div className="w-24 h-24 mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
						<XCircle size={56} className="text-red-500" />
					</div>
					<h1 className="text-[22px] font-bold text-white mb-2">
						{language === "ru"
							? "Не удалось выполнить обмен"
							: "Swap failed"}
					</h1>
					{submitError && (
						<p className="text-[14px] text-[#8e8e93] text-center max-w-[280px]">
							{submitError}
						</p>
					)}
				</div>

				<div className="mt-auto">
					<button
						onClick={handleBack}
						className="w-full py-4 bg-[#387aff] hover:bg-[#2d6de0] active:bg-[#2460c7] text-white text-[17px] font-semibold rounded-[18px] transition-all"
					>
						{language === "ru" ? "Попробовать снова" : "Try again"}
					</button>
				</div>
			</motion.div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="flex flex-col min-h-screen bg-black text-white p-5 pb-32 select-none"
		>
			<div className="flex justify-between items-center mt-4 mb-6">
				<button
					onClick={() => setView("main")}
					className="p-2 bg-[#121214] border border-[#202023]/60 rounded-full hover:bg-[#1a1a1d] transition-all"
				>
					<ChevronLeft size={20} />
				</button>
				<div className="text-center flex-1">
					<h2 className="font-semibold text-[17px] text-white">
						{language === "ru" ? "Обмен" : "Swap"}
					</h2>
					<p className="text-[11px] text-gray-500 font-medium tracking-wide mt-0.5">
						WhyNotWallet
					</p>
				</div>
				<div className="w-9 h-9" />
			</div>

			<div className="relative mb-4">
				<div className="bg-[#121214] border border-[#202023]/60 rounded-[24px] p-5 mb-0.5">
					<div className="flex justify-between items-center mb-4">
						<span className="text-[14px] text-[#8e8e93] font-medium">
							{language === "ru" ? "Вы отправляете" : "You send"}
						</span>
						<div className="flex items-center gap-1.5">
							<span className="text-[13px] text-[#8e8e93]">
								{language === "ru" ? "Баланс:" : "Balance:"}{" "}
								{fromBalance.toLocaleString("en-US", {
									maximumFractionDigits: 4,
								})}{" "}
								{fromToken.symbol}
							</span>
							<button
								onClick={handleMax}
								className="text-[13px] text-[#007aff] font-bold ml-1 hover:opacity-80 transition-opacity"
							>
								{language === "ru" ? "МАКС" : "MAX"}
							</button>
						</div>
					</div>

				<div className="flex items-center justify-between gap-4">
					{renderAssetButton(fromToken, "from")}

						<div className="text-right flex-1 min-w-0">
							<input
								type="number"
								placeholder="0"
								min="0"
								step="any"
								value={fromAmount}
								onChange={(e) => {
									const val = e.target.value;
									if (
										val === "" ||
										(/^\d*\.?\d*$/.test(val) &&
											Number(val) >= 0)
									) {
										setFromAmount(val);
									}
								}}
								onKeyDown={(e) => {
									if (["e", "E", "+", "-"].includes(e.key)) {
										e.preventDefault();
									}
								}}
								className="w-full min-w-0 bg-transparent text-right text-[28px] sm:text-[36px] font-bold outline-none placeholder-[#3a3a3c] text-white select-text font-sans"
							/>
							<p className="text-[13px] text-[#8e8e93]">
								{formatFiat(usdIn, baseCurrency)}
							</p>
						</div>
					</div>
				</div>

				<div className="flex justify-center items-center relative z-10 my-[-1px]">
					<motion.button
						whileTap={{ scale: 0.9, rotate: 180 }}
						onClick={swapAssets}
						className="w-12 h-12 rounded-full bg-[#1c2340] border-2 border-black flex items-center justify-center shadow-xl hover:bg-[#232d52] transition-colors cursor-pointer"
					>
						<ArrowUpDown size={20} className="text-[#387aff]" />
					</motion.button>
				</div>

				<div className="bg-[#121214] border border-[#202023]/60 rounded-[24px] p-5 mt-0.5">
					<div className="flex justify-between items-center mb-4">
						<span className="text-[14px] text-[#8e8e93] font-medium">
							{language === "ru" ? "Вы получаете" : "You receive"}
						</span>
						<span className="text-[13px] text-[#8e8e93]">
							{language === "ru" ? "Баланс:" : "Balance:"}{" "}
							{toBalance.toLocaleString("en-US", {
									maximumFractionDigits: 4,
								})}{" "}
								{toToken.symbol}
						</span>
					</div>

				<div className="flex items-center justify-between gap-4">
					{renderAssetButton(toToken, "to")}

						<div className="text-right flex-1 min-w-0 overflow-hidden">
							{quoteState === "loading" ? (
								<div className="flex items-center justify-end gap-2 h-[44px]">
									<Loader2
										size={18}
										className="animate-spin text-[#387aff]"
									/>
									<span className="text-[14px] text-[#8e8e93]">
										{language === "ru"
											? "Поиск котировки…"
											: "Quoting…"}
									</span>
								</div>
							) : quoteState === "no_quote" ? (
								<p className="text-[20px] sm:text-[24px] font-bold text-[#8e8e93] truncate">
									{language === "ru"
										? "Нет котировок"
										: "No quotes"}
								</p>
							) : quoteState === "error" ? (
								<p className="text-[14px] sm:text-[16px] font-medium text-red-400 truncate">
									{quoteError ??
										(language === "ru"
											? "Ошибка котировки"
											: "Quote error")}
								</p>
							) : (
								<p className="text-[28px] sm:text-[36px] font-bold text-white truncate">
									{expectedToAmount > 0
										? expectedToAmount.toLocaleString(
												"en-US",
												{
													minimumFractionDigits: 0,
													maximumFractionDigits: 4,
												}
											)
										: "0"}
								</p>
							)}
							<p className="text-[13px] text-[#8e8e93]">
								{formatFiat(usdOut, baseCurrency)}
							</p>
						</div>
					</div>
				</div>
			</div>

			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="bg-[#121214] border border-[#202023]/60 rounded-[20px] px-5 py-4 mb-6"
			>
				<div className="flex justify-between items-start">
					<div>
						<p className="text-[13px] text-[#8e8e93] mb-1">
							{language === "ru" ? "Курс" : "Rate"}
						</p>
						<p className="text-[16px] font-semibold text-white">
							1 {fromToken.symbol} ≈{" "}
							{exchangeRate > 0
								? exchangeRate.toLocaleString("en-US", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 6,
									})
								: "—"}
							{" "}
							{toToken.symbol}
						</p>
						{estimatedTime !== null && estimatedTime > 0 && (
							<p className="text-[11px] text-[#8e8e93] mt-1 flex items-center gap-1">
								<Clock size={10} />
								{language === "ru" ? "≈ " : "≈ "}
								{Math.ceil(estimatedTime / 60)}{" "}
								{language === "ru" ? "мин" : "min"}
							</p>
						)}
					</div>
					<div className="text-right">
						<div
							className={`flex items-center justify-end gap-1 mb-1 ${
								isPositive
									? "text-[#30d158]"
									: "text-[#ff453a]"
							}`}
						>
							{isPositive ? (
								<ArrowUp size={12} strokeWidth={3} />
							) : (
								<ArrowDown size={12} strokeWidth={3} />
							)}
							<span className="text-[13px] font-semibold">
								{isPositive ? "+" : ""}
								{changePercent.toFixed(2)}%
							</span>
						</div>
						<p className="text-[13px] text-[#8e8e93] flex items-center gap-1 justify-end">
							<Clock size={11} />
							{language === "ru" ? "24ч" : "24h"}
						</p>
					</div>
				</div>
			</motion.div>

			<div className="mt-auto">
				<button
					onClick={handleContinue}
					disabled={!canContinue}
					className="w-full py-4 bg-[#387aff] hover:bg-[#2d6de0] active:bg-[#2460c7] text-white text-[17px] font-semibold rounded-[18px] transition-all shadow-lg shadow-blue-500/10 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
				>
					{quoteState === "loading" ? (
						<>
							<Loader2 size={18} className="animate-spin" />
							{language === "ru"
								? "Получение котировки…"
								: "Getting quote…"}
						</>
					) : (
						<>
							{language === "ru" ? "Обменять" : "Swap"}
						</>
					)}
				</button>
			</div>

			<TokenPickerModal
				open={showFromPicker}
				onClose={() => setShowFromPicker(false)}
				onSelect={(t) => {
					if (t.address === toToken.address) {
						setToToken(fromToken);
					}
					setFromToken(t);
					setFromAmount("");
				}}
				excludeAddress={toToken.address}
				language={language}
			/>
			<TokenPickerModal
				open={showToPicker}
				onClose={() => setShowToPicker(false)}
				onSelect={(t) => {
					if (t.address === fromToken.address) {
						setFromToken(toToken);
					}
					setToToken(t);
					setFromAmount("");
				}}
				excludeAddress={fromToken.address}
				language={language}
			/>
		</motion.div>
	);
};
