import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
	ArrowDownToLine,
	ArrowUpRight,
	Eye,
	EyeOff,
	ChevronLeft,
	ChevronRight,
	ChevronDown,
	Copy,
	Settings,
	Clock,
	Grid2X2,
	Sparkles,
	ShieldCheck,
	Lock,
	Send,
	Wallet,
	Bot,
} from "lucide-react";
import { useWallet } from "../store/WalletContext";

import {
	ASSETS,
	sendTransaction,
	fetchBalances,
	fetchTransactions,
	resolveUsername,
	getAssetDetails,
	getChainForAsset,
	evaluateReputationReal,
	isValidAddressOrUsername,
} from "../services/blockchain";
import type { ReputationDetails } from "../services/blockchain";

interface WalletTransaction {
	hash: string;
	type: "send" | "receive";
	value: number;
	from: string;
	to: string;
	timestamp: number;
}

const copyTextToClipboard = (text: string): boolean => {
	if (navigator.clipboard && window.isSecureContext) {
		navigator.clipboard.writeText(text).catch(() => {});
		return true;
	}
	const textArea = document.createElement("textarea");
	textArea.value = text;
	textArea.style.position = "fixed";
	textArea.style.top = "0";
	textArea.style.left = "0";
	textArea.style.opacity = "0";
	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();
	let successful = false;
	try {
		successful = document.execCommand("copy");
	} catch {
		successful = false;
	}
	document.body.removeChild(textArea);
	return successful;
};

const Combobox = ({
	value,
	onChange,
	options,
}: {
	value: any;
	onChange: (v: any) => void;
	options: any[];
}) => {
	const [isOpen, setIsOpen] = useState(false);
	return (
		<div className="relative w-full mb-6 z-40">
			<div
				onClick={() => setIsOpen(!isOpen)}
				className="w-full bg-[#111] border border-[#222] rounded-2xl p-4 flex justify-between items-center cursor-pointer hover:bg-[#151515] active:scale-[0.99] transition-all"
			>
				<div className="flex items-center gap-3">
					<img
						src={value.icon}
						alt={value.symbol}
						loading="lazy"
						decoding="async"
						className="w-8 h-8 rounded-full bg-[#222] object-contain p-1"
					/>
					<span className="font-semibold text-sm">
						{value.name} ({value.network})
					</span>
				</div>
				<ChevronDown
					size={18}
					className={`text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
				/>
			</div>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className="absolute left-0 right-0 mt-2 bg-[#111] border border-[#222] rounded-2xl overflow-hidden shadow-2xl"
					>
						{options.map((opt) => (
							<div
								key={opt.id}
								onClick={() => {
									onChange(opt);
									setIsOpen(false);
								}}
								className="p-4 hover:bg-[#1a1a1a] flex items-center gap-3 cursor-pointer border-b border-[#1c1c1c] last:border-0"
							>
								<img
									src={opt.icon}
									alt={opt.symbol}
									loading="lazy"
									decoding="async"
									className="w-8 h-8 rounded-full bg-[#222] object-contain p-1"
								/>
								<div>
									<div className="font-semibold text-sm">
										{opt.name}
									</div>
									<div className="text-[10px] text-gray-500 uppercase font-mono">
										{opt.network}
									</div>
								</div>
							</div>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export const MainView = () => {
	const {
		setView,
		wallets,
		balances,
		setBalances,
		rates,
		t,
		setSelectedAsset,
		networkMode,
		language,
	} = useWallet();
	const [hide, setHide] = useState(false);
	const lastNetworkRef = useRef<string | null>(null);

	useEffect(() => {
		if (!wallets?.ton?.address) return;
		const netKey = `${networkMode}_${wallets.ton.address}`;
		if (lastNetworkRef.current !== netKey) {
			lastNetworkRef.current = netKey;
			fetchBalances(wallets, networkMode).then(setBalances);
		} else if (Object.keys(balances).length === 0) {
			fetchBalances(wallets, networkMode).then(setBalances);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [wallets?.ton?.address, networkMode]);

	const totalUsd = ASSETS.reduce(
		(acc, a) => acc + (balances[a.id] || 0) * (rates[a.id] || 0),
		0
	);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="flex flex-col min-h-screen p-5 pb-32"
		>
			<div className="flex justify-between items-center mt-4 mb-6">
				<div className="w-6 h-6" />
				<div className="bg-[#111] border border-[#222] px-4 py-1.5 rounded-full text-[11px] font-mono text-gray-400 tracking-wider">
					WhyNot?
				</div>
				<button
					onClick={() => setView("settings")}
					className="p-2 bg-[#111] hover:bg-[#222] transition-colors rounded-full border border-[#222] text-gray-400 hover:text-white"
				>
					<Settings size={18} />
				</button>
			</div>

			<div className="flex flex-col items-center mb-10">
				<h1 className="text-[2.75rem] font-medium tracking-tight mb-2 flex items-center gap-3">
					{hide
						? "****"
						: `$${totalUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
					<button
						onClick={() => setHide(!hide)}
						className="text-gray-500 hover:text-white transition-colors"
					>
						{hide ? <EyeOff size={20} /> : <Eye size={20} />}
					</button>
				</h1>
				<p className="text-gray-500 text-sm font-mono uppercase tracking-wider">
					{t("total_balance")}
				</p>
			</div>

			<div className="flex justify-center gap-8 mb-10">
				{[
					{
						id: "receive",
						icon: <ArrowDownToLine size={24} />,
						label: t("receive"),
					},
					{
						id: "send",
						icon: <ArrowUpRight size={24} />,
						label: t("send"),
					},
					{
						id: "history",
						icon: <Clock size={24} />,
						label: t("history"),
					},
				].map((btn) => (
					<div
						key={btn.id}
						className="flex flex-col items-center gap-3 cursor-pointer group"
						onClick={() => setView(btn.id as any)}
					>
						<div className="w-16 h-16 bg-[#111] group-hover:bg-[#1a1a1a] transition-colors rounded-full flex items-center justify-center border border-[#222]">
							{btn.icon}
						</div>
						<span className="text-sm text-gray-400 group-hover:text-white transition-colors">
							{btn.label}
						</span>
					</div>
				))}
			</div>

			<div className="flex-1">
				<h3 className="text-sm font-medium text-gray-500 mb-4 px-2 uppercase tracking-wider">
					{t("assets")}
				</h3>
				<div className="flex flex-col gap-3">
					{ASSETS.map((asset) => {
						const bal = balances[asset.id] || 0;
						const usdVal = bal * (rates[asset.id] || 0);
						return (
							<div
								key={asset.id}
								className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a] hover:bg-[#111] active:scale-[0.98] transition-all cursor-pointer"
								onClick={() => {
									setSelectedAsset(asset);
									setView("token_detail");
								}}
							>
							<div className="flex items-center gap-4">
								<img
									src={asset.icon}
									alt={asset.symbol}
									loading="lazy"
									decoding="async"
									className="w-12 h-12 rounded-full bg-[#111] object-contain p-2 border border-[#1a1a1a]"
								/>
									<div>
										<h4 className="font-semibold text-base mb-0.5">
											{asset.name}
										</h4>
										<p className="text-[11px] text-gray-500 font-mono uppercase">
											{asset.network}
										</p>
									</div>
								</div>
								<div className="text-right">
									<h4 className="font-semibold text-base mb-0.5">
										{hide ? "***" : bal.toLocaleString()}{" "}
										{asset.symbol}
									</h4>
									<p className="text-xs text-gray-500 font-mono">
										{hide ? "***" : `$${usdVal.toFixed(2)}`}
									</p>
								</div>
							</div>
						);
					})}
				</div>

				<button
					onClick={() => setView("ai")}
					className="mt-4 w-full flex items-center gap-3 p-4 bg-gradient-to-r from-[#0c1e3a] to-[#0a1530] border border-[#1a2f5c]/60 hover:border-[#387aff]/40 active:scale-[0.98] rounded-2xl transition-all text-left"
				>
					<div className="relative w-11 h-11 flex-shrink-0">
						<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#387aff] to-[#5d3aff] flex items-center justify-center shadow-lg shadow-blue-500/30">
							<Bot size={22} className="text-white" strokeWidth={2.2} />
						</div>
						<Sparkles
							size={12}
							className="absolute -top-1 -right-1 text-yellow-400"
							strokeWidth={2.5}
						/>
					</div>
					<div className="flex-1 min-w-0">
						<h4 className="font-semibold text-[15px] text-white mb-0.5">
							{language === "ru" ? "AI-ассистент WhyNot" : "AI assistent WhyNot"}
						</h4>
						<p className="text-[12px] text-[#8e8e93] leading-snug">
							{language === "ru"
								? "Анализирует рынок, находит возможности и защищает ваши средства."
								: "Analyzes the market, finds opportunities, and protects your funds."}
						</p>
					</div>
					<ChevronRight size={18} className="text-[#6e6e73] flex-shrink-0" />
				</button>
			</div>
		</motion.div>
	);
};

export const ReceiveView = () => {
	const { setView, wallets, showToast, t } = useWallet();
	const [asset, setAsset] = useState(ASSETS[0]);
	const address = wallets[asset.id]?.address || "";

	const handleCopy = () => {
		const success = copyTextToClipboard(address);
		if (success) showToast(t("copied"));
	};

	return (
		<motion.div
			initial={{ x: "100%" }}
			animate={{ x: 0 }}
			transition={{ type: "spring", damping: 25, stiffness: 200 }}
			className="flex flex-col min-h-screen p-5"
		>
			<div className="flex items-center gap-4 mb-6 pt-2">
				<button
					onClick={() => setView("main")}
					className="p-2 bg-[#111] rounded-full hover:bg-[#222] transition-colors"
				>
					<ChevronLeft size={20} />
				</button>
				<h2 className="font-medium text-lg">{t("receive")}</h2>
			</div>

			<Combobox value={asset} onChange={setAsset} options={ASSETS} />

			<div className="flex-1 flex flex-col items-center mt-4">
				<div className="bg-white p-5 rounded-[2rem] mb-8 shadow-2xl">
					<QRCodeSVG value={address} size={220} level="H" />
				</div>

				<p className="text-sm text-gray-500 mb-3 uppercase tracking-wider">
					Your {asset.network} Address
				</p>
				<div className="w-full bg-[#111] border border-[#222] p-4 rounded-2xl text-center break-all font-mono text-sm leading-relaxed mb-8 selectable-text select-text">
					{address}
				</div>
			</div>

			<div className="mt-auto pb-6">
				<button
					onClick={handleCopy}
					className="w-full py-4 flex items-center justify-center gap-2 bg-white text-black font-semibold rounded-2xl active:scale-[0.98] transition-transform"
				>
					<Copy size={18} /> COPY ADDRESS
				</button>
			</div>
		</motion.div>
	);
};

export const ConfirmView = ({
	asset,
	address,
	amount,
	onBack,
	onConfirm,
	loading,
	language,
	t,
	rates,
	assetDetails,
}: {
	asset: any;
	address: string;
	amount: string;
	onBack: () => void;
	onConfirm: () => void;
	loading: boolean;
	language: string;
	t: (k: string) => string;
	rates: Record<string, number>;
	assetDetails: any;
}) => {
	const conversionRate = rates[asset.id] || 0;
	const usdEquivalent = Number(amount) * conversionRate;
	const firstLetter = address
		? address.replace("@", "").trim().charAt(0).toUpperCase()
		: "U";

	return (
		<motion.div
			initial={{ x: "100%", opacity: 0 }}
			animate={{ x: 0, opacity: 1 }}
			exit={{ x: "100%", opacity: 0 }}
			transition={{ type: "spring", damping: 28, stiffness: 220 }}
			className="flex flex-col min-h-screen bg-black text-white p-5 select-none"
		>
			<div className="flex justify-between items-center mb-6 pt-2">
				<button
					onClick={onBack}
					className="p-2 bg-[#121214] border border-[#202023]/60 rounded-full hover:bg-[#1a1a1d] transition-all cursor-pointer text-white flex items-center justify-center"
				>
					<ChevronLeft size={20} />
				</button>
				<div className="text-center flex-1 pr-6">
					<h2 className="font-semibold text-[17px] leading-tight text-white">
						{language === "ru" ? "Перевод" : "Transfer"}
					</h2>
					<p className="text-[11px] text-gray-500 font-medium tracking-wide mt-0.5">
						WhyNotWallet
					</p>
				</div>
				<div className="w-9 h-9" />
			</div>

			<p className="text-[14px] text-[#8e8e93] font-medium mb-3 px-1">
				{language === "ru"
					? "Подтверждение перевода:"
					: "Transfer confirmation:"}
			</p>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
				className="bg-[#121214] border border-[#202023]/60 rounded-[24px] overflow-hidden mb-4"
			>
				<div className="flex items-center gap-3.5 p-4 border-b border-[#202023]/60">
					<span className="text-[14px] text-[#8e8e93] w-12 flex-shrink-0">
						{language === "ru" ? "Кому:" : "To:"}
					</span>
					<div className="flex items-center gap-2.5">
						<div className="w-9 h-9 rounded-full bg-[#24213d] flex items-center justify-center font-bold text-base text-[#9b8bf4] flex-shrink-0">
							{firstLetter}
						</div>
						<span className="text-[14px] text-[#8e8e93] font-mono truncate max-w-[200px]">
							{address}
						</span>
					</div>
				</div>

				<div className="flex flex-col items-center justify-center py-8 px-4">
					<div className="flex items-center gap-3 mb-2">
						<div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-[#1a1a1e]">
							<img
								src={asset.icon}
								alt={asset.symbol}
								className="w-full h-full object-contain"
							/>
						</div>
						<span className="text-[36px] font-bold text-white tracking-tight">
							{amount || "0"} {asset.symbol}
						</span>
					</div>
					<p className="text-[14px] text-[#8e8e93]">
						≈ $
						{usdEquivalent.toLocaleString("en-US", {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})}
					</p>
				</div>

				<div className="flex justify-between items-center px-4 py-3.5 border-t border-[#202023]/60">
					<span className="text-[14px] text-[#8e8e93]">
						{language === "ru" ? "Комиссия сети:" : "Network fee:"}
					</span>
					<span className="text-[14px] text-white font-mono">
						{assetDetails.fee}
					</span>
				</div>

				<div className="flex justify-between items-center px-4 py-3.5 border-t border-[#202023]/60">
					<span className="text-[14px] font-semibold text-white">
						{language === "ru" ? "Итого к списанию:" : "Total debit:"}
					</span>
					<span className="text-[14px] font-bold text-white font-mono">
						{(Number(amount || 0)).toFixed(2)} {asset.symbol}
					</span>
				</div>
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.18, duration: 0.4, ease: "easeOut" }}
			>
				<p className="text-[14px] text-[#8e8e93] font-medium mb-3 px-1">
					{language === "ru" ? "Детали перевода" : "Transfer Details"}
				</p>
				<div className="bg-[#121214] border border-[#202023]/60 rounded-[20px] px-4 py-1.5 divide-y divide-[#202023]/40">
					<div className="flex justify-between items-center py-3.5">
						<div className="flex items-center gap-3 text-sm text-[#8e8e93]">
							<Clock size={16} className="stroke-[2]" />
							<span>{language === "ru" ? "Время перевода" : t("transfer_time")}</span>
						</div>
						<span className="text-sm text-white font-medium">
							{language === "ru" ? assetDetails.timeRu : assetDetails.timeEn}
						</span>
					</div>
					<div className="flex justify-between items-center py-3.5">
						<div className="flex items-center gap-3 text-sm text-[#8e8e93]">
							<ShieldCheck size={16} className="stroke-[2]" />
							<span>{language === "ru" ? "Защита WhyNotWallet" : t("protection_title")}</span>
						</div>
						<span className="text-sm text-[#30d158] font-semibold">
							{language === "ru" ? "Активна" : t("protection_active")}
						</span>
					</div>
				</div>
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.25, duration: 0.4, ease: "easeOut" }}
				className="mt-auto pt-6 pb-2"
			>
				<button
					onClick={onConfirm}
					disabled={loading}
					className="w-full py-4 bg-[#007aff] hover:bg-[#006ee6] active:bg-[#005ec4] text-white text-[16px] font-semibold rounded-[16px] transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-blue-500/10 cursor-pointer mb-4"
				>
					{loading ? (
						<div className="loader border-white/20 border-t-white w-5 h-5" />
					) : (
						<>
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
							>
								<ShieldCheck size={18} className="text-white" />
							</motion.div>
							<span>
								{language === "ru"
									? `Подтвердить ${amount || 0} ${asset.symbol}`
									: `Confirm ${amount || 0} ${asset.symbol}`}
							</span>
						</>
					)}
				</button>

				<button
					onClick={onBack}
					className="w-full py-3 text-[#8e8e93] text-[15px] font-medium text-center hover:text-white transition-colors cursor-pointer"
				>
					{language === "ru" ? "Назад к деталям" : "Back to details"}
				</button>

				<div className="flex items-start justify-center gap-2 mt-3 px-4 text-center">
					<Lock size={12} className="text-[#4e4e50] flex-shrink-0 mt-0.5" />
					<p className="text-[11px] text-[#4e4e50] leading-relaxed">
						{t("disclaimer")}
					</p>
				</div>
			</motion.div>
		</motion.div>
	);
};

export const SuccessView = ({
	asset,
	address,
	amount,
	onHome,
	language,
	t,
	rates,
	assetDetails,
}: {
	asset: any;
	address: string;
	amount: string;
	onHome: () => void;
	language: string;
	t: (k: string) => string;
	rates: Record<string, number>;
	assetDetails: any;
}) => {
	const conversionRate = rates[asset.id] || 0;
	const usdEquivalent = Number(amount) * conversionRate;
	const firstLetter = address
		? address.replace("@", "").trim().charAt(0).toUpperCase()
		: "U";

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.96 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.96 }}
			transition={{ duration: 0.35, ease: "easeOut" }}
			className="flex flex-col min-h-screen bg-black text-white p-5 select-none"
		>
			<div className="flex flex-col items-center justify-center pt-16 pb-8">
				<motion.div
					initial={{ scale: 0, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{
						delay: 0.15,
						type: "spring",
						stiffness: 260,
						damping: 20,
					}}
					className="relative w-24 h-24 mb-6"
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.5 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
						className="absolute inset-0 rounded-full bg-green-500/10"
						style={{ filter: "blur(12px)" }}
					/>
					<motion.div
						initial={{ pathLength: 0, opacity: 0 }}
						animate={{ pathLength: 1, opacity: 1 }}
						className="absolute inset-0"
					>
						<svg viewBox="0 0 96 96" className="w-full h-full">
							<motion.circle
								cx="48"
								cy="48"
								r="44"
								fill="transparent"
								stroke="#22c55e"
								strokeWidth="2.5"
								strokeLinecap="round"
								initial={{ pathLength: 0, opacity: 0 }}
								animate={{ pathLength: 1, opacity: 1 }}
								transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
							/>
						</svg>
					</motion.div>
					<div className="absolute inset-0 flex items-center justify-center">
						<motion.div
							initial={{ scale: 0, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{
								delay: 0.45,
								type: "spring",
								stiffness: 300,
								damping: 18,
							}}
						>
							<svg
								width="36"
								height="36"
								viewBox="0 0 36 36"
								fill="none"
							>
								<motion.path
									d="M7 18L14 25L29 11"
									stroke="#22c55e"
									strokeWidth="3"
									strokeLinecap="round"
									strokeLinejoin="round"
									initial={{ pathLength: 0 }}
									animate={{ pathLength: 1 }}
									transition={{
										delay: 0.55,
										duration: 0.5,
										ease: "easeOut",
									}}
								/>
							</svg>
						</motion.div>
					</div>
				</motion.div>

				<motion.h1
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5, duration: 0.4 }}
					className="text-[26px] font-bold text-white mb-2"
				>
					{language === "ru" ? "Перевод отправлен!" : "Transfer Sent!"}
				</motion.h1>
				<motion.p
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.6, duration: 0.4 }}
					className="text-[14px] text-[#8e8e93] text-center max-w-[240px] leading-relaxed"
				>
					{language === "ru"
						? "Ваш перевод успешно отправлен\nна обработку в сеть."
						: "Your transfer has been successfully\nsubmitted to the network."}
				</motion.p>
			</div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.65, duration: 0.4, ease: "easeOut" }}
				className="bg-[#121214] border border-[#202023]/60 rounded-[24px] overflow-hidden mb-4"
			>
				<div className="flex justify-between items-center px-4 py-4 border-b border-[#202023]/60">
					<span className="text-[14px] text-[#8e8e93]">
						{language === "ru" ? "Получатель" : "Recipient"}
					</span>
					<div className="flex items-center gap-2">
						<div className="w-7 h-7 rounded-full bg-[#24213d] flex items-center justify-center font-bold text-sm text-[#9b8bf4]">
							{firstLetter}
						</div>
						<span className="text-[14px] text-white font-mono truncate max-w-[160px]">
							{address}
						</span>
					</div>
				</div>

				<div className="flex justify-between items-start px-4 py-4 border-b border-[#202023]/60">
					<span className="text-[14px] text-[#8e8e93]">
						{language === "ru" ? "Сумма" : "Amount"}
					</span>
					<div className="text-right">
						<div className="text-[14px] font-semibold text-white font-mono">
							{amount || "0"} {asset.symbol}
						</div>
						<div className="text-[12px] text-[#8e8e93] mt-0.5">
							≈ $
							{usdEquivalent.toLocaleString("en-US", {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}
						</div>
					</div>
				</div>

				<div className="flex justify-between items-center px-4 py-4 border-b border-[#202023]/60">
					<span className="text-[14px] text-[#8e8e93]">
						{language === "ru" ? "Комиссия сети" : "Network fee"}
					</span>
					<span className="text-[14px] text-white font-mono">
						{assetDetails.fee}
					</span>
				</div>

				<div className="flex justify-between items-center px-4 py-4 border-b border-[#202023]/60">
					<span className="text-[14px] text-[#8e8e93]">
						{language === "ru" ? "Время перевода" : t("transfer_time")}
					</span>
					<span className="text-[14px] text-white font-medium">
						{language === "ru" ? assetDetails.timeRu : assetDetails.timeEn}
					</span>
				</div>

				<div className="flex justify-between items-center px-4 py-4">
					<span className="text-[14px] text-[#8e8e93]">
						{language === "ru" ? "Защита WhyNotWallet" : t("protection_title")}
					</span>
					<span className="text-[14px] text-[#30d158] font-semibold">
						{language === "ru" ? "Активна" : t("protection_active")}
					</span>
				</div>
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.75, duration: 0.4, ease: "easeOut" }}
				className="bg-[#121214] border border-[#202023]/60 rounded-[20px] px-4 py-3.5 mb-6 flex items-center justify-between"
			>
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-full bg-green-900/30 border border-green-800/40 flex items-center justify-center flex-shrink-0">
						<Clock size={18} className="text-green-500 stroke-[2]" />
					</div>
					<div>
						<div className="text-[14px] font-semibold text-white">
							{language === "ru" ? "Статус перевода" : "Transfer Status"}
						</div>
						<div className="text-[12px] text-[#8e8e93] mt-0.5">
							{language === "ru"
								? `Ожидание подтверждения в сети ${asset.network}`
								: `Awaiting confirmation in ${asset.network} network`}
						</div>
					</div>
				</div>
				<ChevronLeft
					size={16}
					className="text-[#8e8e93] rotate-180 flex-shrink-0"
				/>
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.82, duration: 0.4, ease: "easeOut" }}
				className="mt-auto pb-2"
			>
				<button
					onClick={onHome}
					className="w-full py-4 bg-[#007aff] hover:bg-[#006ee6] active:bg-[#005ec4] text-white text-[16px] font-semibold rounded-[16px] transition-all shadow-lg shadow-blue-500/10 cursor-pointer"
				>
					{language === "ru" ? "Вернуться на главную" : "Back to Home"}
				</button>
			</motion.div>
		</motion.div>
	);
};

export const SendView = () => {
	const {
		setView,
		wallets,
		balances,
		setBalances,
		showToast,
		networkMode,
		language,
		rates,
		t,
	} = useWallet();
	const [asset, setAsset] = useState(ASSETS[0]);
	const [address, setAddress] = useState("");
	const [amount, setAmount] = useState("");
	const [loading, setLoading] = useState(false);
	const [scanning, setScanning] = useState(false);
	const [repResult, setRepResult] = useState<ReputationDetails | null>(null);
	const [showDetails, setShowDetails] = useState(false);
	const [showAssetDropdown, setShowAssetDropdown] = useState(false);
	const [addressError, setAddressError] = useState<string | null>(null);
	const [stage, setStage] = useState<"form" | "confirm" | "success">("form");
	const latestCleanRef = useRef("");
	const langRef = useRef(language);
	langRef.current = language;

	useEffect(() => {
		const lang = langRef.current;
		const clean = address.trim();
		latestCleanRef.current = clean;
		if (!clean || clean.length < 3) {
			setRepResult(null);
			setAddressError(null);
			return;
		}
		if (!isValidAddressOrUsername(clean)) {
			setRepResult(null);
			setAddressError(
				lang === "ru"
					? "Неверный формат адреса или юзернейма"
					: "Invalid address or username format"
			);
			return;
		}
		setAddressError(null);
		setScanning(true);
		const timer = setTimeout(async () => {
			try {
				const res = await evaluateReputationReal(clean, networkMode);
				if (latestCleanRef.current !== clean) return;
				setRepResult(res);
				setAddressError(null);
			} catch (e: any) {
				if (latestCleanRef.current !== clean) return;
				setRepResult(null);
				setAddressError(null);
				const errMsg = e.message || "";
				if (errMsg.includes("registry") || errMsg.includes("not found")) {
					setAddressError(
						lang === "ru"
							? "Пользователь не зарегистрирован в реестре WhyNot"
							: "User is not registered in WhyNot registry"
					);
				} else {
					setAddressError(errMsg);
				}
			} finally {
				if (latestCleanRef.current === clean) {
					setScanning(false);
				}
			}
		}, 750);
		return () => clearTimeout(timer);
	}, [address, networkMode]);

	const handleSend = async () => {
		setLoading(true);
		let targetAddress = address.trim();
		const chain = getChainForAsset(asset.id);

		if (targetAddress.startsWith("@")) {
			try {
				showToast("Resolving Username...");
				const registry = await resolveUsername(targetAddress);
				if (!registry) {
					showToast(t("username_error"));
					setLoading(false);
					return;
				}
				if (!chain || !registry[chain]) {
					showToast(
						language === "ru"
							? `У @${targetAddress.slice(1)} нет адреса для ${asset.symbol}`
							: `@${targetAddress.slice(1)} has no ${asset.symbol} address`
					);
					setLoading(false);
					return;
				}
				targetAddress = registry[chain];
				showToast(`Resolved to ${asset.symbol} address`);
			} catch (err: any) {
				showToast(t("username_error"));
				setLoading(false);
				return;
			}
		}

		try {
			await sendTransaction(
				wallets,
				asset.id,
				targetAddress,
				Number(amount),
				networkMode
			);
			setBalances(await fetchBalances(wallets, networkMode));
			setStage("success");
		} catch (e: any) {
			showToast(e.message || "Transaction failed");
		}
		setLoading(false);
	};

	const handleCopyRecipient = () => {
		if (address) {
			const success = copyTextToClipboard(address);
			if (success) showToast(t("copied"));
		}
	};

	const assetDetails = getAssetDetails(asset.id);
	const conversionRate = rates[asset.id] || 0;
	const usdEquivalent = Number(amount) * conversionRate;
	const assetBalance = balances[asset.id] || 0;

	const firstLetter = address
		? address.replace("@", "").trim().charAt(0).toUpperCase()
		: "U";

	const circleRadius = 24;
	const circleCircumference = 2 * Math.PI * circleRadius;

	return (
		<AnimatePresence mode="wait">
			{stage === "confirm" && (
				<ConfirmView
					key="confirm"
					asset={asset}
					address={address}
					amount={amount}
					onBack={() => setStage("form")}
					onConfirm={handleSend}
					loading={loading}
					language={language}
					t={t}
					rates={rates}
					assetDetails={assetDetails}
				/>
			)}

			{stage === "success" && (
				<SuccessView
					key="success"
					asset={asset}
					address={address}
					amount={amount}
					onHome={() => setView("main")}
					language={language}
					t={t}
					rates={rates}
					assetDetails={assetDetails}
				/>
			)}

			{stage === "form" && (
				<motion.div
					key="form"
					initial={{ x: "100%" }}
					animate={{ x: 0 }}
					exit={{ x: "-30%", opacity: 0 }}
					transition={{ type: "spring", damping: 25, stiffness: 200 }}
					className="flex flex-col min-h-screen bg-black text-white p-5 select-none"
				>
					<div className="flex justify-between items-center mb-6 pt-2">
						<button
							onClick={() => setView("main")}
							className="p-2 bg-[#121214] border border-[#202023]/60 rounded-full hover:bg-[#1a1a1d] transition-all cursor-pointer text-white flex items-center justify-center"
						>
							<ChevronLeft size={20} />
						</button>
						<div className="text-center flex-1 pr-6">
							<h2 className="font-semibold text-[17px] leading-tight text-white">
								{language === "ru" ? "Перевод" : t("transfer_title")}
							</h2>
							<p className="text-[11px] text-gray-500 font-medium tracking-wide mt-0.5">
								WhyNotWallet
							</p>
						</div>
						<div className="w-9 h-9" />
					</div>

					<div className="mb-4.5">
						<label className="text-[14px] text-[#8e8e93] font-medium block mb-2 px-1">
							{language === "ru" ? "Получатель" : t("recipient_title")}
						</label>
						<div className="bg-[#121214] border border-[#202023]/40 rounded-[20px] p-3 flex items-center justify-between gap-3.5 focus-within:border-blue-500/30 transition-colors">
							<div className="flex items-center gap-3.5 flex-1 min-w-0">
								<div className="w-11 h-11 rounded-full bg-[#24213d] flex items-center justify-center font-bold text-lg text-[#9b8bf4] flex-shrink-0">
									{firstLetter}
								</div>
								<input
									type="text"
									placeholder={
										language === "ru"
											? "@юзернейм или адрес"
											: "@username or address"
									}
									value={address}
									onChange={(e) => setAddress(e.target.value)}
									className="w-full bg-transparent outline-none font-sans text-[15px] placeholder-gray-600 text-white min-w-0 select-text"
								/>
							</div>
							<button
								onClick={handleCopyRecipient}
								className="p-2 text-[#007aff] hover:scale-105 active:scale-95 transition-all cursor-pointer flex-shrink-0"
							>
								<Copy size={20} className="stroke-[2.5]" />
							</button>
						</div>
						{addressError && (
							<p className="text-xs text-red-500 mt-1.5 px-1 font-medium font-sans">
								{addressError}
							</p>
						)}
					</div>

					<div className="mb-5 relative">
						<label className="text-[14px] text-[#8e8e93] font-medium block mb-2 px-1">
							{language === "ru" ? "Сумма" : "Amount"}
						</label>
						<div className="bg-[#121214] border border-[#202023]/40 rounded-[20px] p-4 flex items-center justify-between gap-4 focus-within:border-blue-500/30 transition-colors">
							<div className="flex-1 min-w-0">
								<input
									type="number"
									placeholder="0"
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									className="w-full bg-transparent text-[32px] font-semibold outline-none placeholder-gray-800 text-white select-text font-sans"
								/>
								<p className="text-[13px] text-[#8e8e93] mt-0.5 font-sans">
									≈ $
									{usdEquivalent.toLocaleString("en-US", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</p>
							</div>
							<div className="relative">
								<button
									onClick={() =>
										setShowAssetDropdown(!showAssetDropdown)
									}
									className="flex items-center gap-2 bg-[#202023] hover:bg-[#252528] active:scale-95 px-3.5 py-1.5 rounded-full border border-[#2c2c2e]/60 cursor-pointer transition-all text-sm font-semibold text-white"
								>
									<div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
										<img
											src={asset.icon}
											alt={asset.symbol}
											className="w-full h-full object-contain"
										/>
									</div>
									<span>{asset.symbol}</span>
									<ChevronDown
										size={14}
										className="text-gray-400"
									/>
								</button>

								<AnimatePresence>
									{showAssetDropdown && (
										<motion.div
											initial={{
												opacity: 0,
												y: 10,
												scale: 0.95,
											}}
											animate={{
												opacity: 1,
												y: 0,
												scale: 1,
											}}
											exit={{
												opacity: 0,
												y: 10,
												scale: 0.95,
											}}
											className="absolute right-0 mt-2 bg-[#1a1a1e]/98 border border-[#252528] rounded-[16px] py-1.5 w-44 shadow-2xl z-50 overflow-hidden"
										>
											{ASSETS.map((opt) => (
												<div
													key={opt.id}
													onClick={() => {
														setAsset(opt);
														setShowAssetDropdown(
															false
														);
													}}
													className="px-3.5 py-2.5 hover:bg-[#202023] flex items-center gap-3 cursor-pointer transition-colors"
												>
													<img
														src={opt.icon}
														alt={opt.symbol}
														className="w-5 h-5 rounded-full object-contain"
													/>
													<div className="text-left">
														<div className="font-semibold text-xs text-white">
															{opt.symbol}
														</div>
														<div className="text-[9px] text-gray-500 uppercase font-mono">
															{opt.network}
														</div>
													</div>
												</div>
											))}
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</div>
					</div>

					<AnimatePresence mode="wait">
						{scanning && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								className="bg-[#121214] border border-[#202023]/40 rounded-[20px] p-5 mb-5 flex flex-col items-center justify-center gap-3"
							>
								<div className="loader border-blue-500 border-t-transparent w-6 h-6" />
								<span className="text-xs text-gray-500 font-medium">
									Scanning recipient reputation...
								</span>
							</motion.div>
						)}

						{!scanning && repResult && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								onClick={() => setShowDetails(!showDetails)}
								className="bg-[#121214] border border-[#202023]/40 hover:border-blue-500/10 rounded-[20px] p-4.5 mb-5 cursor-pointer transition-all relative overflow-hidden select-none active:scale-[0.99]"
							>
								<div className="flex justify-between items-center mb-3">
									<span className="text-[14px] text-[#8e8e93] font-medium">
										{language === "ru"
											? "Оценка репутации кошелька"
											: t("reputation_title")}
									</span>
									<div className="flex items-center gap-1 text-[#387aff] text-[13px] font-semibold">
										<Sparkles
											size={13}
											className="fill-[#387aff] stroke-[2.5]"
										/>
										<span>
											{language === "ru"
												? "Оценено AI"
												: t("evaluated_ai")}
										</span>
									</div>
								</div>

								<div className="flex items-start gap-4">
									<div className="relative w-14 h-14 flex-shrink-0 mt-0.5">
										<svg className="w-14 h-14 transform -rotate-90">
											<circle
												cx="28"
												cy="28"
												r={circleRadius}
												className="stroke-[#222]/60"
												strokeWidth="3.5"
												fill="transparent"
											/>
											<circle
												cx="28"
												cy="28"
												r={circleRadius}
												className="stroke-[#007aff] transition-all duration-1000 ease-out"
												strokeWidth="3.5"
												fill="transparent"
												strokeDasharray={
													circleCircumference
												}
												strokeDashoffset={
													circleCircumference -
													(repResult.score / 10) *
														circleCircumference
												}
												strokeLinecap="round"
											/>
										</svg>
										<div className="absolute inset-0 flex flex-col items-center justify-center">
											<span className="text-[15px] font-bold leading-none text-white">
												{repResult.score}
											</span>
											<span className="text-[9px] text-[#8e8e93] mt-0.5 font-medium">
												/10
											</span>
										</div>
									</div>

									<div className="flex-1 min-w-0">
										<h4
											className={`font-semibold text-[15px] mb-1 ${repResult.colorClass}`}
										>
											{t(repResult.labelKey)}
										</h4>
										<p className="text-[13px] text-[#8e8e93] leading-normal font-normal">
											{t(repResult.descKey)}
										</p>
									</div>
								</div>

								{showDetails && (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: "auto" }}
										className="mt-4 pt-4 border-t border-[#222]/80 space-y-3"
									>
										{(
											Object.entries(
												repResult.criteria
											) as [string, number][]
										).map(([key, val]) => (
											<div key={key} className="space-y-1">
												<div className="flex justify-between items-center text-[10px] text-gray-500 font-semibold uppercase">
													<span>
														{t(`criteria_${key}`)}
													</span>
													<span className="font-mono">
														{val} / 10
													</span>
												</div>
												<div className="w-full bg-[#1c1c1e] h-1 rounded-full overflow-hidden">
													<div
														className={`h-full rounded-full transition-all duration-700 ${
															val >= 8.5
																? "bg-emerald-500"
																: val >= 7.0
																	? "bg-green-500"
																	: val >= 4.5
																		? "bg-amber-500"
																		: "bg-red-500"
														}`}
														style={{
															width: `${val * 10}%`,
														}}
													/>
												</div>
											</div>
										))}
									</motion.div>
								)}
							</motion.div>
						)}
					</AnimatePresence>

					<div className="mb-6">
						<span className="text-[14px] text-[#8e8e93] font-medium block mb-2 px-1">
							{language === "ru"
								? "Детали перевода"
								: "Transfer Details"}
						</span>
						<div className="bg-[#121214] border border-[#202023]/40 rounded-[20px] px-4 py-1.5 divide-y divide-[#202023]/40">
							<div className="flex justify-between items-center py-3.5">
								<div className="flex items-center gap-3 text-sm text-[#8e8e93] font-normal">
									<Wallet
										size={16}
										className="text-[#8e8e93] stroke-[2]"
									/>
									<span>{t("network_fee")}</span>
								</div>
								<span className="text-sm text-white font-medium font-mono">
									{assetDetails.fee}
								</span>
							</div>

							<div className="flex justify-between items-center py-3.5">
								<div className="flex items-center gap-3 text-sm text-[#8e8e93] font-normal">
									<Clock
										size={16}
										className="text-[#8e8e93] stroke-[2]"
									/>
									<span>{t("transfer_time")}</span>
								</div>
								<span className="text-sm text-white font-medium">
									{language === "ru"
										? assetDetails.timeRu
										: assetDetails.timeEn}
								</span>
							</div>

							<div className="flex justify-between items-center py-3.5">
								<div className="flex items-center gap-3 text-sm text-[#8e8e93] font-normal">
									<ShieldCheck
										size={16}
										className="text-[#8e8e93] stroke-[2]"
									/>
									<span>{t("protection_title")}</span>
								</div>
								<span className="text-sm text-[#30d158] font-semibold">
									{t("protection_active")}
								</span>
							</div>
						</div>
					</div>

					<div className="mt-auto pt-4 pb-2">
						<button
							onClick={() => setStage("confirm")}
							disabled={
								loading ||
								!amount ||
								Number(amount) <= 0 ||
								!address ||
								!!addressError ||
								Number(amount) > assetBalance
							}
							className="w-full py-4 bg-[#007aff] hover:bg-[#006ee6] active:bg-[#005ec4] text-white text-[16px] font-semibold rounded-[16px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/5 cursor-pointer disabled:bg-[#3a3a3c] disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
						>
							<Send
								size={16}
								className="text-white fill-white shrink-0"
							/>
							<span>
								{language === "ru"
									? `Отправить ${amount || 0} ${asset.symbol}`
									: `Send ${amount || 0} ${asset.symbol}`}
							</span>
						</button>

						<div className="flex items-start justify-center gap-2 mt-4 px-4 text-center">
							<Lock
								size={12}
								className="text-[#4e4e50] flex-shrink-0 mt-0.5"
							/>
							<p className="text-[11px] text-[#4e4e50] font-normal leading-relaxed">
								{t("disclaimer")}
							</p>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export const HistoryView = () => {
	const { setView, wallets, networkMode, t } = useWallet();
	const [txs, setTxs] = useState<WalletTransaction[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadHistory = async () => {
			setLoading(true);
			const data = await fetchTransactions(
				wallets.ton.address,
				networkMode
			);
			setTxs(data);
			setLoading(false);
		};
		loadHistory();
	}, [wallets, networkMode]);

	return (
		<motion.div
			initial={{ x: "100%" }}
			animate={{ x: 0 }}
			transition={{ type: "spring", damping: 25, stiffness: 200 }}
			className="flex flex-col min-h-screen p-5"
		>
			<div className="flex items-center gap-4 mb-6 pt-2">
				<button
					onClick={() => setView("main")}
					className="p-2 bg-[#111] rounded-full hover:bg-[#222] transition-colors"
				>
					<ChevronLeft size={20} />
				</button>
				<h2 className="font-medium text-lg">{t("history")}</h2>
			</div>

			<p className="text-xs text-gray-500 font-mono mb-6">
				{t("history_desc")}
			</p>

			{loading ? (
				<div className="flex-1 flex items-center justify-center">
					<div className="loader" />
				</div>
			) : txs.length === 0 ? (
				<div className="flex-1 flex flex-col items-center justify-center text-gray-500 font-mono">
					<Clock size={32} className="mb-4 opacity-50" />
					<p>{t("no_txs")}</p>
				</div>
			) : (
				<div className="flex-1 overflow-y-auto space-y-4 pr-1">
					{txs.map((tx) => (
						<div
							key={tx.hash}
							className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a]"
						>
							<div className="flex items-center gap-3">
								<div
									className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === "receive" ? "bg-green-950/40 text-green-500 border border-green-900/50" : "bg-[#111] text-gray-400 border border-[#222]"}`}
								>
									{tx.type === "receive" ? (
										<ArrowDownToLine size={18} />
									) : (
										<ArrowUpRight size={18} />
									)}
								</div>
								<div>
									<h4 className="font-semibold text-sm capitalize">
										{tx.type === "receive"
											? "Received"
											: "Sent"}
									</h4>
									<p className="text-[10px] text-gray-500 font-mono mt-0.5">
										{tx.type === "receive"
											? `From: ${tx.from.slice(0, 4)}...${tx.from.slice(-4)}`
											: `To: ${tx.to.slice(0, 4)}...${tx.to.slice(-4)}`}
									</p>
								</div>
							</div>
							<div className="text-right">
								<h4
									className={`font-mono font-bold ${tx.type === "receive" ? "text-green-500" : "text-white"}`}
								>
									{tx.type === "receive" ? "+" : "-"}
									{tx.value.toLocaleString()} TON
								</h4>
								<p className="text-[10px] text-gray-500 font-mono mt-1">
									{new Date(
										tx.timestamp
									).toLocaleDateString()}
								</p>
							</div>
						</div>
					))}
				</div>
			)}
		</motion.div>
	);
};

export const MoreView = () => {
	const { setView, language } = useWallet();
	const items = [
		{
			id: "receive",
			title: language === "ru" ? "Пополнить" : "Receive",
			description:
				language === "ru"
					? "Адреса и QR-код кошелька"
					: "Wallet addresses and QR code",
			icon: ArrowDownToLine,
		},
		{
			id: "history",
			title: language === "ru" ? "История" : "History",
			description:
				language === "ru"
					? "Операции из блокчейн-реестра"
					: "Transactions from the blockchain ledger",
			icon: Clock,
		},
		{
			id: "main",
			title: language === "ru" ? "Активы" : "Assets",
			description:
				language === "ru"
					? "Баланс и список монет"
					: "Balance and token list",
			icon: Wallet,
		},
		{
			id: "settings",
			title: language === "ru" ? "Настройки" : "Settings",
			description:
				language === "ru"
					? "Сеть, язык и seed-фраза"
					: "Network, language and seed phrase",
			icon: Settings,
		},
	] as const;

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ type: "spring", damping: 25, stiffness: 200 }}
			className="flex flex-col min-h-screen p-5 pb-32"
		>
			<div className="flex justify-between items-center mt-4 mb-8">
				<div>
					<p className="text-[11px] text-gray-500 font-mono uppercase tracking-wider mb-2">
						WhyNot?
					</p>
					<h2 className="font-medium text-2xl leading-tight">
						{language === "ru" ? "Еще" : "More"}
					</h2>
				</div>
				<div className="w-12 h-12 bg-[#111] border border-[#222] rounded-2xl flex items-center justify-center text-[#2f7dff]">
					<Grid2X2 size={24} strokeWidth={2.8} />
				</div>
			</div>

			<div className="grid grid-cols-2 gap-3">
				{items.map(({ id, title, description, icon: Icon }) => (
					<button
						key={id}
						type="button"
						onClick={() => setView(id)}
						className="min-h-[142px] rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-4 text-left transition-all active:scale-[0.98] hover:bg-[#111]"
					>
						<div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#151515] text-white border border-[#242424]">
							<Icon size={21} />
						</div>
						<h3 className="mb-1 text-sm font-semibold text-white">
							{title}
						</h3>
						<p className="text-xs leading-snug text-gray-500">
							{description}
						</p>
					</button>
				))}
			</div>
		</motion.div>
	);
};
