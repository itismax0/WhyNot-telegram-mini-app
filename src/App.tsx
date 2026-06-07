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
		<nav className="absolute left-4 right-4 bottom-4 z-40 rounded-[2rem] border border-white/10 bg-[#19191b] px-2 py-2 shadow-2xl shadow-black/60">
			<div className="grid grid-cols-4 gap-1">
				{items.map(({ id, icon: Icon, label }) => {
					const active = view === id;
					return (
						<button
							key={id}
							type="button"
							onClick={() => setView(id)}
							className={`h-[76px] min-w-0 rounded-[1.65rem] flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 ${
								active
									? "bg-white/[0.055] text-[#2f7dff]"
									: "text-white/82 hover:bg-white/[0.035]"
							}`}
							aria-label={label}
						>
							<span
								className={`flex h-8 w-8 items-center justify-center rounded-full ${
									active ? "bg-[#2f7dff] text-black" : ""
								}`}
							>
								<Icon
									size={24}
									strokeWidth={active ? 3 : 2.8}
									className={active ? "" : "text-white/90"}
								/>
							</span>
							<span className="w-full truncate px-1 text-center text-[13px] font-medium leading-none">
								{label}
							</span>
						</button>
					);
				})}
			</div>
		</nav>
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
				{showBottomNav && <BottomNav />}
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
