import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Key, LogOut, Globe, Server } from "lucide-react";
import { useWallet, removeCloudItem } from "../store/WalletContext";

export const SettingsView = () => {
	const {
		setView,
		networkMode,
		setNetworkMode,
		language,
		setLanguage,
		mnemonic,
		t,
		showToast,
	} = useWallet();
	const [showSeed, setShowSeed] = useState(false);
	const [pinPrompt, setPinPrompt] = useState(false);
	const [pinInput, setPinInput] = useState("");

	const handleLangChange = () => {
		setLanguage(language === "en" ? "ru" : "en");
	};

	const handleNetworkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setNetworkMode(e.target.value as any);
		showToast(`Network switched to ${e.target.value.toUpperCase()}`);
	};

	const handleViewSeed = () => {
		setPinPrompt(true);
	};

	const handleVerifyPin = () => {
		const encrypted = localStorage.getItem("wallet_data");
		if (!encrypted) return;

		try {
			setPinPrompt(false);
			setShowSeed(true);
			setPinInput("");
		} catch {
			showToast("Wrong PIN code");
		}
	};

	const handleWipeWallet = async () => {
		if (
			confirm(
				"Are you absolutely sure you want to delete this wallet? Your cloud data will be wiped."
			)
		) {
			await removeCloudItem("wallet_data");
			localStorage.clear();
			window.location.reload();
		}
	};

	return (
		<motion.div
			initial={{ x: "100%" }}
			animate={{ x: 0 }}
			transition={{ type: "spring", damping: 25, stiffness: 200 }}
			className="flex flex-col min-h-screen p-5"
		>
			<div className="flex items-center gap-4 mb-8 pt-2">
				<button
					onClick={() => setView("main")}
					className="p-2 bg-[#111] rounded-full hover:bg-[#222] transition-colors"
				>
					<ChevronLeft size={20} />
				</button>
				<h2 className="font-medium text-lg">{t("settings")}</h2>
			</div>

			<div className="space-y-6 flex-1">
				<div className="bg-[#111] border border-[#222] rounded-2xl p-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Server className="text-gray-400" size={20} />
						<span className="text-sm font-medium">
							{t("network")}
						</span>
					</div>
					<select
						value={networkMode}
						onChange={handleNetworkChange}
						className="bg-black border border-[#333] rounded-xl p-2 font-mono text-xs text-white outline-none"
					>
						<option value="mainnet">Mainnet</option>
						<option value="testnet">Testnet</option>
						<option value="devnet">Devnet</option>
					</select>
				</div>

				<div className="bg-[#111] border border-[#222] rounded-2xl p-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Globe className="text-gray-400" size={20} />
						<span className="text-sm font-medium">
							{t("language")}
						</span>
					</div>
					<button
						onClick={handleLangChange}
						className="bg-black border border-[#333] rounded-xl px-4 py-2 text-xs font-mono text-white active:scale-95 transition-transform"
					>
						{language.toUpperCase()}
					</button>
				</div>

				<div className="bg-[#111] border border-[#222] rounded-2xl p-4 flex flex-col gap-4">
					{!showSeed ? (
						<button
							onClick={handleViewSeed}
							className="flex items-center gap-3 w-full text-left text-sm font-medium text-gray-300 hover:text-white transition-colors"
						>
							<Key size={20} className="text-gray-400" />
							{t("view_seed")}
						</button>
					) : (
						<div>
							<div className="flex items-center gap-3 mb-3">
								<Key size={20} className="text-green-500" />
								<span className="text-sm font-semibold">
									Your 24-Word Seed Phrase
								</span>
							</div>
							<div className="bg-black p-4 rounded-xl border border-[#222] font-mono text-xs leading-relaxed text-red-500 selectable-text select-text">
								{mnemonic.join(" ")}
							</div>
						</div>
					)}
				</div>

				<button
					onClick={handleWipeWallet}
					className="w-full bg-[#111] border border-red-950 hover:bg-[#1a0f0f] p-4 rounded-2xl flex items-center gap-3 text-red-500 transition-colors text-sm font-medium mt-auto"
				>
					<LogOut size={20} />
					{t("logout")}
				</button>
			</div>

			<AnimatePresence>
				{pinPrompt && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6"
					>
						<div className="w-full bg-[#111] border border-[#222] p-6 rounded-3xl flex flex-col items-center">
							<h3 className="font-mono text-sm tracking-wide mb-6 uppercase text-gray-400">
								{t("enter_pin_to_view")}
							</h3>

							<input
								type="password"
								maxLength={4}
								value={pinInput}
								onChange={(e) => setPinInput(e.target.value)}
								placeholder="••••"
								className="bg-black border border-[#222] rounded-xl px-4 py-3 text-center tracking-[1rem] font-mono text-2xl w-32 outline-none mb-6 select-text"
							/>

							<div className="flex gap-4 w-full">
								<button
									onClick={() => setPinPrompt(false)}
									className="flex-1 py-3 bg-[#222] rounded-xl text-sm font-medium"
								>
									Cancel
								</button>
								<button
									onClick={handleVerifyPin}
									className="flex-1 py-3 bg-white text-black rounded-xl text-sm font-bold"
								>
									Confirm
								</button>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
};
