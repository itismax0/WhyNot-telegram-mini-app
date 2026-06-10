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
	BiometricSetupView,
} from "./views/AuthViews";
import {
	MainView,
	ReceiveView,
	SendView,
	HistoryView,
	MoreView,
	VPNView,
	CloudView,
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
			className="fixed left-3 right-3 z-40"
			style={{
				bottom: "max(14px, env(safe-area-inset-bottom, 14px))",
			}}
		>
			<div className="relative rounded-[40px] border border-white/[0.10] bg-[#19191b] px-2 py-2 shadow-2xl shadow-black/60">
				<div className="relative grid grid-cols-4 gap-1.5">
					{items.map(({ id, icon: Icon, label }) => {
						const active = view === id;
						return (
							<button
								key={id}
								type="button"
								onClick={() => setView(id)}
								className="relative h-[60px] min-w-0 rounded-[24px] flex flex-col items-center justify-center gap-1 active:scale-[0.96] transition-transform"
								aria-label={label}
							>
								{active && (
									<motion.span
										layoutId="active-pill"
										transition={{
											type: "spring",
											damping: 30,
											stiffness: 380,
											mass: 0.7,
										}}
										className="absolute inset-0 rounded-[24px]"
										style={{
											background:
												"linear-gradient(180deg, rgba(40,65,120,0.85) 0%, rgba(18,28,58,0.9) 100%)",
											boxShadow:
												"inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.35), 0 6px 20px -4px rgba(80,140,255,0.45), 0 0 0 1px rgba(120,170,255,0.35)",
										}}
									>
										<span
											aria-hidden
											className="pointer-events-none absolute inset-0 rounded-[24px] opacity-70"
											style={{
												background:
													"radial-gradient(ellipse at 50% 110%, rgba(91,155,255,0.4) 0%, transparent 60%)",
												filter: "blur(6px)",
											}}
										/>
									</motion.span>
								)}
								<span className="relative z-10 flex h-6 w-6 items-center justify-center">
									<Icon
										size={22}
										strokeWidth={active ? 2.4 : 1.9}
										className={
											active
												? "text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.35)]"
												: "text-white/75"
										}
									/>
								</span>
								<span
									className={`relative z-10 w-full truncate px-1 text-center text-[11px] tracking-tight transition-colors ${
										active
											? "text-white font-semibold"
											: "text-white/55 font-medium"
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
					} else if (a.id === "whynot") {
						newRates[a.id] = 0.07;
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
					{view === "biometric-setup" && (
						<BiometricSetupView key="biometric-setup" />
					)}
					{view === "main" && <MainView key="main" />}
					{view === "receive" && <ReceiveView key="receive" />}
					{view === "send" && <SendView key="send" />}
					{view === "swap" && <SwapView key="swap" />}
					{view === "history" && <HistoryView key="history" />}
					{view === "settings" && <SettingsView key="settings" />}
					{view === "more" && <MoreView key="more" />}
					{view === "vpn" && <VPNView key="vpn" />}
					{view === "cloud" && <CloudView key="cloud" />}
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
