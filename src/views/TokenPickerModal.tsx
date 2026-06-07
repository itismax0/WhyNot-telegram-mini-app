import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Loader2, Search, Star, Wallet, X } from "lucide-react";
import {
	fetchAllAssets,
	fetchAssetByAddress,
	filterSwapableAssets,
	isValidJettonAddress,
	POPULAR_TOKEN_ADDRESSES,
	searchAssets,
	type StonfiAsset,
} from "../services/stonfi";
import { ASSETS } from "../services/blockchain";

type SortMode = "popular" | "name";

export interface SwapToken {
	address: string;
	symbol: string;
	name: string;
	icon: string;
	decimals: number;
	kind: "Ton" | "Jetton" | "External";
	priceUsd: number;
	popularityIndex: number;
	network?: string;
	chainId?: number;
	symbiosisAddress?: string;
	sourceChain?: "ton" | "eth" | "sol" | "btc";
}

function toSwapToken(a: StonfiAsset): SwapToken {
	const price = a.dexPriceUsd ? Number(a.dexPriceUsd) : 0;
	return {
		address: a.contractAddress,
		symbol: a.symbol,
		name: a.displayName,
		icon: a.imageUrl,
		decimals: a.decimals,
		kind: a.kind,
		priceUsd: Number.isFinite(price) ? price : 0,
		popularityIndex: a.popularityIndex,
	};
}

const MAIN_BADGE: Record<string, string> = {
	ton: "NATIVE",
	eth: "EVM",
	sol: "SOLANA",
	usdt: "TON",
	btc: "BITCOIN",
};

function mainAssetsToSwapTokens(): SwapToken[] {
	return ASSETS.map((a) => ({
		address: (a as any).address ?? a.id,
		symbol: a.symbol,
		name: a.name,
		icon: a.icon,
		decimals: a.decimals,
		kind: a.id === "ton" ? ("Ton" as const) : ("External" as const),
		priceUsd: 0,
		popularityIndex: Number.MAX_SAFE_INTEGER - ASSETS.indexOf(a),
		network: a.network,
		chainId: (a as any).chainId,
		symbiosisAddress: (a as any).symbiosisAddress,
		sourceChain: a.id === "ton" || a.id === "usdt" ? "ton" : (a.id as "eth" | "sol" | "btc"),
	}));
}

interface TokenPickerModalProps {
	open: boolean;
	onClose: () => void;
	onSelect: (token: SwapToken) => void;
	excludeAddress?: string;
	language: "en" | "ru";
}

const TON_PLACEHOLDER =
	"https://avatars.githubusercontent.com/u/55018343?s=200&v=4";

export const TokenPickerModal = ({
	open,
	onClose,
	onSelect,
	excludeAddress,
	language,
}: TokenPickerModalProps) => {
	const [assets, setAssets] = useState<StonfiAsset[] | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [query, setQuery] = useState("");
	const [sortMode, setSortMode] = useState<SortMode>("popular");
	const [customAddress, setCustomAddress] = useState("");
	const [customLoading, setCustomLoading] = useState(false);
	const [customError, setCustomError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) {
			setQuery("");
			setCustomAddress("");
			setCustomError(null);
			return;
		}
		if (assets !== null) return;
		let cancelled = false;
		fetchAllAssets()
			.then((list) => {
				if (!cancelled) setAssets(list);
			})
			.catch((e) => {
				if (!cancelled) {
					setError(
						language === "ru"
							? "Не удалось загрузить список токенов"
							: "Failed to load token list"
					);
					console.error("TokenPicker fetch error", e);
				}
			});
		return () => {
			cancelled = true;
		};
	}, [open, assets, language]);

	const swapable = useMemo(
		() => (assets ? filterSwapableAssets(assets) : []),
		[assets]
	);

	const popularTokens = useMemo(() => {
		const byAddr = new Map(swapable.map((a) => [a.contractAddress, a]));
		return POPULAR_TOKEN_ADDRESSES
			.map((addr) => byAddr.get(addr))
			.filter((a): a is StonfiAsset => Boolean(a))
			.map(toSwapToken);
	}, [swapable]);

	const mainTokens = useMemo(() => mainAssetsToSwapTokens(), []);

	const filtered = useMemo(() => {
		if (!assets) return [];
		let list = filterSwapableAssets(assets);
		const q = query.trim();
		if (q) {
			const searched = searchAssets(list, q, 200);
			list = searched;
		} else {
			list = list.filter((a) => a.contractAddress !== excludeAddress);
		}
		if (sortMode === "name") {
			list = [...list].sort((a, b) =>
				a.symbol.localeCompare(b.symbol)
			);
		} else {
			list = [...list].sort(
				(a, b) => b.popularityIndex - a.popularityIndex
			);
		}
		return list.slice(0, 200);
	}, [assets, query, sortMode, excludeAddress]);

	const handleCustom = async () => {
		const addr = customAddress.trim();
		if (!isValidJettonAddress(addr)) {
			setCustomError(
				language === "ru"
					? "Неверный адрес Jetton"
					: "Invalid Jetton address"
			);
			return;
		}
		setCustomError(null);
		setCustomLoading(true);
		try {
			const asset = await fetchAssetByAddress(addr);
			if (!asset) {
				setCustomError(
					language === "ru"
						? "Токен не найден в STON.fi"
						: "Token not found on STON.fi"
				);
				return;
			}
			if (asset.deprecated || asset.blacklisted) {
				setCustomError(
					language === "ru"
						? "Этот токен недоступен для обмена"
						: "This token cannot be swapped"
				);
				return;
			}
			onSelect(toSwapToken(asset));
			onClose();
		} catch (e) {
			setCustomError(
				language === "ru"
					? "Ошибка при проверке токена"
					: "Error verifying token"
			);
		} finally {
			setCustomLoading(false);
		}
	};

	return (
		<AnimatePresence>
			{open && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center"
					onClick={onClose}
				>
					<motion.div
						initial={{ y: "100%" }}
						animate={{ y: 0 }}
						exit={{ y: "100%" }}
						transition={{
							type: "spring",
							damping: 30,
							stiffness: 280,
						}}
						onClick={(e) => e.stopPropagation()}
						className="w-full max-w-md bg-[#0c0c0e] border-t sm:border border-white/10 sm:rounded-[28px] rounded-t-[28px] max-h-[92vh] flex flex-col overflow-hidden"
					>
						<div className="flex justify-between items-center px-5 pt-5 pb-3 flex-shrink-0">
							<button
								onClick={onClose}
								className="p-2 bg-[#15151a] border border-[#202023]/60 rounded-full hover:bg-[#1a1a1d] transition-all"
								aria-label="Close"
							>
								<ChevronLeft size={20} />
							</button>
							<h2 className="font-semibold text-[17px] text-white">
								{language === "ru"
									? "Выберите токен"
									: "Select token"}
							</h2>
							<div className="w-9 h-9" />
						</div>

						<div className="px-5 pb-3 flex-shrink-0">
							<div className="relative">
								<Search
									size={16}
									className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6e6e73] pointer-events-none"
								/>
								<input
									type="text"
									placeholder={
										language === "ru"
											? "Поиск по имени или адресу"
											: "Search name or address"
									}
									value={query}
									onChange={(e) =>
										setQuery(e.target.value)
									}
									className="w-full bg-[#15151a] border border-[#202023]/60 rounded-[14px] pl-10 pr-10 py-3 text-[15px] text-white placeholder-[#6e6e73] outline-none focus:border-[#387aff]/60 transition-colors"
								/>
								{query && (
									<button
										onClick={() => setQuery("")}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6e6e73] hover:text-white"
									>
										<X size={14} />
									</button>
								)}
							</div>
						</div>

						{!query && mainTokens.length > 0 && (
							<div className="px-5 pb-4 flex-shrink-0">
								<div className="flex items-center gap-1.5 mb-2.5 text-[11px] text-[#8e8e93] font-medium uppercase tracking-wider">
									<Wallet size={11} />
									{language === "ru"
										? "Кошелёк"
										: "Main"}
								</div>
								<div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
									{mainTokens.map((t) => {
										const idKey = (
											t.symbol + t.address
										).toLowerCase();
										const idMatch = Object.keys(
											MAIN_BADGE
										).find(
											(k) =>
												idKey.includes(k) ||
												t.address
													.toLowerCase()
													.includes(k)
										);
										const badge = idMatch
											? MAIN_BADGE[idMatch]
											: t.network?.toUpperCase();
										return (
											<button
												key={
													"main-" + t.address
												}
												onClick={() => {
													onSelect(t);
													onClose();
												}}
												disabled={
													t.address ===
													excludeAddress
												}
												className="flex items-center gap-2 bg-[#15151a] hover:bg-[#1a1a1d] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed border border-[#202023]/60 rounded-full pl-1.5 pr-3 py-1.5 transition-all flex-shrink-0"
											>
												<img
													src={t.icon}
													alt={t.symbol}
													className="w-5 h-5 rounded-full object-contain bg-[#0a0a0c]"
												/>
												<span className="text-[13px] font-semibold text-white whitespace-nowrap">
													{t.symbol}
												</span>
												{badge && (
													<span
														className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
															badge === "NATIVE"
																? "bg-[#387aff]/15 text-[#387aff]"
																: "bg-white/10 text-[#a0a0a5]"
														}`}
													>
														{badge}
													</span>
												)}
											</button>
										);
									})}
								</div>
							</div>
						)}

						{!query && popularTokens.length > 0 && (
							<div className="px-5 pb-4 flex-shrink-0">
								<div className="flex items-center gap-1.5 mb-2.5 text-[11px] text-[#8e8e93] font-medium uppercase tracking-wider">
									<Star size={11} />
									{language === "ru"
										? "Популярные"
										: "Popular"}
								</div>
								<div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
									{popularTokens.map((t) => (
										<button
											key={t.address}
											onClick={() => {
												onSelect(t);
												onClose();
											}}
											disabled={
												t.address === excludeAddress
											}
											className="flex items-center gap-2 bg-[#15151a] hover:bg-[#1a1a1d] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed border border-[#202023]/60 rounded-full pl-1.5 pr-3.5 py-1.5 transition-all flex-shrink-0"
										>
											<img
												src={t.icon}
												alt={t.symbol}
												className="w-5 h-5 rounded-full object-contain bg-[#0a0a0c]"
											/>
											<span className="text-[13px] font-semibold text-white whitespace-nowrap">
												{t.symbol}
											</span>
										</button>
									))}
								</div>
							</div>
						)}

						<div className="flex justify-between items-center px-5 pb-2 flex-shrink-0">
							<span className="text-[11px] text-[#6e6e73] font-medium uppercase tracking-wider">
								{language === "ru" ? "Токены" : "Tokens"}
							</span>
							<div className="flex bg-[#15151a] border border-[#202023]/60 rounded-full p-0.5">
								{(["popular", "name"] as SortMode[]).map(
									(m) => (
										<button
											key={m}
											onClick={() => setSortMode(m)}
											className={`px-3 py-1 text-[11px] font-semibold rounded-full transition-colors ${
												sortMode === m
													? "bg-[#387aff] text-white"
													: "text-[#8e8e93] hover:text-white"
											}`}
										>
											{m === "popular"
												? language === "ru"
													? "Топ"
													: "Top"
												: language === "ru"
													? "A-Z"
													: "A-Z"}
										</button>
									)
								)}
							</div>
						</div>

						<div className="flex-1 overflow-y-auto px-3 pb-3">
							{assets === null && !error && (
								<div className="flex flex-col items-center justify-center py-12 text-[#8e8e93]">
									<Loader2
										size={28}
										className="animate-spin mb-3 text-[#387aff]"
									/>
									<span className="text-[13px]">
										{language === "ru"
											? "Загрузка токенов..."
											: "Loading tokens..."}
									</span>
								</div>
							)}

							{error && (
								<div className="flex flex-col items-center justify-center py-12 px-6 text-center">
									<p className="text-[14px] text-[#ff453a] mb-3">
										{error}
									</p>
									<button
										onClick={() => {
											setAssets(null);
											setError(null);
										}}
										className="px-4 py-2 bg-[#1c1c1e] hover:bg-[#252528] rounded-[12px] text-[13px] font-medium transition-colors"
									>
										{language === "ru"
											? "Повторить"
											: "Retry"}
									</button>
								</div>
							)}

							{assets !== null && filtered.length === 0 && (
								<div className="flex flex-col items-center justify-center py-12 px-6 text-center text-[#8e8e93]">
									<p className="text-[14px]">
										{language === "ru"
											? "Ничего не найдено"
											: "No tokens found"}
									</p>
								</div>
							)}

							{filtered.map((a) => {
								const t = toSwapToken(a);
								return (
									<button
										key={a.contractAddress}
										onClick={() => {
											onSelect(t);
											onClose();
										}}
										disabled={
											a.contractAddress === excludeAddress
										}
										className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[14px] hover:bg-[#15151a] active:bg-[#1a1a1d] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-left"
									>
										<img
											src={
												a.imageUrl || TON_PLACEHOLDER
											}
											alt={a.symbol}
											className="w-9 h-9 rounded-full object-contain bg-[#0a0a0c] flex-shrink-0"
											onError={(e) => {
												(e.currentTarget as HTMLImageElement).src =
													TON_PLACEHOLDER;
											}}
										/>
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-1.5">
												<span className="font-semibold text-[15px] text-white truncate">
													{a.symbol}
												</span>
												{a.kind === "Ton" && (
													<span className="text-[9px] bg-[#387aff]/15 text-[#387aff] px-1.5 py-0.5 rounded-full font-bold">
														NATIVE
													</span>
												)}
											</div>
											<div className="text-[11px] text-[#8e8e93] truncate">
												{a.displayName}
											</div>
										</div>
										{t.priceUsd > 0 && (
											<div className="text-right flex-shrink-0">
												<div className="text-[12px] text-white font-mono">
													$
													{t.priceUsd <
													0.01
														? t.priceUsd.toExponential(
																2
															)
														: t.priceUsd.toLocaleString(
																"en-US",
																{
																	minimumFractionDigits: 2,
																	maximumFractionDigits:
																		t.priceUsd <
																		1
																			? 4
																			: 2,
																}
															)}
												</div>
											</div>
										)}
									</button>
								);
							})}
						</div>

						<div className="flex-shrink-0 border-t border-[#202023]/60 px-5 py-4 bg-[#0a0a0c]">
							<p className="text-[10px] text-[#6e6e73] uppercase tracking-wider font-bold mb-2">
								{language === "ru"
									? "Или введите адрес Jetton"
									: "Or paste Jetton address"}
							</p>
							<div className="flex gap-2">
								<input
									type="text"
									placeholder="EQ... / UQ... / 0x..."
									value={customAddress}
									onChange={(e) => {
										setCustomAddress(e.target.value);
										setCustomError(null);
									}}
									className="flex-1 bg-[#15151a] border border-[#202023]/60 rounded-[12px] px-3.5 py-2.5 text-[12px] text-white placeholder-[#6e6e73] outline-none focus:border-[#387aff]/60 font-mono transition-colors"
								/>
								<button
									onClick={handleCustom}
									disabled={
										customLoading ||
										!customAddress.trim()
									}
									className="px-4 py-2.5 bg-[#387aff] hover:bg-[#2d6de0] active:bg-[#2460c7] disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-semibold rounded-[12px] transition-all flex items-center justify-center min-w-[64px]"
								>
									{customLoading ? (
										<Loader2
											size={14}
											className="animate-spin"
										/>
									) : (
										<>
											{language === "ru"
												? "Найти"
												: "Find"}
										</>
									)}
								</button>
							</div>
							{customError && (
								<p className="text-[11px] text-[#ff453a] mt-2">
									{customError}
								</p>
							)}
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
