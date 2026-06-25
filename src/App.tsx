import { useCallback, useEffect, useRef, useState } from "react";
import type {
	CSSProperties,
	PointerEvent as ReactPointerEvent,
	SVGProps,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WalletProvider, useWallet, getWalletData } from "./store/WalletContext";
import {
	WelcomeView,
	PinManager,
	RestorePromptView,
	RestoreInputView,
	BiometricSetupView,
} from "./views/AuthViews";
import {
	MainView,
	ReceiveView,
	SendView,
	MoreView,
	HistoryView,
	VPNView,
	CloudView,
	TonBrowserView,
	TonStakingView,
	TelegramGiftsView,
} from "./views/MainViews";
import { TokenDetailView } from "./views/TokenDetailView";
import { SettingsView } from "./views/SettingsView";
import { SwapView } from "./views/SwapView";
import { AIChatView } from "./views/AIChatView";
import { CardView } from "./views/CardView";
import { ASSETS } from "./services/blockchain";

interface NavIconProps extends SVGProps<SVGSVGElement> {
	active?: boolean;
}

const WalletNavIcon = ({ active = false, ...props }: NavIconProps) => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
		<rect x="3.5" y="6.5" width="17" height="11" rx="4.2" strokeWidth={active ? 1.95 : 1.75} />
		<path
			d="M16.2 10.1H20.5V13.9H16.2C15.1 13.9 14.2 13.05 14.2 12C14.2 10.95 15.1 10.1 16.2 10.1Z"
			strokeWidth={active ? 1.95 : 1.75}
		/>
		<circle cx="16.9" cy="12" r="0.8" fill="currentColor" stroke="none" />
		<path d="M7 9.25H12" strokeWidth={active ? 1.9 : 1.7} strokeLinecap="round" />
	</svg>
);

const ExchangeNavIcon = ({ active = false, ...props }: NavIconProps) => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
		<path
			d="M6 8.25H17.75"
			strokeWidth={active ? 1.95 : 1.75}
			strokeLinecap="round"
		/>
		<path
			d="M14.7 5.5L17.9 8.25L14.7 11"
			strokeWidth={active ? 1.95 : 1.75}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M18 15.75H6.25"
			strokeWidth={active ? 1.95 : 1.75}
			strokeLinecap="round"
		/>
		<path
			d="M9.3 13L6.1 15.75L9.3 18.5"
			strokeWidth={active ? 1.95 : 1.75}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const SettingsNavIcon = ({ active = false, ...props }: NavIconProps) => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
		<circle cx="12" cy="12" r="3.15" strokeWidth={active ? 1.95 : 1.75} />
		<path
			d="M12 4.1V6.05M12 17.95V19.9M19.9 12H17.95M6.05 12H4.1M17.6 6.4L16.15 7.85M7.85 16.15L6.4 17.6M17.6 17.6L16.15 16.15M7.85 7.85L6.4 6.4"
			strokeWidth={active ? 1.9 : 1.7}
			strokeLinecap="round"
		/>
	</svg>
);

const MoreNavIcon = ({ active = false, ...props }: NavIconProps) => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
		<rect x="5" y="5" width="5.1" height="5.1" rx="1.6" strokeWidth={active ? 1.9 : 1.7} />
		<rect x="13.9" y="5" width="5.1" height="5.1" rx="1.6" strokeWidth={active ? 1.9 : 1.7} />
		<rect x="5" y="13.9" width="5.1" height="5.1" rx="1.6" strokeWidth={active ? 1.9 : 1.7} />
		<rect x="13.9" y="13.9" width="5.1" height="5.1" rx="1.6" strokeWidth={active ? 1.9 : 1.7} />
	</svg>
);

const CardNavIcon = ({ active = false, ...props }: NavIconProps) => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
		<rect
			x="3"
			y="5"
			width="18"
			height="14"
			rx="3.5"
			strokeWidth={active ? 1.95 : 1.75}
		/>
		<path
			d="M3 9.5H21"
			strokeWidth={active ? 1.95 : 1.75}
		/>
		<rect
			x="6"
			y="13"
			width="3"
			height="2"
			rx="0.5"
			fill="currentColor"
			stroke="none"
		/>
	</svg>
);

const COINGECKO_KEY = import.meta.env.VITE_COINGECKO_KEY ?? "";

const WebApp = window.Telegram?.WebApp;
const CAPSULE_PADDING_PX = 4;
const DRAG_THRESHOLD_PX = 5;

interface DragState {
	pointerId: number;
	startX: number;
	fromIndex: number;
	isDragStarted: boolean;
}

const BottomNav = () => {
	const { view, setView, language } = useWallet();
	const capsuleRef = useRef<HTMLDivElement>(null);
	const dragRef = useRef<DragState | undefined>(undefined);
	const previewIndexRef = useRef<number | undefined>(undefined);
	const detachAbortRef = useRef<VoidFunction | undefined>(undefined);
	const suppressClickRef = useRef(false);
	const [previewIndex, setPreviewIndex] = useState<number | undefined>(undefined);
	const [isDragging, setIsDragging] = useState(false);
	const items = [
		{
			id: "main",
			icon: WalletNavIcon,
			label: language === "ru" ? "Кошелек" : "Wallet",
		},
		{
			id: "swap",
			icon: ExchangeNavIcon,
			label: language === "ru" ? "Обмен" : "Exchange",
		},
		{
			id: "card",
			icon: CardNavIcon,
			label: language === "ru" ? "Карта" : "Card",
		},
		{
			id: "settings",
			icon: SettingsNavIcon,
			label: language === "ru" ? "Настройки" : "Settings",
		},
		{
			id: "more",
			icon: MoreNavIcon,
			label: language === "ru" ? "Еще" : "More",
		},
	] as const;
	const activeIndex = Math.max(
		0,
		items.findIndex(({ id }) => id === view),
	);
	const renderedIndex = previewIndex ?? activeIndex;

	useEffect(() => {
		return () => {
			detachAbortRef.current?.();
		};
	}, []);

	const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
		if (event.pointerType === "mouse" && event.button !== 0) return;
		if (!capsuleRef.current) return;
		if (dragRef.current) return;

		const rect = capsuleRef.current.getBoundingClientRect();
		const tabWidth = (rect.width - CAPSULE_PADDING_PX * 2) / items.length;
		const pillLeft = rect.left + CAPSULE_PADDING_PX + activeIndex * tabWidth;
		const pillRight = pillLeft + tabWidth;
		if (event.clientX < pillLeft || event.clientX > pillRight) return;

		dragRef.current = {
			pointerId: event.pointerId,
			startX: event.clientX,
			fromIndex: activeIndex,
			isDragStarted: false,
		};

		const abort = (abortEvent: PointerEvent) => {
			if (abortEvent.pointerId !== event.pointerId) return;

			detachAbortRef.current?.();

			if (
				dragRef.current?.pointerId === event.pointerId &&
				!dragRef.current.isDragStarted
			) {
				dragRef.current = undefined;
			}
		};

		window.addEventListener("pointerup", abort);
		window.addEventListener("pointercancel", abort);
		detachAbortRef.current = () => {
			window.removeEventListener("pointerup", abort);
			window.removeEventListener("pointercancel", abort);
			detachAbortRef.current = undefined;
		};
	};

	const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
		const drag = dragRef.current;
		const capsule = capsuleRef.current;
		if (!drag || drag.pointerId !== event.pointerId || !capsule) return;

		const delta = event.clientX - drag.startX;
		if (!drag.isDragStarted) {
			if (Math.abs(delta) < DRAG_THRESHOLD_PX) return;

			drag.isDragStarted = true;
			detachAbortRef.current?.();
			WebApp?.HapticFeedback?.selectionChanged?.();
			suppressClickRef.current = true;
			setIsDragging(true);
			try {
				capsule.setPointerCapture(event.pointerId);
			} catch {
				// ignore
			}
		}

		const rect = capsule.getBoundingClientRect();
		const tabWidth = (rect.width - CAPSULE_PADDING_PX * 2) / items.length;
		const minOffset = -drag.fromIndex * tabWidth;
		const maxOffset = (items.length - 1 - drag.fromIndex) * tabWidth;
		const constrained = Math.max(minOffset, Math.min(maxOffset, delta));
		capsule.style.setProperty("--drag-offset-px", `${constrained}px`);

		const center = drag.fromIndex + constrained / tabWidth;
		const nextIndex = Math.max(0, Math.min(items.length - 1, Math.round(center)));
		if (nextIndex !== previewIndexRef.current) {
			previewIndexRef.current = nextIndex;
			setPreviewIndex(nextIndex);
			if (nextIndex !== activeIndex) {
				WebApp?.HapticFeedback?.selectionChanged?.();
			}
		}
	};

	const finishDrag = (event: ReactPointerEvent<HTMLDivElement>, commit: boolean) => {
		const drag = dragRef.current;
		if (!drag || drag.pointerId !== event.pointerId) return;

		const target = previewIndexRef.current ?? drag.fromIndex;

		if (drag.isDragStarted) {
			try {
				capsuleRef.current?.releasePointerCapture(event.pointerId);
			} catch {
				// ignore
			}
		}
		if (commit && drag.isDragStarted && target !== drag.fromIndex) {
			setView(items[target].id);
		}

		dragRef.current = undefined;
		previewIndexRef.current = undefined;
		detachAbortRef.current?.();
		capsuleRef.current?.style.removeProperty("--drag-offset-px");
		setPreviewIndex(undefined);
		setIsDragging(false);
		window.setTimeout(() => {
			suppressClickRef.current = false;
		}, 0);
	};

	return (
		<motion.nav
			initial={{ y: 44, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			exit={{ y: 44, opacity: 0 }}
			transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
			className="fixed left-0 right-0 z-40 mx-auto max-w-[480px] px-3"
			style={{
				bottom: "max(10px, env(safe-area-inset-bottom, 10px))",
			}}
		>
			<div
				ref={capsuleRef}
				className={`minimal-nav ${isDragging ? "is-dragging" : ""}`}
				style={
					{
						"--tab-count": items.length,
						"--active-index": activeIndex,
					} as CSSProperties
				}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={(event) => finishDrag(event, true)}
				onPointerCancel={(event) => finishDrag(event, false)}
			>
				<div className={`minimal-nav-indicator ${isDragging ? "dragging" : ""}`} />
				<div className="minimal-nav-grid">
					{items.map(({ id, icon: Icon, label }, index) => {
						const highlighted = renderedIndex === index;
						return (
							<button
								key={id}
								type="button"
								onClick={() => {
									if (!suppressClickRef.current) setView(id);
								}}
								className={`minimal-nav-button ${highlighted ? "is-active" : ""}`}
								aria-label={label}
							>
								<motion.span
									className="minimal-nav-icon-wrap"
									animate={{
										y: highlighted ? -1.5 : 0,
										scale: highlighted ? 1.06 : 1,
										rotate: highlighted ? [0, -3, 2, 0] : 0,
									}}
									transition={{
										duration: highlighted ? 0.34 : 0.2,
										 ease: [0.22, 1, 0.36, 1],
									}}
								>
									<Icon
										className="minimal-nav-icon"
										active={highlighted}
										width={24}
										height={24}
									/>
								</motion.span>
								<motion.span
									className="minimal-nav-label"
									animate={{
										opacity: highlighted ? 1 : 0.74,
										y: highlighted ? 0 : 0.5,
									}}
									transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
								>
									{label}
								</motion.span>
							</button>
						);
					})}
				</div>
			</div>
		</motion.nav>
	);
};

const AppContent = () => {
	const {
		view,
		setView,
		setRates,
		setChanges,
		toast,
		baseCurrency,
		wallets,
		lockWallet,
	} = useWallet();
	const showBottomNav = ["main", "swap", "card", "settings", "more"].includes(view);
	const walletSyncCheckedRef = useRef(false);
	const lastActivityRef = useRef(0);
	const hiddenAtRef = useRef<number | null>(null);
	const checkWalletSync = useCallback(async () => {
		setView("loading");
		const encrypted = await getWalletData();
		if (encrypted) {
			setView("pin-enter");
		} else {
			setView("welcome");
		}
	}, [setView]);

	useEffect(() => {
		if (WebApp) {
			WebApp.ready();
			WebApp.expand();
			WebApp.setHeaderColor("#000000");
			WebApp.setBackgroundColor("#000000");
		}

		const fetchRates = async () => {
			try {
				const ids = ASSETS.map((a) => a.cmc_id).join(",");
				const res = await fetch(
					`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd,eur,rub&include_24hr_change=true`,
					COINGECKO_KEY ? { headers: { "x-cg-pro-api-key": COINGECKO_KEY } } : undefined
				);
				const data = await res.json();
				const newRates: Record<string, number> = {};
				const newChanges: Record<string, number> = {};
				ASSETS.forEach((a) => {
					if (data[a.cmc_id]) {
						newRates[a.id] = data[a.cmc_id][baseCurrency] ?? data[a.cmc_id].usd;
						newChanges[a.id] = data[a.cmc_id].usd_24h_change ?? 0;
					} else if (a.id === "whynot") {
						newRates[a.id] = baseCurrency === "usd" ? 0.07 : baseCurrency === "eur" ? 0.06 : 6.5;
						newChanges[a.id] = 5.4;
					}
				});
				setRates(newRates);
				setChanges(newChanges);
			} catch (e) {
				console.error("Error loading rates");
			}
		};

		fetchRates();
		if (!walletSyncCheckedRef.current) {
			walletSyncCheckedRef.current = true;
			checkWalletSync();
		}

		const interval = setInterval(fetchRates, 60000);
		return () => clearInterval(interval);
	}, [baseCurrency, checkWalletSync]);

	useEffect(() => {
		if (!wallets) return;
		lastActivityRef.current = Date.now();

		const AUTO_LOCK_MS = 2 * 60_000;
		const BACKGROUND_LOCK_MS = 30_000;
		const markActivity = () => {
			lastActivityRef.current = Date.now();
		};
		const checkIdle = () => {
			if (Date.now() - lastActivityRef.current >= AUTO_LOCK_MS) {
				lockWallet();
			}
		};
		const handleVisibility = () => {
			if (document.hidden) {
				hiddenAtRef.current = Date.now();
				return;
			}
			if (
				hiddenAtRef.current &&
				Date.now() - hiddenAtRef.current >= BACKGROUND_LOCK_MS
			) {
				lockWallet();
			}
			hiddenAtRef.current = null;
			markActivity();
		};

		const events: Array<keyof WindowEventMap> = [
			"pointerdown",
			"keydown",
			"touchstart",
		];
		events.forEach((event) =>
			window.addEventListener(event, markActivity, { passive: true })
		);
		document.addEventListener("visibilitychange", handleVisibility);
		const timer = window.setInterval(checkIdle, 10_000);

		return () => {
			events.forEach((event) =>
				window.removeEventListener(event, markActivity)
			);
			document.removeEventListener("visibilitychange", handleVisibility);
			window.clearInterval(timer);
		};
	}, [lockWallet, wallets]);

	return (
		<div className="bg-black min-h-screen text-white flex justify-center font-sans selection:bg-white selection:text-black">
			<div className="w-full max-w-md bg-[#050505] relative shadow-2xl overflow-x-hidden min-h-screen flex flex-col">
				<AnimatePresence>
					{toast && (
						<motion.div
							initial={{ y: -60, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							exit={{ y: -60, opacity: 0 }}
							transition={{
								type: "spring",
								damping: 20,
								stiffness: 300,
							}}
							className="absolute top-4 left-4 right-4 bg-[#111]/90 backdrop-blur-md border border-[#222] py-4 px-5 rounded-2xl z-50 flex items-center justify-center shadow-2xl"
						>
							<span className="font-mono text-xs text-center text-white tracking-wide uppercase">
								{toast}
							</span>
						</motion.div>
					)}
				</AnimatePresence>

				<AnimatePresence mode="wait">
					{view === "loading" && (
						<motion.div
							key="loading"
							className="flex h-screen items-center justify-center"
						>
							<div className="loader" />
						</motion.div>
					)}
					{view === "welcome" && <WelcomeView key="welcome" />}
					{view.startsWith("pin-") && <PinManager key="pin" />}
					{view === "restore-prompt" && (
						<RestorePromptView key="restore-prompt" />
					)}
					{view === "restore-input" && (
						<RestoreInputView key="restore-input" />
					)}
					{view === "biometric-setup" && (
						<BiometricSetupView key="biometric-setup" />
					)}
					{view === "main" && <MainView key="main" />}
					{view === "receive" && <ReceiveView key="receive" />}
					{view === "send" && <SendView key="send" />}
					{view === "swap" && <SwapView key="swap" />}
					{view === "history" && <HistoryView key="history" />}
					{view === "settings" && <SettingsView key="settings" />}
					{view === "card" && <CardView key="card" />}
					{view === "more" && <MoreView key="more" />}
					{view === "vpn" && <VPNView key="vpn" />}
					{view === "cloud" && <CloudView key="cloud" />}
					{view === "browser" && <TonBrowserView key="browser" />}
					{view === "staking" && <TonStakingView key="staking" />}
					{view === "gifts" && <TelegramGiftsView key="gifts" />}
					{view === "token_detail" && <TokenDetailView key="token_detail" />}
					{view === "ai" && <AIChatView key="ai" />}
				</AnimatePresence>
				<AnimatePresence>
					{showBottomNav && <BottomNav key="bottom-nav" />}
				</AnimatePresence>
			</div>
		</div>
	);
};

export default function App() {
	return (
		<WalletProvider>
			<AppContent />
		</WalletProvider>
	);
}
