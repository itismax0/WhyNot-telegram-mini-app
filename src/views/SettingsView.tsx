import { useState } from "react";
import { motion } from "framer-motion";
import {
	ChevronLeft,
	Key,
	LogOut,
	Globe,
	Server,
	Sparkles,
	Eye,
	EyeOff,
	ExternalLink,
	Loader2,
	Check,
	X,
	Trash2,
	Zap,
} from "lucide-react";
import { useWallet, removeCloudItem } from "../store/WalletContext";
import { aiChat } from "../services/aiAssistant";

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
		seedRevealed,
		setSeedRevealed,
		groqKey,
		setGroqKey,
	} = useWallet();

	const [keyDraft, setKeyDraft] = useState(groqKey || "");
	const [showKey, setShowKey] = useState(false);
	const [testing, setTesting] = useState(false);
	const [testResult, setTestResult] = useState<
		null | { ok: boolean; msg: string }
	>(null);

	const handleLangChange = () => {
		setLanguage(language === "en" ? "ru" : "en");
	};

	const handleNetworkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setNetworkMode(e.target.value as any);
		showToast(`Network switched to ${e.target.value.toUpperCase()}`);
	};

	const handleViewSeed = () => {
		setView("pin-confirm-seed");
	};

	const handleBack = () => {
		setSeedRevealed(false);
		setView("main");
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

	const handleSaveKey = () => {
		const v = keyDraft.trim();
		if (!v) {
			setGroqKey(null);
			showToast("AI key cleared");
			setTestResult(null);
			return;
		}
		if (!v.startsWith("sk-")) {
			showToast("Key should start with sk-…");
			return;
		}
		setGroqKey(v);
		showToast("AI key saved");
		setTestResult(null);
	};

	const handleClearKey = () => {
		setKeyDraft("");
		setGroqKey(null);
		setTestResult(null);
		showToast("AI key cleared");
	};

	const handleTestKey = async () => {
		const v = keyDraft.trim();
		if (!v) {
			setTestResult({ ok: false, msg: "Enter a key first" });
			return;
		}
		setTesting(true);
		setTestResult(null);
		try {
			await aiChat({
				messages: [{ role: "user", content: "ping" }],
				maxTokens: 8,
				apiKey: v,
			});
			setTestResult({ ok: true, msg: "Connected" });
		} catch (e: any) {
			setTestResult({
				ok: false,
				msg: e?.message?.substring(0, 100) || "Test failed",
			});
		} finally {
			setTesting(false);
		}
	};

	return (
		<motion.div
			initial={{ x: "100%" }}
			animate={{ x: 0 }}
			transition={{ type: "spring", damping: 25, stiffness: 200 }}
			className="flex flex-col min-h-screen p-5 pb-32"
		>
			<div className="flex items-center gap-4 mb-8 pt-2">
				<button
					onClick={handleBack}
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

				<div className="bg-[#111] border border-[#222] rounded-2xl p-4 flex flex-col gap-3">
					<div className="flex items-center gap-3">
						<Sparkles size={20} className="text-[#387aff]" />
						<span className="text-sm font-medium">AI assistant</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex-1 relative">
							<input
								type={showKey ? "text" : "password"}
								value={keyDraft}
								onChange={(e) => setKeyDraft(e.target.value)}
								placeholder="sk-or-v1-…"
								className="w-full bg-black border border-[#333] rounded-xl pl-3 pr-9 py-2.5 font-mono text-xs text-white outline-none focus:border-[#387aff]/60 transition-colors"
								autoComplete="off"
								spellCheck={false}
							/>
							<button
								type="button"
								onClick={() => setShowKey((s) => !s)}
								className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white"
							>
								{showKey ? <EyeOff size={14} /> : <Eye size={14} />}
							</button>
						</div>
						<button
							onClick={handleSaveKey}
							className="bg-[#387aff] hover:bg-[#2d6de0] text-white text-xs font-medium px-3 py-2.5 rounded-xl active:scale-95 transition-transform"
						>
							Save
						</button>
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={handleTestKey}
							disabled={testing || !keyDraft.trim()}
							className="flex items-center gap-1.5 bg-[#222] hover:bg-[#2a2a2a] disabled:opacity-50 text-white text-xs font-medium px-3 py-2 rounded-xl active:scale-95 transition-transform"
						>
							{testing ? (
								<Loader2 size={12} className="animate-spin" />
							) : (
								<Zap size={12} />
							)}
							Test connection
						</button>
						{groqKey && (
							<button
								onClick={handleClearKey}
								className="flex items-center gap-1.5 bg-[#222] hover:bg-red-950/40 text-gray-400 hover:text-red-400 text-xs font-medium px-3 py-2 rounded-xl active:scale-95 transition-colors"
							>
								<Trash2 size={12} />
								Clear
							</button>
						)}
						<a
							href="https://console.groq.com/keys"
							target="_blank"
							rel="noreferrer noopener"
							className="ml-auto flex items-center gap-1 text-[10px] text-[#387aff] hover:underline"
						>
							Get a key
							<ExternalLink size={10} />
						</a>
					</div>
					{testResult && (
						<div
							className={`flex items-center gap-2 text-[11px] ${
								testResult.ok ? "text-green-400" : "text-red-400"
							}`}
						>
							{testResult.ok ? (
								<Check size={12} />
							) : (
								<X size={12} />
							)}
							<span className="font-mono break-all">
								{testResult.msg}
							</span>
						</div>
					)}
				</div>

				<div className="bg-[#111] border border-[#222] rounded-2xl p-4 flex flex-col gap-4">
					{!seedRevealed ? (
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
							<div className="bg-black p-4 rounded-xl border border-red-900/30 font-mono text-xs leading-relaxed text-red-500 selectable-text select-text">
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
		</motion.div>
	);
};
