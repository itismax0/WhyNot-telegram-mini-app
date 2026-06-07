import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowLeftRight,
	Grid2X2,
	Settings,
	Wallet,
} from "lucide-react";
import { WalletProvider, useWallet, getCloudItem } from "./store/WalletContext";
import {
	WelcomeView,
	PinManager,
	RestorePromptView,
	RestoreInputView,
} from "./views/AuthViews";
import {
	MainView,
	ReceiveView,
	SendView,
	HistoryView,
	MoreView,
} from "./views/MainViews";
import { TokenDetailView } from "./views/TokenDetailView";
import { SettingsView } from "./views/SettingsView";
import { SwapView } from "./views/SwapView";
import { AIChatView } from "./views/AIChatView";
import { ASSETS } from "./services/blockchain";

const WebApp = (window as any).Telegram?.WebApp;

const BottomNav = () => {
	const { view, setView, language } = useWallet();
	const items = [
		{
			id: "main",
			icon: Wallet,
			label: language === "ru" ? "Кошелек" : "Wallet",
		},
		{
			id: "swap",
			icon: ArrowLeftRight,
			label: language === "ru" ? "Обмен" : "Exchange",
		},
		{
			id: "settings",
			icon: Settings,
			label: language === "ru" ? "Настройки" : "Settings",
		},
		{
			id: "more",
			icon: Grid2X2,
			label: language === "ru" ? "Еще" : "More",
		},
	] as const;

	return (
		<motion.nav
			initial={{ y: 120, opacity: 0, scale: 0.92 }}
			animate={{ y: 0, opacity: 1, scale: 1 }}
			exit={{ y: 120, opacity: 0, scale: 0.92 }}
			transition={{ type: "spring", damping: 26, stiffness: 240, mass: 0.9 }}
			className="absolute left-3 right-3 z-40"
			style={{
				bottom: "max(14px, env(safe-area-inset-bottom, 14px))",
			}}
		>
			<div
				className="relative overflow-hidden rounded-[28px] border border-white/[0.12] px-1.5 py-1.5"
				style={{
					background:
						"linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.035) 35%, rgba(255,255,255,0.025) 100%)",
					backdropFilter: "blur(40px) saturate(180%)",
					WebkitBackdropFilter: "blur(40px) saturate(180%)",
					boxShadow:
						"0 12px 40px -8px rgba(0,0,0,0.65), 0 2px 6px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.25)",
				}}
			>
				<div
					aria-hidden
					className="pointer-events-none absolute inset-x-6 top-0 h-px"
					style={{
						background:
							"linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)",
					}}
				/>
				<div
					aria-hidden
					className="pointer-events-none absolute -top-12 left-1/2 h-24 w-3/4 -translate-x-1/2 rounded-full opacity-50"
					style={{
						background:
							"radial-gradient(ellipse at center, rgba(120,170,255,0.18) 0%, transparent 70%)",
						filter: "blur(12px)",
					}}
				/>
				<div className="relative grid grid-cols-4 gap-1">
					{items.map(({ id, icon: Icon, label }) => {
						const active = view === id;
						return (
							<button
								key={id}
								type="button"
								onClick={() => setView(id)}
								className="relative h-[68px] min-w-0 rounded-[22px] flex flex-col items-center justify-center gap-1 active:scale-[0.94] transition-transform"
								aria-label={label}
							>
								{active && (
									<motion.span
										layoutId="liquidglass-pill"
										transition={{
											type: "spring",
											damping: 28,
											stiffness: 320,
										}}
										className="absolute inset-0 rounded-[22px]"
										style={{
											background:
												"linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%)",
											boxShadow:
												"inset 0 1px 0 rgba(255,255,255,0.22), 0 4px 14px rgba(47,125,255,0.25)",
											border: "1px solid rgba(255,255,255,0.16)",
										}}
									/>
								)}
								<span className="relative z-10 flex h-7 w-7 items-center justify-center">
									<Icon
										size={22}
										strokeWidth={active ? 2.6 : 2}
										className={
											active
												? "text-[#5b9bff] drop-shadow-[0_0_8px_rgba(91,155,255,0.55)]"
												: "text-white/85"
										}
									/>
								</span>
								<span
									className={`relative z-10 w-full truncate px-1 text-center text-[11.5px] font-semibold leading-none tracking-tight transition-colors ${
										active ? "text-white" : "text-white/65"
									}`}
								>
									{label}
								</span>
							</button>
						);
					})}
				</div>
			</div>
		</motion.nav>
	);
};

const AppContent = () => {
	const { view, setView, setRates, setChanges, toast } = useWallet();
	const showBottomNav = ["main", "swap", "settings", "more"].includes(view);

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
					`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
				);
				const data = await res.json();
				const newRates: Record<string, number> = {};
				const newChanges: Record<string, number> = {};
				ASSETS.forEach((a) => {
					if (data[a.cmc_id]) {
						newRates[a.id] = data[a.cmc_id].usd;
						newChanges[a.id] = data[a.cmc_id].usd_24h_change ?? 0;
					}
				});
				setRates(newRates);
				setChanges(newChanges);
			} catch (e) {
				console.error("Error loading rates");
			}
		};

		fetchRates();
		checkWalletSync();

		const interval = setInterval(fetchRates, 60000);
		return () => clearInterval(interval);
	}, []);

	const checkWalletSync = async () => {
		setView("loading");
		const encrypted = await getCloudItem("wallet_data");
		if (encrypted) {
			setView("pin-enter");
		} else {
			setView("welcome");
		}
	};

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
					{view === "main" && <MainView key="main" />}
					{view === "receive" && <ReceiveView key="receive" />}
					{view === "send" && <SendView key="send" />}
					{view === "swap" && <SwapView key="swap" />}
					{view === "history" && <HistoryView key="history" />}
					{view === "settings" && <SettingsView key="settings" />}
					{view === "more" && <MoreView key="more" />}
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
