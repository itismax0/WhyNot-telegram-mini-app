import { useState, useEffect, useMemo, useRef } from "react";
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
	_version: number;
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
	_version: number;
}

const DESIGN_CLASSES = {
	neon: "bg-gradient-to-br from-[#1c1c24] via-[#0d0f1a] to-[#2c2055] border-purple-500/20 shadow-purple-900/10",
	carbon: "bg-gradient-to-br from-[#1f1f23] via-[#0b0c10] to-[#2b2b36] border-zinc-700/30 shadow-black/40",
	gold: "bg-gradient-to-br from-[#241e12] via-[#0b0906] to-[#403115] border-amber-500/20 shadow-amber-900/5",
	royal: "bg-gradient-to-br from-[#121c2c] via-[#060a12] to-[#152e4f] border-blue-500/20 shadow-blue-900/10",
};

export const CardView = () => {
	const { t, showToast } = useWallet();
	const WebApp = window.Telegram?.WebApp;

	const getDefaultHolder = () => {
		const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
		if (user) {
			const name = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
			return name || user.username || "Cardholder";
		}
		return "Cardholder";
	};

	const CURRENT_VERSION = 1;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const migrateCard = (c: any): CardItem => ({
		id: c.id || `card-${crypto.randomUUID()}`,
		name: c.name || "My Card",
		number: c.number || "4242424242424242",
		cvv: c.cvv || "000",
		expiry: c.expiry || "12/30",
		balance: typeof c.balance === "number" ? c.balance : 0,
		holder: c.holder || getDefaultHolder(),
		isFrozen: !!c.isFrozen,
		design: (["neon", "carbon", "gold", "royal"].includes(c.design) ? c.design : "neon") as CardItem["design"],
		brand: (["visa", "mastercard"].includes(c.brand) ? c.brand : "visa") as CardItem["brand"],
		_version: CURRENT_VERSION,
	});

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const migrateTx = (tx: any, cardId?: string): CardTransaction => ({
		id: tx.id || `tx-${crypto.randomUUID()}`,
		cardId: tx.cardId || cardId || "",
		title: tx.title || "",
		amount: typeof tx.amount === "number" ? tx.amount : 0,
		currency: tx.currency || "USD",
		time: tx.time || "just_now",
		logoText: tx.logoText || "",
		category: tx.category || "",
		merchant: tx.merchant || "",
		status: (tx.status === "success" || tx.status === "pending") ? tx.status : "success",
		_version: CURRENT_VERSION,
	});

	// Local storage sync
	const [cards, setCards] = useState<CardItem[]>(() => {
		try {
			const saved = localStorage.getItem("whynot_cards");
			if (saved) {
				const parsed = JSON.parse(saved);
				if (Array.isArray(parsed)) return parsed.map(migrateCard);
			}
		} catch { /* ignore */ }
		return [
			{
				id: "card-1",
				name: "WhyNot Card",
				number: "4242424242424242",
				cvv: "732",
				expiry: "12/30",
				balance: 3.16,
				holder: getDefaultHolder(),
				isFrozen: false,
				design: "neon",
				brand: "visa",
				_version: 1,
			},
		];
	});

	const [transactions, setTransactions] = useState<CardTransaction[]>(() => {
		try {
			const saved = localStorage.getItem("whynot_card_txs");
			if (saved) {
				const parsed = JSON.parse(saved);
				if (Array.isArray(parsed)) return parsed.map(migrateTx);
			}
		} catch { /* ignore */ }
		return [
			{
				id: "tx-1",
				cardId: "card-1",
				title: "Netflix",
				amount: -9.99,
				currency: "USD",
				time: "15:42",
				logoText: "N",
				category: "entertainment",
				merchant: "Netflix Inc.",
				status: "success",
				_version: 1,
			},
			{
				id: "tx-2",
				cardId: "card-1",
				title: "Amazon",
				amount: -25.11,
				currency: "USD",
				time: "13:27",
				logoText: "a",
				category: "shopping",
				merchant: "Amazon.com LLC",
				status: "success",
				_version: 1,
			},
			{
				id: "tx-3",
				cardId: "card-1",
				title: t("deposit"),
				amount: 100.00,
				currency: "USDT",
				time: "09:12",
				logoText: "+",
				category: "transfer",
				merchant: "External TON Wallet",
				status: "success",
				_version: 1,
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

	// Confirmation state
	const [confirmDelete, setConfirmDelete] = useState(false);

	// Limits State
	const [dailyLimit, setDailyLimit] = useState(500);
	const [monthlyLimit, setMonthlyLimit] = useState(2500);

	const [isCreating, setIsCreating] = useState(false);
	const sheetRef = useRef<HTMLDivElement>(null);

	const isFirstRender = useRef(true);

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		try { localStorage.setItem("whynot_cards", JSON.stringify(cards)); } catch { /* ignore */ }
	}, [cards]);

	useEffect(() => {
		if (isFirstRender.current) return;
		try { localStorage.setItem("whynot_card_txs", JSON.stringify(transactions)); } catch { /* ignore */ }
	}, [transactions]);

	// Focus first focusable element when modal opens
	useEffect(() => {
		if (activeModal !== "none") {
			const timer = setTimeout(() => {
				if (sheetRef.current) {
					const firstFocusable = sheetRef.current.querySelector<HTMLElement>(
						'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
					);
					if (firstFocusable) {
						firstFocusable.focus();
					} else {
						sheetRef.current.focus();
					}
				}
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [activeModal]);

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

	const formatTxTime = (time: string) => {
		if (time.includes(",")) return time;
		if (time === "just_now") return t("just_now");
		return t("today_at", { time });
	};

	const copyToClipboard = (text: string, label: string) => {
		if (navigator.clipboard && window.isSecureContext) {
			navigator.clipboard.writeText(text).catch(() => {});
		}
		playHaptic("success");
		showToast(t("copied_label", { label }));
	};

	const toggleFreeze = () => {
		if (!activeCard) return;
		playHaptic("medium");
		const targetId = activeCard.id;
		const wasFrozen = activeCard.isFrozen;
		setCards(prev => prev.map(c => c.id === targetId ? { ...c, isFrozen: !c.isFrozen } : c));
		showToast(wasFrozen ? t("card_unfrozen") : t("card_frozen"));
	};

	const handleCreateCard = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isCreating) return;
		const trimmedName = newCardName.trim();

		if (!trimmedName) {
			playHaptic("error");
			showToast(t("enter_card_name"));
			return;
		}

		if (cards.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) {
			playHaptic("error");
			showToast(t("card_name_exists"));
			return;
		}

		setIsCreating(true);
		await new Promise(r => setTimeout(r, 0));

		const randomBytes = window.crypto.getRandomValues(new Uint32Array(4));
		const randomSuffix = (1000000000 + (randomBytes[0] % 9000000000)).toString();
		const cardNumber = `424268${randomSuffix}`;
		const cvv = String(100 + (randomBytes[1] % 900));
		const expMonth = String(1 + (randomBytes[2] % 12)).padStart(2, "0");
		const yearOffset = randomBytes[3] % 5;
		const expYear = String(new Date().getFullYear() + 3 + yearOffset).slice(-2);

		const newCard: CardItem = {
			id: `card-${crypto.randomUUID()}`,
			name: trimmedName,
			number: cardNumber,
			cvv,
			expiry: `${expMonth}/${expYear}`,
			balance: 0.00,
			holder: getDefaultHolder(),
			isFrozen: false,
			design: newCardDesign,
			brand: newCardBrand,
			_version: 1,
		};

		setCards(prev => [...prev, newCard]);
		setTransactions(prev => [...prev, {
			id: `tx-${crypto.randomUUID()}`,
			cardId: newCard.id,
			title: t("deposit"),
			amount: 100.00,
			currency: "USDT",
			time: "just_now",
			logoText: "+",
			category: "transfer",
			merchant: "External TON Wallet",
			status: "success",
			_version: 1,
		}]);
		setActiveCardIndex(cards.length);
		setNewCardName("");
		setActiveModal("none");
		setIsCreating(false);
		playHaptic("success");
		showToast(t("card_created"));
	};

	const deleteCard = () => {
		if (cards.length <= 1) {
			playHaptic("error");
			showToast(t("cannot_delete_last_card"));
			return;
		}
		playHaptic("heavy");
		const idx = activeCardIndex;
		const deletedCardId = cards[idx]?.id;
		setCards(prev => prev.filter((_, i) => i !== idx));
		if (deletedCardId) {
			setTransactions(prev => prev.filter(t => t.cardId !== deletedCardId));
		}
		setActiveCardIndex(prev => Math.min(prev, cards.length - 2));
		setActiveModal("none");
		showToast(t("card_closed"));
	};

	const changeDesign = (design: "neon" | "carbon" | "gold" | "royal") => {
		playHaptic("light");
		setCards(prev => prev.map(c => c.id === activeCard.id ? { ...c, design } : c));
		setActiveModal("none");
	};

	const activeCardDesignClass = useMemo(
		() => activeCard ? DESIGN_CLASSES[activeCard.design] : DESIGN_CLASSES.neon,
		[activeCard]
	);

	const filteredTxs = useMemo(
		() => transactions.filter(t => t.cardId === activeCard?.id),
		[transactions, activeCard?.id]
	);

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
					aria-label={t("add_card")}
					onClick={() => {
						playHaptic("light");
						setActiveModal("add");
					}}
					className="w-11 h-11 rounded-full bg-[#111] border border-[#222] flex items-center justify-center text-white active:scale-90 transition-transform"
				>
					<Plus size={20} />
				</button>
			</div>

			{/* Cards Slider / Carousel */}
			{cards.length > 0 && (
				<div className="flex flex-col items-center mb-6">
					{/* Active Card Body */}
					<AnimatePresence mode="sync">
					<motion.div
						key={activeCard?.id}
						initial={{ scale: 0.95, opacity: 0.8 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.9, opacity: 0 }}
						transition={{ type: "spring", stiffness: 300, damping: 25 }}
						drag="x"
						dragConstraints={{ left: 0, right: 0 }}
						dragElastic={0.4}
						onDragEnd={(_, info) => {
							const SWIPE_THRESHOLD = 60;
							if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
								playHaptic("light");
								if (info.offset.x > 0 && activeCardIndex > 0) {
									setActiveCardIndex(i => i - 1);
									setShowDetails(false);
								} else if (info.offset.x < 0 && activeCardIndex < cards.length - 1) {
									setActiveCardIndex(i => i + 1);
									setShowDetails(false);
								}
							}
						}}
						onClick={() => {
							playHaptic("light");
							setShowDetails(!showDetails);
						}}
						className={`relative w-full aspect-[1.586/1] rounded-[24px] border p-6 flex flex-col justify-between overflow-hidden cursor-pointer shadow-2xl ${activeCardDesignClass}`}
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
										{t("frozen_badge")}
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
						<div className="flex-1 py-2 z-0">
							<p className="text-white text-lg sm:text-xl font-mono tracking-widest text-left select-text">
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
								<span className="font-bold text-white text-lg font-mono">
									${Number(activeCard?.balance ?? 0).toFixed(2)}
								</span>
							</div>
						</div>
					</motion.div>
					</AnimatePresence>

					{/* Carousel Dots */}
					{cards.length > 1 && (
						<div
							className="flex gap-1.5 mt-3.5"
							role="tablist"
							aria-label={t("cards_tablist")}
							onKeyDown={(e) => {
								if (e.key === "ArrowLeft") {
									e.preventDefault();
									const prev = activeCardIndex === 0 ? cards.length - 1 : activeCardIndex - 1;
									playHaptic("light");
									setActiveCardIndex(prev);
									setShowDetails(false);
								} else if (e.key === "ArrowRight") {
									e.preventDefault();
									const next = activeCardIndex === cards.length - 1 ? 0 : activeCardIndex + 1;
									playHaptic("light");
									setActiveCardIndex(next);
									setShowDetails(false);
								}
							}}
						>
							{cards.map((_, i) => (
								<button
									key={i}
									type="button"
									role="tab"
									aria-selected={i === activeCardIndex}
									aria-current={i === activeCardIndex ? "true" : undefined}
									aria-label={t("card_n", { n: String(i + 1) })}
									onClick={() => {
										playHaptic("light");
										setActiveCardIndex(i);
										setShowDetails(false);
									}}
									className={`min-w-[44px] min-h-[44px] flex items-center justify-center transition-all rounded-full`}
								>
									<span className={`h-1.5 rounded-full transition-[width] ${
										i === activeCardIndex ? "w-4 bg-white" : "w-1.5 bg-zinc-700"
									}`} />
								</button>
							))}
						</div>
					)}
				</div>
			)}

			{/* Core Actions Grid */}
			<div className="grid grid-cols-4 gap-2.5 mb-7">
				<button
					type="button"
					aria-label={showDetails ? t("hide_details") : t("show_details")}
					aria-pressed={showDetails}
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
					aria-label={activeCard?.isFrozen ? t("unfreeze_card") : t("freeze_card")}
					aria-pressed={activeCard?.isFrozen ?? false}
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
						{activeCard?.isFrozen ? t("unfreeze_card") : t("freeze_card")}
					</span>
				</button>

				<button
					type="button"
					aria-label={t("limits")}
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
					aria-label={t("more_actions")}
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
			<AnimatePresence mode="sync">
				{showDetails && activeCard && (
					<motion.div
						layout
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						className="mb-6 p-4 rounded-2xl bg-[#0e0e11] border border-zinc-900 flex flex-col gap-3.5 text-sm"
					>
						<div className="flex justify-between items-center">
							<span className="text-zinc-500">{t("card_number")}</span>
							<div className="flex items-center gap-1.5">
								<span className="font-mono text-white tracking-wide">
									{formatCardNumber(activeCard.number, true)}
								</span>
								<button
									type="button"
									aria-label={t("copy_card_number")}
									onClick={() => copyToClipboard(activeCard.number, t("card_number"))}
									className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-white rounded active:scale-90"
								>
									<Copy size={18} />
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
									aria-label={t("copy_cvv")}
									onClick={() => copyToClipboard(activeCard.cvv, "CVV")}
									className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-white rounded active:scale-90"
								>
									<Copy size={18} />
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
							aria-label={t("see_all")}
							onClick={() => {
								playHaptic("light");
								setActiveModal("allTxs");
							}}
							className="min-h-[44px] flex items-center text-xs font-semibold text-blue-400 hover:text-blue-300"
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
								{t("no_card_ops")}
							</p>
						</div>
					) : (
						filteredTxs.slice(0, 3).map(tx => {
							const isDeposit = tx.amount > 0;
							const isNeutral = tx.amount === 0;
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
												: isNeutral
												? "bg-zinc-900/40 border-zinc-800/30 text-zinc-500"
												: "bg-zinc-900 border-zinc-800 text-white"
										}`}>
											{tx.logoText}
										</div>
										<div className="flex flex-col">
											<span className="text-sm font-medium text-white">
												{tx.title}
											</span>
											<span className="text-[11px] text-zinc-500 font-mono mt-0.5">
												{formatTxTime(tx.time)}
											</span>
										</div>
									</div>
									<div className="text-right flex flex-col">
										<span className={`text-sm font-bold font-mono ${
											isDeposit ? "text-emerald-400" : isNeutral ? "text-zinc-500" : "text-white"
										}`}>
											{isDeposit ? "+" : ""}{tx.currency === "USDT" ? "₮" : "$"}{Math.abs(tx.amount).toFixed(2)}
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
							role="dialog"
							aria-modal="true"
							aria-label={
								activeModal === "add" ? t("new_card_title") :
								activeModal === "limits" ? t("card_limits_title") :
								activeModal === "more" ? t("card_management") :
								activeModal === "design" ? t("select_design") :
								activeModal === "txDetail" ? t("receipt_details") :
								t("all_operations")
							}
							onKeyDown={(e) => {
								if (e.key === "Escape") setActiveModal("none");
							}}
							onClick={(e) => {
								if (e.target === e.currentTarget) {
									setActiveModal("none");
								}
							}}
							className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center"
						>
							{/* Bottom Sheets container */}
							<div className="relative w-full max-w-md h-full flex items-end justify-center px-4 pointer-events-none">
								<motion.div
									ref={sheetRef}
									tabIndex={-1}
									initial={{ y: "100%" }}
									animate={{ y: 0 }}
									exit={{ y: "100%" }}
									transition={{ type: "spring", damping: 30, stiffness: 300 }}
									className="w-full max-h-[85dvh] overflow-y-auto no-scrollbar rounded-t-[28px] border-t border-zinc-900 bg-[#0d0d10] p-6 pb-[env(safe-area-inset-bottom,1.5rem)] pointer-events-auto flex flex-col gap-5 shadow-2xl outline-none"
								>
									{/* Top Grab Handle */}
									<div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mb-2 shrink-0" />

									{/* 1. ADD CARD MODAL */}
									{activeModal === "add" && (
										<form onSubmit={handleCreateCard} className="flex flex-col gap-4">
											<div className="flex justify-between items-center">
												<h3 className="text-lg font-bold text-white">
													{t("new_card_title")}
												</h3>
												<button
													type="button"
													aria-label={t("modal_close")}
													onClick={() => setActiveModal("none")}
													className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-500 hover:text-white rounded"
												>
													<X size={20} />
												</button>
											</div>

											<div className="flex flex-col gap-1.5 text-left">
												<label htmlFor="card-name" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
													{t("card_name_label")}
												</label>
												<input
													id="card-name"
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
													{t("card_brand_label")}
												</label>
												<div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label={t("card_brand_label")}>
													{(["visa", "mastercard"] as const).map(brand => (
														<button
															key={brand}
															type="button"
															role="radio"
															aria-checked={newCardBrand === brand}
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
													{t("card_design_label")}
												</label>
												<div className="grid grid-cols-4 gap-2.5" role="radiogroup" aria-label={t("card_design_label")}>
													{(["neon", "carbon", "gold", "royal"] as const).map(style => {
														const active = newCardDesign === style;
														return (
															<button
																key={style}
																type="button"
																role="radio"
																aria-checked={active}
																onClick={() => {
																	playHaptic("light");
																	setNewCardDesign(style);
																}}
																className={`aspect-[1.5] rounded-lg border flex flex-col justify-end p-1.5 transition-all text-left overflow-hidden ${
																	DESIGN_CLASSES[style]
																} ${active ? "ring-2 ring-white ring-offset-2 ring-offset-transparent" : "opacity-70"}`}
															>
																<span className="text-[10px] font-bold text-white uppercase tracking-wider">
																	{style}
																</span>
															</button>
														);
													})}
												</div>
											</div>

											<button
												type="submit"
												disabled={isCreating}
												className={`w-full font-bold py-4 rounded-2xl mt-3 active:scale-[0.98] transition-all text-sm ${
													isCreating
														? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
														: "bg-[#3b82f6] text-white"
												}`}
											>
												{isCreating
													? t("creating")
													: t("add_card")}
											</button>
										</form>
									)}

									{/* 2. LIMITS SHEETS */}
									{activeModal === "limits" && (
										<div className="flex flex-col gap-4">
											<div className="flex justify-between items-center">
												<h3 className="text-lg font-bold text-white">
													{t("card_limits_title")}
												</h3>
												<button
													type="button"
													aria-label={t("modal_close")}
													onClick={() => setActiveModal("none")}
													className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-500 hover:text-white rounded"
												>
													<X size={20} />
												</button>
											</div>

											{/* Daily Limit */}
											<div className="flex flex-col gap-2 text-left">
												<div className="flex justify-between text-xs font-semibold uppercase tracking-wider">
													<label htmlFor="daily-limit" className="text-zinc-500">
														{t("daily_limit")}
													</label>
													<span className="text-blue-400 font-mono">${dailyLimit}</span>
												</div>
												<input
													id="daily-limit"
													type="range"
													min="50"
													max="2000"
													step="50"
													value={dailyLimit}
													onChange={(e) => {
														setDailyLimit(Number(e.target.value));
													}}
													aria-valuenow={dailyLimit}
													aria-valuemin={50}
													aria-valuemax={2000}
													className="w-full accent-blue-500 bg-zinc-800 rounded-lg cursor-pointer h-1.5"
												/>
												<span className="text-[10px] text-zinc-600 text-left">
													{t("daily_limit_max")}
												</span>
											</div>

											<div className="h-px bg-zinc-900/60 my-1" />

											{/* Monthly Limit */}
											<div className="flex flex-col gap-2 text-left">
												<div className="flex justify-between text-xs font-semibold uppercase tracking-wider">
													<label htmlFor="monthly-limit" className="text-zinc-500">
														{t("monthly_limit")}
													</label>
													<span className="text-blue-400 font-mono">${monthlyLimit}</span>
												</div>
												<input
													id="monthly-limit"
													type="range"
													min="500"
													max="10000"
													step="100"
													value={monthlyLimit}
													onChange={(e) => {
														setMonthlyLimit(Number(e.target.value));
													}}
													aria-valuenow={monthlyLimit}
													aria-valuemin={500}
													aria-valuemax={10000}
													className="w-full accent-blue-500 bg-zinc-800 rounded-lg cursor-pointer h-1.5"
												/>
												<span className="text-[10px] text-zinc-600 text-left">
													{t("monthly_limit_max")}
												</span>
											</div>

											<button
												type="button"
												onClick={() => {
													playHaptic("success");
													setActiveModal("none");
													showToast(t("limits_updated"));
												}}
												className="w-full bg-[#111] border border-zinc-800 text-white font-bold py-3.5 rounded-xl mt-3 active:scale-95 transition-all text-sm"
											>
												{t("save")}
											</button>
										</div>
									)}

									{/* 3. MORE ACTIONS */}
									{activeModal === "more" && (
										<div className="flex flex-col gap-3">
											<div className="flex justify-between items-center mb-1">
												<h3 className="text-lg font-bold text-white">
													{t("card_management")}
												</h3>
												<button
													type="button"
													aria-label={t("modal_close")}
													onClick={() => setActiveModal("none")}
													className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-500 hover:text-white rounded"
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
														{t("change_design")}
													</span>
													<span className="text-[10px] text-zinc-500 mt-0.5">
														{t("choose_design_desc")}
													</span>
												</div>
											</button>

											{/* Delete/Close card */}
											{confirmDelete ? (
												<div className="flex flex-col gap-2 p-4 rounded-xl bg-red-950/20 border border-red-500/30">
													<span className="text-sm font-semibold text-red-300">
														{t("confirm_closure")}
													</span>
													<span className="text-[10px] text-red-400/80">
														{t("action_irreversible")}
													</span>
													<div className="flex gap-2 mt-1">
														<button
															type="button"
															aria-label={t("confirm_delete_card")}
															onClick={() => { setConfirmDelete(false); deleteCard(); }}
															className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-xs font-bold active:scale-95 transition-transform"
														>
															{t("yes_close")}
														</button>
														<button
															type="button"
															aria-label={t("cancel")}
															onClick={() => setConfirmDelete(false)}
															className="flex-1 py-2.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-bold active:scale-95 transition-transform"
														>
															{t("cancel")}
														</button>
													</div>
												</div>
											) : (
											<button
												type="button"
												onClick={() => setConfirmDelete(true)}
												className="flex items-center gap-3.5 p-4 rounded-xl bg-red-950/10 hover:bg-red-950/20 border border-red-950/30 text-left transition-colors"
											>
												<Trash2 size={18} className="text-red-400" />
												<div className="flex flex-col">
													<span className="text-sm font-semibold text-red-400">
														{t("close_card")}
													</span>
													<span className="text-[10px] text-red-500/80 mt-0.5">
														{t("close_card_desc")}
													</span>
												</div>
											</button>
											)}
										</div>
									)}

									{/* 4. DESIGN PICKER IN-PLACE */}
									{activeModal === "design" && (
										<div className="flex flex-col gap-4">
											<div className="flex justify-between items-center">
												<h3 className="text-lg font-bold text-white">
													{t("select_design")}
												</h3>
												<button
													type="button"
													aria-label={t("back")}
													onClick={() => setActiveModal("more")}
													className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-500 hover:text-white rounded"
												>
													<X size={20} />
												</button>
											</div>

											<div className="grid grid-cols-2 gap-3">
												{(["neon", "carbon", "gold", "royal"] as const).map(key => (
													<button
														key={key}
														type="button"
														aria-label={t(`design_${key}`)}
														onClick={() => changeDesign(key)}
														className={`h-28 rounded-xl border flex flex-col justify-end p-3 text-left transition-all ${
															DESIGN_CLASSES[key]
														}`}
													>
														<span className="text-xs font-bold text-white font-mono">
															{t(`design_${key}`)}
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
													{t("receipt_details")}
												</h3>
												<button
													type="button"
													aria-label={t("modal_close")}
													onClick={() => setActiveModal("none")}
													className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-500 hover:text-white rounded"
												>
													<X size={20} />
												</button>
											</div>

											{/* Merchant info */}
											<div className="flex flex-col items-center py-4">
												<div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg border mb-2 ${
													selectedTx.amount > 0 
														? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" 
														: selectedTx.amount === 0
														? "bg-zinc-900/40 border-zinc-800/30 text-zinc-500"
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
													selectedTx.amount > 0 ? "text-emerald-400" : selectedTx.amount === 0 ? "text-zinc-500" : "text-white"
												}`}>
													{selectedTx.amount > 0 ? "+" : ""}{selectedTx.currency === "USDT" ? "₮" : "$"}{Math.abs(selectedTx.amount).toFixed(2)}
												</span>
												<span className="text-[11px] text-zinc-500 uppercase tracking-widest mt-0.5">
													{selectedTx.currency}
												</span>
											</div>

											{/* Details grid */}
											<div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-900/80 flex flex-col gap-3.5 text-xs text-left">
												<div className="flex justify-between">
													<span className="text-zinc-500">
														{t("status")}
													</span>
													<span className="text-emerald-400 font-semibold flex items-center gap-1">
														<Check size={12} /> {t("completed")}
													</span>
												</div>
												<div className="h-px bg-zinc-900" />
												<div className="flex justify-between">
													<span className="text-zinc-500">
														{t("date_time")}
													</span>
													<span className="text-white font-mono">{formatTxTime(selectedTx.time)}</span>
												</div>
												<div className="h-px bg-zinc-900" />
												<div className="flex justify-between">
													<span className="text-zinc-500">
														{t("source_card")}
													</span>
													<span className="text-white font-mono">
														{activeCard?.name} (..{activeCard?.number.slice(-4)})
													</span>
												</div>
												<div className="h-px bg-zinc-900" />
												<div className="flex justify-between">
													<span className="text-zinc-500">
														{t("tx_id")}
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
													{t("all_operations")}
												</h3>
												<button
													type="button"
													aria-label={t("modal_close")}
													onClick={() => setActiveModal("none")}
													className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-500 hover:text-white rounded"
												>
													<X size={20} />
												</button>
											</div>

											{/* Scrollable list inside the sheet */}
											<div className="flex flex-col gap-2 overflow-y-auto max-h-[50vh] pr-1 no-scrollbar">
												{filteredTxs.map(tx => {
													const isDeposit = tx.amount > 0;
													const isNeutral = tx.amount === 0;
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
																		: isNeutral
																		? "bg-zinc-900/40 border-zinc-800/30 text-zinc-500"
																		: "bg-zinc-900 border-zinc-800 text-white"
																}`}>
																	{tx.logoText}
																</div>
																<div className="flex flex-col">
																	<span className="text-xs font-semibold text-white">
																		{tx.title}
																	</span>
																	<span className="text-[10px] text-zinc-500 font-mono mt-0.5">
																		{formatTxTime(tx.time)}
																	</span>
																</div>
															</div>
															<div className="text-right flex flex-col">
																<span className={`text-xs font-bold font-mono ${
																	isDeposit ? "text-emerald-400" : isNeutral ? "text-zinc-500" : "text-white"
																}`}>
																	{isDeposit ? "+" : ""}{tx.currency === "USDT" ? "₮" : "$"}{Math.abs(tx.amount).toFixed(2)}
																</span>
																<span className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">
																	{tx.currency}
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
