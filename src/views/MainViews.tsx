import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
	ArrowDownToLine,
	ArrowUpRight,
	Eye,
	EyeOff,
	ChevronLeft,
	ChevronDown,
	Copy,
	Settings,
	Clock,
} from "lucide-react";
import { useWallet } from "../store/WalletContext";

import {
	ASSETS,
	sendTransaction,
	fetchBalances,
	fetchTransactions,
	resolveUsername,
} from "../services/blockchain";

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
		navigator.clipboard.writeText(text);
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
	try {
		const successful = document.execCommand("copy");
		document.body.removeChild(textArea);
		return successful;
	} catch (err) {
		document.body.removeChild(textArea);
		return false;
	}
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
	const { setView, balances, rates, t } = useWallet();
	const [hide, setHide] = useState(false);

	const totalUsd = ASSETS.reduce(
		(acc, a) => acc + (balances[a.id] || 0) * (rates[a.id] || 0),
		0
	);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="flex flex-col min-h-screen p-5 pb-10"
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
								className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a] hover:bg-[#111] transition-colors cursor-pointer"
							>
								<div className="flex items-center gap-4">
									<img
										src={asset.icon}
										alt={asset.symbol}
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
			</div>
		</motion.div>
	);
};

export const ReceiveView = () => {
	const { setView, wallets, showToast, t } = useWallet();
	const [asset, setAsset] = useState(ASSETS[0]);
	const address = wallets[asset.id]?.address || wallets.ton.address;

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

export const SendView = () => {
	const {
		setView,
		wallets,
		balances,
		setBalances,
		showToast,
		networkMode,
		t,
	} = useWallet();
	const [asset, setAsset] = useState(ASSETS[0]);
	const [address, setAddress] = useState("");
	const [amount, setAmount] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSend = async () => {
		setLoading(true);
		let targetAddress = address.trim();

		if (targetAddress.startsWith("@")) {
			try {
				showToast("Resolving Username...");
				targetAddress = await resolveUsername(targetAddress);
				showToast(`Resolved to: ${targetAddress.slice(0, 8)}...`);
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
			showToast(t("tx_sent"));
			setView("main");
			setBalances(await fetchBalances(wallets, networkMode));
		} catch (e: any) {
			showToast(e.message || "Transaction failed");
		}
		setLoading(false);
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
				<h2 className="font-medium text-lg">{t("send")}</h2>
			</div>

			<Combobox value={asset} onChange={setAsset} options={ASSETS} />

			<div className="bg-[#111] border border-[#222] rounded-2xl p-4 mb-6 relative">
				<div className="flex justify-between items-center mb-3">
					<label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
						{t("amount")}
					</label>
					<span
						className={`text-xs font-mono ${Number(amount) > (balances[asset.id] || 0) ? "text-[#ff4444]" : "text-gray-400"}`}
					>
						{t("available")}: {balances[asset.id] || 0}{" "}
						{asset.symbol}
					</span>
				</div>
				<div className="flex items-center">
					<input
						type="number"
						placeholder="0.0"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						className="w-full bg-transparent text-3xl font-medium outline-none placeholder-gray-700 select-text"
					/>
					<span className="text-xl font-medium text-gray-500 ml-2">
						{asset.symbol}
					</span>
				</div>
			</div>

			<div className="bg-[#111] border border-[#222] rounded-2xl p-4 mb-6">
				<label className="text-xs text-gray-500 uppercase tracking-wider font-semibold block mb-3">
					{t("recipient")}
				</label>
				<input
					type="text"
					placeholder={`Enter address or @username`}
					value={address}
					onChange={(e) => setAddress(e.target.value)}
					className="w-full bg-transparent outline-none font-mono text-sm placeholder-gray-700 break-all select-text"
				/>
			</div>

			<div className="mt-auto pb-6">
				<button
					onClick={handleSend}
					disabled={loading || !amount || !address}
					className="w-full py-4 bg-white text-black font-semibold rounded-2xl disabled:opacity-30 disabled:active:scale-100 active:scale-[0.98] transition-all flex justify-center"
				>
					{loading ? (
						<div
							className="loader"
							style={{
								borderColor: "rgba(0,0,0,0.1)",
								borderTopColor: "#000",
							}}
						/>
					) : (
						t("continue").toUpperCase()
					)}
				</button>
			</div>
		</motion.div>
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
