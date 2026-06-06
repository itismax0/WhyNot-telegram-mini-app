import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
} from "./views/MainViews";
import { TokenDetailView } from "./views/TokenDetailView";
import { SettingsView } from "./views/SettingsView";
import { ASSETS } from "./services/blockchain";

const WebApp = (window as any).Telegram?.WebApp;

const AppContent = () => {
	const { view, setView, setRates, toast } = useWallet();

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
					`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
				);
				const data = await res.json();
				const newRates: Record<string, number> = {};
				ASSETS.forEach((a) => {
					if (data[a.cmc_id]) newRates[a.id] = data[a.cmc_id].usd;
				});
				setRates(newRates);
			} catch (e) {
				console.error("Error loading rates");
			}
		};

		fetchRates();
		checkWalletSync();
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
					{view === "history" && <HistoryView key="history" />}
					{view === "settings" && <SettingsView key="settings" />}
					{view === "token_detail" && <TokenDetailView key="token_detail" />}
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
