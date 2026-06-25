import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Plus,
	Eye,
	EyeOff,
	Lock,
	Unlock,
	Sliders,
	MoreHorizontal,
	Check,
	Copy,
	Trash2,
	Palette,
	X,
	Info,
} from "lucide-react";
import { useWallet } from "../store/WalletContext";

interface CardItem {
	id: string;
	name: string;
	number: string;
	cvv: string;
	expiry: string;
	balance: number;
	holder: string;
	isFrozen: boolean;
	design: "neon" | "carbon" | "gold" | "royal";
	brand: "visa" | "mastercard";
}

interface CardTransaction {
	id: string;
	cardId: string;
	title: string;
	amount: number; // positive for deposit, negative for purchase
	currency: string;
	time: string;
	logoText: string;
	category: string;
	merchant: string;
	status: "success" | "pending";
}

export const CardView = () => {
	const { language, t, showToast } = useWallet();
	const WebApp = (window as any).Telegram?.WebApp;

	// Local storage sync
	const [cards, setCards] = useState<CardItem[]>(() => {
		const saved = localStorage.getItem("whynot_cards");
		if (saved) return JSON.parse(saved);
		return [
			{
				id: "card-1",
				name: "WhyNot Card",
				number: "4242424242424242",
				cvv: "732",
				expiry: "12/30",
				balance: 3.16,
				holder: "MAXIM X",
				isFrozen: false,
				design: "neon",
				brand: "visa",
			},
		];
	});

	const [transactions] = useState<CardTransaction[]>(() => {
		const saved = localStorage.getItem("whynot_card_txs");
		if (saved) return JSON.parse(saved);
		return [
			{
				id: "tx-1",
				cardId: "card-1",
				title: "Netflix",
				amount: -9.99,
				currency: "USD",
				time: language === "ru" ? "Сегодня, 15:42" : "Today, 15:42",
				logoText: "N",
				category: "entertainment",
				merchant: "Netflix Inc.",
				status: "success",
			},
			{
				id: "tx-2",
				cardId: "card-1",
				title: "Amazon",
				amount: -25.11,
				currency: "USD",
				time: language === "ru" ? "Сегодня, 13:27" : "Today, 13:27",
				logoText: "a",
				category: "shopping",
				merchant: "Amazon.com LLC",
				status: "success",
			},
			{
				id: "tx-3",
				cardId: "card-1",
				title: language === "ru" ? "Пополнение" : "Deposit",
				amount: 100.00,
				currency: "USDT",
				time: language === "ru" ? "Сегодня, 09:12" : "Today, 09:12",
				logoText: "+",
				category: "transfer",
				merchant: "External TON Wallet",
				status: "success",
			},
		];
	});

	const [activeCardIndex, setActiveCardIndex] = useState(0);
	const activeCard = cards[activeCardIndex] || cards[0];

	// Modals & Sheets State
	const [showDetails, setShowDetails] = useState(false);
	const [activeModal, setActiveModal] = useState<"none" | "add" | "limits" | "more" | "design" | "txDetail" | "allTxs">("none");
	const [selectedTx, setSelectedTx] = useState<CardTransaction | null>(null);

	// Create card form
	const [newCardName, setNewCardName] = useState("");
	const [newCardDesign, setNewCardDesign] = useState<"neon" | "carbon" | "gold" | "royal">("neon");
	const [newCardBrand, setNewCardBrand] = useState<"visa" | "mastercard">("visa");

	// Limits State
	const [dailyLimit, setDailyLimit] = useState(500);
	const [monthlyLimit, setMonthlyLimit] = useState(2500);

	useEffect(() => {
		localStorage.setItem("whynot_cards", JSON.stringify(cards));
	}, [cards]);

	useEffect(() => {
		localStorage.setItem("whynot_card_txs", JSON.stringify(transactions));
	}, [transactions]);

	const playHaptic = (type: "light" | "medium" | "heavy" | "success" | "error" = "light") => {
		if (!WebApp) return;
		if (type === "success" || type === "error") {
			WebApp.HapticFeedback?.notificationOccurred(type);
		} else {
			WebApp.HapticFeedback?.impactOccurred(type);
		}
	};

	const formatCardNumber = (num: string, visible: boolean) => {
		if (!visible) {
			return `••••  ••••  ••••  ${num.slice(-4)}`;
		}
		return num.replace(/(.{4})/g, "$1  ").trim();
	};

	const copyToClipboard = (text: string, label: string) => {
		navigator.clipboard.writeText(text);
		playHaptic("success");
		showToast(language === "ru" ? `${label} скопирован!` : `${label} copied!`);
	};

	const toggleFreeze = () => {
		if (!activeCard) return;
		playHaptic("medium");
		setCards(prev => prev.map((c, i) => i === activeCardIndex ? { ...c, isFrozen: !c.isFrozen } : c));
		showToast(
			activeCard.isFrozen
				? (language === "ru" ? "Карта разморожена" : "Card unfrozen")
				: (language === "ru" ? "Карта временно заморожена" : "Card frozen")
		);
	};

	const handleCreateCard = (e: React.FormEvent) => {
		e.preventDefault();
		const name = newCardName.trim() || (language === "ru" ? "Моя Карта" : "My Card");
		
		// Generate random details
		const randomSuffix = Math.floor(100000000000 + Math.random() * 900000000000);
		const cardNumber = `424268${randomSuffix}`;
		const cvv = String(Math.floor(100 + Math.random() * 900));
		const expMonth = String(Math.floor(1 + Math.random() * 12)).padStart(2, "0");
		const expYear = String(new Date().getFullYear() + 4).slice(-2);

		const newCard: CardItem = {
			id: `card-${Date.now()}`,
			name,
			number: cardNumber,
			cvv,
			expiry: `${expMonth}/${expYear}`,
			balance: 0.00,
			holder: cards[0]?.holder || "MAXIM X",
			isFrozen: false,
			design: newCardDesign,
			brand: newCardBrand,
		};

		setCards(prev => [...prev, newCard]);
		setActiveCardIndex(cards.length); // switch to the new card
		setNewCardName("");
		setActiveModal("none");
		playHaptic("success");
		showToast(language === "ru" ? "Карта успешно создана!" : "Card created successfully!");
	};

	const deleteCard = () => {
		if (cards.length <= 1) {
			playHaptic("error");
			showToast(language === "ru" ? "Нельзя удалить единственную карту!" : "Cannot delete the only card!");
			return;
		}
		playHaptic("heavy");
		setCards(prev => prev.filter((_, i) => i !== activeCardIndex));
		setActiveCardIndex(0);
		setActiveModal("none");
		showToast(language === "ru" ? "Карта закрыта" : "Card closed");
	};

	const changeDesign = (design: "neon" | "carbon" | "gold" | "royal") => {
		playHaptic("light");
		setCards(prev => prev.map((c, i) => i === activeCardIndex ? { ...c, design } : c));
		setActiveModal("none");
	};

	const designClasses = {
		neon: "bg-gradient-to-br from-[#1c1c24] via-[#0d0f1a] to-[#2c2055] border-purple-500/20 shadow-purple-900/10",
		carbon: "bg-gradient-to-br from-[#1f1f23] via-[#0b0c10] to-[#2b2b36] border-zinc-700/30 shadow-black/40",
		gold: "bg-gradient-to-br from-[#241e12] via-[#0b0906] to-[#403115] border-amber-500/20 shadow-amber-900/5",
		royal: "bg-gradient-to-br from-[#121c2c] via-[#060a12] to-[#152e4f] border-blue-500/20 shadow-blue-900/10",
	};

	const activeCardDesignClass = activeCard ? designClasses[activeCard.design] : designClasses.neon;

	const filteredTxs = transactions.filter(t => t.cardId === activeCard?.id);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
			className="flex flex-col min-h-screen p-5 pb-32 overflow-y-auto no-scrollbar w-full"
		>
			{/* Top Header */}
			<div className="flex justify-between items-center mt-3 mb-6">
				<h1 className="text-2xl font-bold tracking-tight text-white">
					{t("my_cards")}
				</h1>
				<button
					type="button"
					onClick={() => {
						playHaptic("light");
						setActiveModal("add");
					}}
					className="w-10 h-10 rounded-full bg-[#111] border border-[#222] flex items-center justify-center text-white active:scale-90 transition-transform"
				>
					<Plus size={20} />
				</button>
			</div>

			{/* Cards Slider / Carousel */}
			{cards.length > 0 && (
				<div className="flex flex-col items-center mb-6">
					{/* Active Card Body */}
					<motion.div
						key={activeCard?.id}
						initial={{ scale: 0.95, opacity: 0.8 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ type: "spring", stiffness: 300, damping: 25 }}
						onClick={() => {
							playHaptic("light");
							setShowDetails(!showDetails);
						}}
						className={`relative w-full aspect-[1.586/1] rounded-[24px] border p-6 flex flex-col justify-between overflow-hidden cursor-pointer select-none shadow-2xl ${activeCardDesignClass}`}
					>
						{/* Frosty freeze overlay */}
						<AnimatePresence>
							{activeCard?.isFrozen && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									className="absolute inset-0 bg-blue-950/40 backdrop-blur-[6px] z-10 flex flex-col items-center justify-center"
								>
									<div className="w-14 h-14 rounded-full bg-blue-900/30 border border-blue-500/20 flex items-center justify-center text-blue-300 mb-2">
										<Lock size={26} className="animate-pulse" />
									</div>
									<span className="text-sm font-semibold text-blue-200 tracking-wider">
										{language === "ru" ? "ЗАМОРОЖЕНА" : "FROZEN"}
									</span>
								</motion.div>
							)}
						</AnimatePresence>

						{/* Top row */}
						<div className="flex justify-between items-start z-0">
							<div className="flex flex-col">
								<span className="text-white font-semibold tracking-wide text-base">
									{activeCard?.name}
								</span>
								<span className="text-[10px] text-gray-400 font-mono tracking-widest mt-0.5">
									{t("virtual")}
								</span>
							</div>
							<div className="text-right">
								<span className="text-xs font-bold text-gray-500 uppercase tracking-widest font-mono">
									{activeCard?.brand}
								</span>
							</div>
						</div>

						{/* Number row */}
						<div className="my-auto py-2 z-0">
							<p className="text-white text-lg sm:text-xl font-mono tracking-widest text-left">
								{formatCardNumber(activeCard?.number || "", showDetails)}
							</p>
						</div>

						{/* Bottom row */}
						<div className="flex justify-between items-end z-0">
							<div className="flex flex-col text-left">
								<span className="text-[9px] text-gray-400 font-mono uppercase tracking-wider">
									{t("cardholder")}
								</span>
								<span className="text-xs font-semibold text-white tracking-wide mt-0.5 font-mono">
									{activeCard?.holder}
								</span>
							</div>
							<div className="text-right flex flex-col">
								<span className="text-xs font-bold text-white text-lg font-mono">
									${activeCard?.balance.toFixed(2)}
								</span>
							</div>
						</div>
					</motion.div>

					{/* Carousel Dots */}
					{cards.length > 1 && (
						<div className="flex gap-1.5 mt-3.5">
							{cards.map((_, i) => (
								<button
									key={i}
									type="button"
									onClick={() => {
										playHaptic("light");
										setActiveCardIndex(i);
										setShowDetails(false);
									}}
									className={`h-1.5 rounded-full transition-all ${
										i === activeCardIndex ? "w-4 bg-white" : "w-1.5 bg-zinc-700"
									}`}
								/>
							))}
						</div>
					)}
				</div>
			)}

			{/* Core Actions Grid */}
			<div className="grid grid-cols-4 gap-2.5 mb-7">
				<button
					type="button"
					onClick={() => {
						playHaptic("light");
						setShowDetails(!showDetails);
					}}
					className="flex flex-col items-center bg-[#0d0d0d]/80 border border-zinc-900 rounded-2xl py-3 px-1 active:scale-95 transition-all text-center"
				>
					<div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 mb-1.5">
						{showDetails ? <EyeOff size={18} /> : <Eye size={18} />}
					</div>
					<span className="text-[10px] font-semibold text-zinc-400">
						{t("card_details")}
					</span>
				</button>

				<button
					type="button"
					onClick={toggleFreeze}
					className="flex flex-col items-center bg-[#0d0d0d]/80 border border-zinc-900 rounded-2xl py-3 px-1 active:scale-95 transition-all text-center"
				>
					<div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-1.5 transition-colors ${
						activeCard?.isFrozen 
							? "bg-blue-900/20 border-blue-500/20 text-blue-400" 
							: "bg-zinc-900 border-zinc-800 text-zinc-300"
					}`}>
						{activeCard?.isFrozen ? <Unlock size={18} /> : <Lock size={18} />}
					</div>
					<span className="text-[10px] font-semibold text-zinc-400">
						{activeCard?.isFrozen ? (language === "ru" ? "Разморозить" : "Unfreeze") : t("freeze_card")}
					</span>
				</button>

				<button
					type="button"
					onClick={() => {
						playHaptic("light");
						setActiveModal("limits");
					}}
					className="flex flex-col items-center bg-[#0d0d0d]/80 border border-zinc-900 rounded-2xl py-3 px-1 active:scale-95 transition-all text-center"
				>
					<div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 mb-1.5">
						<Sliders size={18} />
					</div>
					<span className="text-[10px] font-semibold text-zinc-400">
						{t("limits")}
					</span>
				</button>

				<button
					type="button"
					onClick={() => {
						playHaptic("light");
						setActiveModal("more");
					}}
					className="flex flex-col items-center bg-[#0d0d0d]/80 border border-zinc-900 rounded-2xl py-3 px-1 active:scale-95 transition-all text-center"
				>
					<div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 mb-1.5">
						<MoreHorizontal size={18} />
					</div>
					<span className="text-[10px] font-semibold text-zinc-400">
						{t("more_actions")}
					</span>
				</button>
			</div>

			{/* Detailed Info Overlay when details are shown */}
			<AnimatePresence>
				{showDetails && activeCard && (
					<motion.div
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						className="mb-6 p-4 rounded-2xl bg-[#0e0e11] border border-zinc-900 flex flex-col gap-3.5 text-sm"
					>
						<div className="flex justify-between items-center">
							<span className="text-zinc-500">{t("card_number")}</span>
							<div className="flex items-center gap-1.5">
								<span className="font-mono text-white tracking-wide">
									{activeCard.number.replace(/(.{4})/g, "$1 ").trim()}
								</span>
								<button
									type="button"
									onClick={() => copyToClipboard(activeCard.number, t("card_number"))}
									className="text-zinc-400 hover:text-white p-1 rounded active:scale-90"
								>
									<Copy size={14} />
								</button>
							</div>
						</div>
						<div className="h-px bg-zinc-900" />
						<div className="flex justify-between items-center">
							<span className="text-zinc-500">{t("expiry_date")}</span>
							<span className="font-mono text-white">{activeCard.expiry}</span>
						</div>
						<div className="h-px bg-zinc-900" />
						<div className="flex justify-between items-center">
							<span className="text-zinc-500">{t("cvv")}</span>
							<div className="flex items-center gap-1.5">
								<span className="font-mono text-white">{activeCard.cvv}</span>
								<button
									type="button"
									onClick={() => copyToClipboard(activeCard.cvv, "CVV")}
									className="text-zinc-400 hover:text-white p-1 rounded active:scale-90"
								>
									<Copy size={14} />
								</button>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Transactions Section */}
			<div className="flex flex-col flex-1">
				<div className="flex justify-between items-center mb-3">
					<h2 className="text-sm font-semibold tracking-wide text-zinc-400">
						{t("recent_ops")}
					</h2>
					{filteredTxs.length > 0 && (
						<button
							type="button"
							onClick={() => {
								playHaptic("light");
								setActiveModal("allTxs");
							}}
							className="text-xs font-semibold text-blue-400 hover:text-blue-300"
						>
							{t("see_all")}
						</button>
					)}
				</div>

				<div className="flex flex-col gap-2">
					{filteredTxs.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-8 rounded-2xl bg-[#080808] border border-zinc-900/50">
							<Info size={24} className="text-zinc-600 mb-2" />
							<p className="text-xs text-zinc-500">
								{language === "ru" ? "Нет операций по этой карте" : "No operations for this card"}
							</p>
						</div>
					) : (
						filteredTxs.slice(0, 3).map(tx => {
							const isDeposit = tx.amount > 0;
							return (
								<button
									key={tx.id}
									type="button"
									onClick={() => {
										playHaptic("light");
										setSelectedTx(tx);
										setActiveModal("txDetail");
									}}
									className="flex justify-between items-center p-3.5 rounded-2xl bg-[#080808]/90 border border-zinc-900 hover:border-zinc-800 transition-all active:scale-[0.99] text-left w-full"
								>
									<div className="flex items-center gap-3">
										<div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${
											isDeposit 
												? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" 
												: "bg-zinc-900 border-zinc-800 text-white"
										}`}>
											{tx.logoText}
										</div>
										<div className="flex flex-col">
											<span className="text-sm font-medium text-white">
												{tx.title}
											</span>
											<span className="text-[11px] text-zinc-500 font-mono mt-0.5">
												{tx.time}
											</span>
										</div>
									</div>
									<div className="text-right flex flex-col">
										<span className={`text-sm font-bold font-mono ${
											isDeposit ? "text-emerald-400" : "text-white"
										}`}>
											{isDeposit ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
										</span>
										<span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
											{tx.currency}
										</span>
									</div>
								</button>
							);
						})
					)}
				</div>
			</div>

			{/* MODALS & BOTTOM SHEETS */}
			<AnimatePresence>
				{activeModal !== "none" && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setActiveModal("none")}
							className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center"
						>
							{/* Bottom Sheets container */}
							<div className="relative w-full max-w-md h-full flex items-end justify-center px-4 pointer-events-none">
								<motion.div
									initial={{ y: "100%" }}
									animate={{ y: 0 }}
									exit={{ y: "100%" }}
									transition={{ type: "spring", damping: 30, stiffness: 300 }}
									onClick={(e) => e.stopPropagation()}
									className="w-full max-h-[85vh] overflow-y-auto no-scrollbar rounded-t-[28px] border-t border-zinc-900 bg-[#0d0d10] p-6 pb-12 pointer-events-auto flex flex-col gap-5 shadow-2xl"
								>
									{/* Top Grab Handle */}
									<div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mb-2 shrink-0" />

									{/* 1. ADD CARD MODAL */}
									{activeModal === "add" && (
										<form onSubmit={handleCreateCard} className="flex flex-col gap-4">
											<div className="flex justify-between items-center">
												<h3 className="text-lg font-bold text-white">
													{language === "ru" ? "Новая карта" : "New Virtual Card"}
												</h3>
												<button
													type="button"
													onClick={() => setActiveModal("none")}
													className="text-zinc-500 hover:text-white"
												>
													<X size={20} />
												</button>
											</div>

											<div className="flex flex-col gap-1.5 text-left">
												<label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
													{language === "ru" ? "Название карты" : "Card Name"}
												</label>
												<input
													type="text"
													value={newCardName}
													onChange={(e) => setNewCardName(e.target.value)}
													placeholder="WhyNot Card"
													maxLength={20}
													className="w-full bg-[#16161c] border border-zinc-800 rounded-xl py-3.5 px-4 text-white text-sm outline-none focus:border-zinc-700 transition-colors"
												/>
											</div>

											{/* Brand Selector */}
											<div className="flex flex-col gap-2 text-left">
												<label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
													{language === "ru" ? "Платежная система" : "Card Brand"}
												</label>
												<div className="grid grid-cols-2 gap-3">
													{(["visa", "mastercard"] as const).map(brand => (
														<button
															key={brand}
															type="button"
															onClick={() => {
																playHaptic("light");
																setNewCardBrand(brand);
															}}
															className={`py-3.5 rounded-xl border text-sm font-semibold capitalize transition-all ${
																newCardBrand === brand 
																	? "bg-white text-black border-white" 
																	: "bg-[#16161c] text-zinc-400 border-zinc-900"
															}`}
														>
															{brand}
														</button>
													))}
												</div>
											</div>

											{/* Design Picker */}
											<div className="flex flex-col gap-2 text-left">
												<label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
													{language === "ru" ? "Стиль карты" : "Design style"}
												</label>
												<div className="grid grid-cols-4 gap-2.5">
													{(["neon", "carbon", "gold", "royal"] as const).map(style => {
														const active = newCardDesign === style;
														return (
															<button
																key={style}
																type="button"
																onClick={() => {
																	playHaptic("light");
																	setNewCardDesign(style);
																}}
																className={`aspect-[1.5] rounded-lg border flex flex-col justify-end p-1.5 transition-all text-left overflow-hidden ${
																	designClasses[style]
																} ${active ? "ring-2 ring-white scale-105" : "opacity-72"}`}
															>
																<span className="text-[7px] font-bold text-white uppercase tracking-wider">
																	{style}
																</span>
															</button>
														);
													})}
												</div>
											</div>

											<button
												type="submit"
												className="w-full bg-[#3b82f6] text-white font-bold py-4 rounded-2xl mt-3 active:scale-[0.98] transition-transform text-sm"
											>
												{t("add_card")}
											</button>
										</form>
									)}

									{/* 2. LIMITS SHEETS */}
									{activeModal === "limits" && (
										<div className="flex flex-col gap-4">
											<div className="flex justify-between items-center">
												<h3 className="text-lg font-bold text-white">
													{language === "ru" ? "Лимиты по карте" : "Card Limits"}
												</h3>
												<button
													type="button"
													onClick={() => setActiveModal("none")}
													className="text-zinc-500 hover:text-white"
												>
													<X size={20} />
												</button>
											</div>

											{/* Daily Limit */}
											<div className="flex flex-col gap-2 text-left">
												<div className="flex justify-between text-xs font-semibold uppercase tracking-wider">
													<span className="text-zinc-500">
														{language === "ru" ? "Дневной лимит" : "Daily Limit"}
													</span>
													<span className="text-blue-400 font-mono">${dailyLimit}</span>
												</div>
												<input
													type="range"
													min="50"
													max="2000"
													step="50"
													value={dailyLimit}
													onChange={(e) => {
														setDailyLimit(Number(e.target.value));
													}}
													className="w-full accent-blue-500 bg-zinc-800 rounded-lg cursor-pointer h-1.5"
												/>
												<span className="text-[10px] text-zinc-600 text-left">
													{language === "ru" ? "Максимум: $2,000 в день" : "Max: $2,000 per day"}
												</span>
											</div>

											<div className="h-px bg-zinc-900/60 my-1" />

											{/* Monthly Limit */}
											<div className="flex flex-col gap-2 text-left">
												<div className="flex justify-between text-xs font-semibold uppercase tracking-wider">
													<span className="text-zinc-500">
														{language === "ru" ? "Месячный лимит" : "Monthly Limit"}
													</span>
													<span className="text-blue-400 font-mono">${monthlyLimit}</span>
												</div>
												<input
													type="range"
													min="500"
													max="10000"
													step="100"
													value={monthlyLimit}
													onChange={(e) => {
														setMonthlyLimit(Number(e.target.value));
													}}
													className="w-full accent-blue-500 bg-zinc-800 rounded-lg cursor-pointer h-1.5"
												/>
												<span className="text-[10px] text-zinc-600 text-left">
													{language === "ru" ? "Максимум: $10,000 в месяц" : "Max: $10,000 per month"}
												</span>
											</div>

											<button
												type="button"
												onClick={() => {
													playHaptic("success");
													setActiveModal("none");
													showToast(language === "ru" ? "Лимиты обновлены" : "Limits updated");
												}}
												className="w-full bg-[#111] border border-zinc-800 text-white font-bold py-3.5 rounded-xl mt-3 active:scale-95 transition-all text-sm"
											>
												{language === "ru" ? "Сохранить" : "Save"}
											</button>
										</div>
									)}

									{/* 3. MORE ACTIONS */}
									{activeModal === "more" && (
										<div className="flex flex-col gap-3">
											<div className="flex justify-between items-center mb-1">
												<h3 className="text-lg font-bold text-white">
													{language === "ru" ? "Управление картой" : "Card Management"}
												</h3>
												<button
													type="button"
													onClick={() => setActiveModal("none")}
													className="text-zinc-500 hover:text-white"
												>
													<X size={20} />
												</button>
											</div>

											{/* Change Design style */}
											<button
												type="button"
												onClick={() => {
													playHaptic("light");
													setActiveModal("design");
												}}
												className="flex items-center gap-3.5 p-4 rounded-xl bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-900 text-left transition-colors"
											>
												<Palette size={18} className="text-zinc-400" />
												<div className="flex flex-col">
													<span className="text-sm font-semibold text-white">
														{language === "ru" ? "Изменить дизайн" : "Change card design"}
													</span>
													<span className="text-[10px] text-zinc-500 mt-0.5">
														{language === "ru" ? "Выберите стиль оформления" : "Choose color scheme"}
													</span>
												</div>
											</button>

											{/* Delete/Close card */}
											<button
												type="button"
												onClick={deleteCard}
												className="flex items-center gap-3.5 p-4 rounded-xl bg-red-950/10 hover:bg-red-950/20 border border-red-950/30 text-left transition-colors"
											>
												<Trash2 size={18} className="text-red-400" />
												<div className="flex flex-col">
													<span className="text-sm font-semibold text-red-400">
														{language === "ru" ? "Закрыть карту" : "Close card"}
													</span>
													<span className="text-[10px] text-red-500/80 mt-0.5">
														{language === "ru" ? "Безвозвратное закрытие карты" : "Irreversibly delete virtual card"}
													</span>
												</div>
											</button>
										</div>
									)}

									{/* 4. DESIGN PICKER IN-PLACE */}
									{activeModal === "design" && (
										<div className="flex flex-col gap-4">
											<div className="flex justify-between items-center">
												<h3 className="text-lg font-bold text-white">
													{language === "ru" ? "Выберите стиль" : "Select design style"}
												</h3>
												<button
													type="button"
													onClick={() => setActiveModal("more")}
													className="text-zinc-500 hover:text-white"
												>
													<X size={20} />
												</button>
											</div>

											<div className="grid grid-cols-2 gap-3">
												{([
													{ key: "neon", name: "Neon Space" },
													{ key: "carbon", name: "Carbon Fiber" },
													{ key: "gold", name: "Imperial Gold" },
													{ key: "royal", name: "Royal Sapphire" },
												] as const).map(d => (
													<button
														key={d.key}
														type="button"
														onClick={() => changeDesign(d.key)}
														className={`h-28 rounded-xl border flex flex-col justify-end p-3 text-left transition-all ${
															designClasses[d.key]
														}`}
													>
														<span className="text-xs font-bold text-white font-mono">
															{d.name}
														</span>
													</button>
												))}
											</div>
										</div>
									)}

									{/* 5. TRANSACTION DETAIL MODAL */}
									{activeModal === "txDetail" && selectedTx && (
										<div className="flex flex-col gap-4">
											<div className="flex justify-between items-center">
												<h3 className="text-lg font-bold text-white">
													{language === "ru" ? "Детали операции" : "Receipt details"}
												</h3>
												<button
													type="button"
													onClick={() => setActiveModal("none")}
													className="text-zinc-500 hover:text-white"
												>
													<X size={20} />
												</button>
											</div>

											{/* Merchant info */}
											<div className="flex flex-col items-center py-4">
												<div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg border mb-2 ${
													selectedTx.amount > 0 
														? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" 
														: "bg-zinc-900 border-zinc-800 text-white"
												}`}>
													{selectedTx.logoText}
												</div>
												<h4 className="text-lg font-bold text-white">
													{selectedTx.merchant}
												</h4>
												<span className="text-xs text-zinc-500 mt-0.5">
													{selectedTx.category}
												</span>
												<span className={`text-2xl font-black font-mono mt-3 ${
													selectedTx.amount > 0 ? "text-emerald-400" : "text-white"
												}`}>
													{selectedTx.amount > 0 ? "+" : ""}${Math.abs(selectedTx.amount).toFixed(2)}
												</span>
											</div>

											{/* Details grid */}
											<div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-900/80 flex flex-col gap-3.5 text-xs text-left">
												<div className="flex justify-between">
													<span className="text-zinc-500">
														{language === "ru" ? "Статус" : "Status"}
													</span>
													<span className="text-emerald-400 font-semibold flex items-center gap-1">
														<Check size={12} /> {language === "ru" ? "Успешно" : "Completed"}
													</span>
												</div>
												<div className="h-px bg-zinc-900" />
												<div className="flex justify-between">
													<span className="text-zinc-500">
														{language === "ru" ? "Дата и время" : "Date & time"}
													</span>
													<span className="text-white font-mono">{selectedTx.time}</span>
												</div>
												<div className="h-px bg-zinc-900" />
												<div className="flex justify-between">
													<span className="text-zinc-500">
														{language === "ru" ? "Карта списания" : "Source Card"}
													</span>
													<span className="text-white font-mono">
														{activeCard?.name} (..{activeCard?.number.slice(-4)})
													</span>
												</div>
												<div className="h-px bg-zinc-900" />
												<div className="flex justify-between">
													<span className="text-zinc-500">
														{language === "ru" ? "ID транзакции" : "Transaction ID"}
													</span>
													<span className="text-zinc-400 font-mono text-[10px]">
														{selectedTx.id}
													</span>
												</div>
											</div>
										</div>
									)}

									{/* 6. ALL TRANSACTIONS */}
									{activeModal === "allTxs" && (
										<div className="flex flex-col gap-4">
											<div className="flex justify-between items-center shrink-0">
												<h3 className="text-lg font-bold text-white">
													{language === "ru" ? "История операций" : "All operations"}
												</h3>
												<button
													type="button"
													onClick={() => setActiveModal("none")}
													className="text-zinc-500 hover:text-white"
												>
													<X size={20} />
												</button>
											</div>

											{/* Scrollable list inside the sheet */}
											<div className="flex flex-col gap-2 overflow-y-auto max-h-[50vh] pr-1 no-scrollbar">
												{filteredTxs.map(tx => {
													const isDeposit = tx.amount > 0;
													return (
														<button
															key={tx.id}
															type="button"
															onClick={() => {
																playHaptic("light");
																setSelectedTx(tx);
																setActiveModal("txDetail");
															}}
															className="flex justify-between items-center p-3 rounded-xl bg-zinc-900/20 border border-zinc-900 hover:border-zinc-800 transition-all text-left w-full"
														>
															<div className="flex items-center gap-3">
																<div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs border ${
																	isDeposit 
																		? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" 
																		: "bg-zinc-900 border-zinc-800 text-white"
																}`}>
																	{tx.logoText}
																</div>
																<div className="flex flex-col">
																	<span className="text-xs font-semibold text-white">
																		{tx.title}
																	</span>
																	<span className="text-[10px] text-zinc-500 font-mono mt-0.5">
																		{tx.time}
																	</span>
																</div>
															</div>
															<div className="text-right flex flex-col">
																<span className={`text-xs font-bold font-mono ${
																	isDeposit ? "text-emerald-400" : "text-white"
																}`}>
																	{isDeposit ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
																</span>
															</div>
														</button>
													);
												})}
											</div>
										</div>
									)}
								</motion.div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</motion.div>
	);
};
