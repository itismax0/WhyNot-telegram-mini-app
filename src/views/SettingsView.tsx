import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
	Bell,
	ChevronRight,
	Check,
	Eye,
	EyeOff,
	ExternalLink,
	Fingerprint,
	Globe,
	Key,
	Loader2,
	LogOut,
	DollarSign,
	ScanFace,
	Server,
	Sparkles,
	Trash2,
	X,
	Zap,
} from "lucide-react";
import { useWallet, removeWalletData } from "../store/WalletContext";
import { aiChat, detectKeyProvider } from "../services/aiAssistant";

const SettingsRow = ({
	icon,
	title,
	value,
	onClick,
	disabled = false,
}: {
	icon: ReactNode;
	title: string;
	value?: string;
	onClick?: () => void;
	disabled?: boolean;
}) => (
	<button
		type="button"
		onClick={onClick}
		disabled={disabled}
		className="group relative flex min-h-[76px] w-full items-center gap-4 px-4 text-left transition-colors hover:bg-white/[0.025] active:bg-white/[0.05] disabled:cursor-default disabled:opacity-55 after:absolute after:bottom-0 after:left-[76px] after:right-4 after:h-px after:bg-white/[0.09] last:after:hidden"
	>
		{icon}
		<span className="min-w-0 flex-1 truncate text-[17px] font-semibold tracking-[-0.01em] text-white">
			{title}
		</span>
		{value && (
			<span className="max-w-[35%] truncate text-right text-[16px] font-semibold text-[#8e8e93]">
				{value}
			</span>
		)}
		<ChevronRight
			size={22}
			strokeWidth={2.4}
			className="flex-shrink-0 text-[#555559] transition-transform group-active:translate-x-0.5"
		/>
	</button>
);

const SettingsIcon = ({
	children,
	className,
}: {
	children: ReactNode;
	className: string;
}) => (
	<span
		className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[13px] shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] ${className}`}
	>
		{children}
	</span>
);

export const SettingsView = () => {
	const {
		setView,
		networkMode,
		setNetworkMode,
		language,
		setLanguage,
		baseCurrency,
		setBaseCurrency,
		t,
		showToast,
		seedRevealed,
		setSeedRevealed,
		revealedSeed,
		setRevealedSeed,
		groqKey,
		setGroqKey,
		openrouterKey,
		setOpenrouterKey,
		biometricEnabled,
		setBiometricEnabled,
		biometricAvailable,
		biometricType,
	} = useWallet();

	const [keyDraft, setKeyDraft] = useState("");
	const [showKey, setShowKey] = useState(false);
	const [notificationsEnabled, setNotificationsEnabled] = useState(
		() => localStorage.getItem("wallet_notifications") !== "false"
	);
	const [fakePinDraft, setFakePinDraft] = useState(
		() => localStorage.getItem("wallet_fake_pin") ?? ""
	);
	const [showFakePinEditor, setShowFakePinEditor] = useState(false);
	const [testing, setTesting] = useState(false);
	const [testResult, setTestResult] = useState<
		null | { ok: boolean; msg: string; provider?: string }
	>(null);

	const isRu = language === "ru";

	const handleLangChange = useCallback(() => {
		setLanguage(language === "en" ? "ru" : "en");
	}, [language, setLanguage]);

	const handleCurrencyChange = useCallback(() => {
		const currencies = ["usd", "eur", "rub"] as const;
		const next = currencies[(currencies.indexOf(baseCurrency) + 1) % currencies.length];
		setBaseCurrency(next);
		showToast(
			language === "ru"
				? `Валюта переключена: ${next.toUpperCase()}`
				: `Currency switched to ${next.toUpperCase()}`
		);
	}, [baseCurrency, language, setBaseCurrency, showToast]);

	const handleNetworkChange = useCallback(() => {
		const modes = ["mainnet", "testnet", "devnet"] as const;
		const next = modes[(modes.indexOf(networkMode) + 1) % modes.length];
		setNetworkMode(next);
		showToast(
			language === "ru"
				? `Сеть переключена: ${next.toUpperCase()}`
				: `Network switched to ${next.toUpperCase()}`
		);
	}, [language, networkMode, setNetworkMode, showToast]);

	const handleNotificationsToggle = useCallback(() => {
		setNotificationsEnabled((current) => {
			const next = !current;
			localStorage.setItem("wallet_notifications", String(next));
			showToast(
				language === "ru"
					? `Уведомления ${next ? "включены" : "выключены"}`
					: `Notifications ${next ? "enabled" : "disabled"}`
			);
			return next;
		});
	}, [language, showToast]);

	const handleBiometricToggle = useCallback(() => {
		if (!biometricAvailable) return;
		const webApp = (window as any).Telegram?.WebApp;

		if (!biometricEnabled) {
			if (webApp?.BiometricManager) {
				webApp.BiometricManager.requestAccess(
					{ reason: t("enable_biometric") },
					(granted: boolean) => {
						if (granted) {
							setView("pin-confirm-biometric");
						} else {
							showToast(
								language === "ru"
									? "Доступ к биометрии отклонен"
									: "Biometric access denied"
							);
						}
					}
				);
			}
		} else {
			setBiometricEnabled(false);
			webApp?.BiometricManager?.updateBiometricToken("", () => {
				showToast(
					language === "ru"
						? "Биометрия отключена"
						: "Biometric access disabled"
				);
			});
		}
	}, [
		biometricAvailable,
		biometricEnabled,
		language,
		setBiometricEnabled,
		setView,
		showToast,
		t,
	]);

	const handleViewSeed = useCallback(() => {
		setView("pin-confirm-seed");
	}, [setView]);

	const handleFakePinSave = useCallback(() => {
		const value = fakePinDraft.trim();
		if (value && !/^\d{4}$/.test(value)) {
			showToast(isRu ? "Нужен 4-значный PIN" : "Use a 4-digit PIN");
			return;
		}
		if (value) {
			localStorage.setItem("wallet_fake_pin", value);
			showToast(isRu ? "Фейковый PIN сохранён" : "Fake PIN saved");
		} else {
			localStorage.removeItem("wallet_fake_pin");
			showToast(isRu ? "Фейковый PIN удалён" : "Fake PIN cleared");
		}
		setShowFakePinEditor(false);
	}, [fakePinDraft, isRu, showToast]);

	const handleFakePinClear = useCallback(() => {
		localStorage.removeItem("wallet_fake_pin");
		setFakePinDraft("");
		setShowFakePinEditor(false);
		showToast(isRu ? "Фейковый PIN удалён" : "Fake PIN cleared");
	}, [isRu, showToast]);

	useEffect(() => {
		if (!seedRevealed) return;
		const timer = window.setTimeout(() => {
			setSeedRevealed(false);
			setRevealedSeed(null);
		}, 30_000);
		return () => window.clearTimeout(timer);
	}, [seedRevealed, setRevealedSeed, setSeedRevealed]);

	useEffect(() => {
		return () => {
			setSeedRevealed(false);
			setRevealedSeed(null);
		};
	}, [setRevealedSeed, setSeedRevealed]);

	const handleWipeWallet = useCallback(async () => {
		if (
			confirm(
				language === "ru"
					? "Вы точно хотите удалить кошелек? Данные в облаке будут стерты."
					: "Are you absolutely sure you want to delete this wallet? Your cloud data will be wiped."
			)
		) {
			await removeWalletData();
			localStorage.removeItem("pin_attempts");
			localStorage.removeItem("pin_locked_until");
			window.location.reload();
		}
	}, [language]);

	const handleSaveKey = useCallback(() => {
		const value = keyDraft.trim();
		if (!value) {
			showToast(isRu ? "Введите ключ или очистите поле" : "Enter a key or use Clear");
			return;
		}

		const provider = detectKeyProvider(value);
		if (!provider) {
			showToast(
				isRu
					? "Ключ должен начинаться с gsk_ или sk-"
					: "Key should start with gsk_ (Groq) or sk- (OpenRouter)"
			);
			return;
		}

		if (provider === "groq") {
			setGroqKey(value);
			showToast(isRu ? "Groq ключ сохранен" : "Groq key saved");
		} else {
			setOpenrouterKey(value);
			showToast(isRu ? "OpenRouter ключ сохранен" : "OpenRouter key saved");
		}
		setKeyDraft("");
		setTestResult(null);
	}, [isRu, keyDraft, setGroqKey, setOpenrouterKey, showToast]);

	const handleClearGroq = useCallback(() => {
		setGroqKey(null);
		setTestResult(null);
		showToast(isRu ? "Groq ключ удален" : "Groq key cleared");
	}, [isRu, setGroqKey, showToast]);

	const handleClearOpenRouter = useCallback(() => {
		setOpenrouterKey(null);
		setTestResult(null);
		showToast(isRu ? "OpenRouter ключ удален" : "OpenRouter key cleared");
	}, [isRu, setOpenrouterKey, showToast]);

	const handleTestPrimary = useCallback(async () => {
		const target = groqKey || keyDraft.trim();
		if (!target) {
			setTestResult({
				ok: false,
				msg: isRu ? "Groq ключ не настроен" : "No Groq key configured",
			});
			return;
		}
		setTesting(true);
		setTestResult(null);
		try {
			const result = await aiChat({
				messages: [{ role: "user", content: "ping" }],
				maxTokens: 8,
				groqKey,
				openrouterKey,
			});
			setTestResult({
				ok: true,
				msg: `Connected via ${result.provider} (${result.model})`,
				provider: result.provider,
			});
		} catch (e: any) {
			setTestResult({
				ok: false,
				msg: e?.message?.substring(0, 120) || "Test failed",
			});
		} finally {
			setTesting(false);
		}
	}, [groqKey, isRu, keyDraft, openrouterKey]);

	const handleTestDraft = useCallback(async () => {
		const value = keyDraft.trim();
		if (!value) {
			setTestResult({
				ok: false,
				msg: isRu ? "Сначала введите ключ" : "Enter a key first",
			});
			return;
		}

		const provider = detectKeyProvider(value);
		if (!provider) {
			setTestResult({
				ok: false,
				msg: isRu
					? "Ключ должен начинаться с gsk_ или sk-"
					: "Key must start with gsk_ or sk-",
			});
			return;
		}

		setTesting(true);
		setTestResult(null);
		try {
			const result = await aiChat({
				messages: [{ role: "user", content: "ping" }],
				maxTokens: 8,
				apiKey: value,
			});
			setTestResult({
				ok: true,
				msg: `Connected via ${result.provider} (${result.model})`,
				provider: result.provider,
			});
		} catch (e: any) {
			setTestResult({
				ok: false,
				msg: e?.message?.substring(0, 120) || "Test failed",
			});
		} finally {
			setTesting(false);
		}
	}, [isRu, keyDraft]);

	const groqPreview = groqKey
		? `${groqKey.slice(0, 6)}…${groqKey.slice(-4)}`
		: null;
	const orPreview = openrouterKey
		? `${openrouterKey.slice(0, 9)}…${openrouterKey.slice(-4)}`
		: null;

	const biometricLabel =
		biometricType === "faceid"
			? t("biometric_faceid")
			: biometricType === "fingerprint"
				? t("biometric_fingerprint")
				: t("enable_biometric");
	const networkLabel =
		networkMode === "mainnet"
			? "Mainnet"
			: networkMode === "testnet"
				? "Testnet"
				: "Devnet";

	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ type: "spring", damping: 26, stiffness: 240 }}
			className="min-h-screen bg-[#050505] px-4 pb-32 pt-7 text-white"
		>
			<h1 className="mb-5 px-1 text-[30px] font-bold tracking-[-0.035em] text-[#a8a8ad]">
				{isRu ? "Основные настройки" : "General settings"}
			</h1>

			<section className="overflow-hidden rounded-[28px] border border-white/[0.04] bg-[#1c1c1e] shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
				<SettingsRow
					icon={
						<SettingsIcon className="bg-gradient-to-br from-[#ff5147] to-[#ff2d55]">
							<Bell size={25} fill="white" strokeWidth={2.2} />
						</SettingsIcon>
					}
					title={isRu ? "Уведомления" : "Notifications"}
					value={
						notificationsEnabled
							? isRu
								? "Вкл"
								: "On"
							: isRu
								? "Выкл"
								: "Off"
					}
					onClick={handleNotificationsToggle}
				/>
				<SettingsRow
					icon={
						<SettingsIcon className="bg-gradient-to-br from-[#32d96b] to-[#20b856]">
							{biometricType === "faceid" ? (
								<ScanFace size={27} strokeWidth={2.3} />
							) : (
								<Fingerprint size={27} strokeWidth={2.3} />
							)}
						</SettingsIcon>
					}
					title={
						isRu
							? `Код-пароль и ${biometricLabel}`
							: `Passcode and ${biometricLabel}`
					}
					value={
						!biometricAvailable
							? isRu
								? "Недоступно"
								: "Unavailable"
							: biometricEnabled
								? isRu
									? "Вкл"
									: "On"
								: isRu
									? "Выкл"
									: "Off"
					}
					onClick={handleBiometricToggle}
					disabled={!biometricAvailable}
				/>
				<SettingsRow
					icon={
						<SettingsIcon className="bg-gradient-to-br from-[#c04ee9] to-[#8f35d4]">
							<Globe size={25} strokeWidth={2.2} />
						</SettingsIcon>
					}
					title={t("language")}
					value={isRu ? "Русский" : "English"}
					onClick={handleLangChange}
				/>
				<SettingsRow
					icon={
						<SettingsIcon className="bg-gradient-to-br from-[#8e8e93] to-[#626267]">
							<DollarSign size={25} strokeWidth={2.2} />
						</SettingsIcon>
					}
					title={t("currency")}
					value={baseCurrency.toUpperCase()}
					onClick={handleCurrencyChange}
				/>
				<SettingsRow
					icon={
						<SettingsIcon className="bg-gradient-to-br from-[#8e8e93] to-[#626267]">
							<Server size={24} strokeWidth={2.2} />
						</SettingsIcon>
					}
					title={t("network")}
					value={networkLabel}
					onClick={handleNetworkChange}
				/>
			</section>

			<h2 className="mb-3 mt-8 px-1 text-[15px] font-semibold uppercase tracking-[0.08em] text-[#77777d]">
				{isRu ? "AI-ассистент" : "AI assistant"}
			</h2>
			<section className="overflow-hidden rounded-[28px] border border-white/[0.04] bg-[#1c1c1e] p-4">
				<div className="mb-4 flex items-center gap-3">
					<SettingsIcon className="bg-gradient-to-br from-[#4b8dff] to-[#2755dc]">
						<Sparkles size={24} />
					</SettingsIcon>
					<div className="min-w-0 flex-1">
						<p className="text-[17px] font-semibold">WhyNot AI</p>
						<p className="mt-0.5 truncate text-[12px] text-[#8e8e93]">
							{groqKey
								? `Groq ${groqPreview}`
								: openrouterKey
									? `OpenRouter ${orPreview}`
									: isRu
										? "API-ключ не настроен"
										: "API key is not configured"}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<div className="relative flex-1">
						<input
							type={showKey ? "text" : "password"}
							value={keyDraft}
							onChange={(event) => setKeyDraft(event.target.value)}
							placeholder="gsk_… or sk-or-v1-…"
							className="w-full rounded-[14px] border border-white/[0.08] bg-[#111113] py-3 pl-3 pr-10 font-mono text-xs text-white outline-none transition-colors focus:border-[#387aff]/70"
							autoComplete="off"
							spellCheck={false}
						/>
						<button
							type="button"
							onClick={() => setShowKey((shown) => !shown)}
							className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#77777d] hover:text-white"
						>
							{showKey ? <EyeOff size={15} /> : <Eye size={15} />}
						</button>
					</div>
					<button
						onClick={handleSaveKey}
						disabled={!keyDraft.trim()}
						className="rounded-[14px] bg-[#387aff] px-4 py-3 text-xs font-bold text-white transition-transform active:scale-95 disabled:opacity-40"
					>
						{isRu ? "Сохранить" : "Save"}
					</button>
				</div>

				<div className="mt-3 flex flex-wrap items-center gap-2">
					<button
						onClick={keyDraft.trim() ? handleTestDraft : handleTestPrimary}
						disabled={testing || (!keyDraft.trim() && !groqKey)}
						className="flex items-center gap-1.5 rounded-xl bg-white/[0.07] px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
					>
						{testing ? (
							<Loader2 size={13} className="animate-spin" />
						) : (
							<Zap size={13} />
						)}
						{isRu ? "Проверить" : "Test"}
					</button>
					{groqKey && (
						<button
							onClick={handleClearGroq}
							className="flex items-center gap-1.5 rounded-xl bg-white/[0.07] px-3 py-2 text-xs font-semibold text-[#ff6961]"
						>
							<Trash2 size={13} />
							Groq
						</button>
					)}
					{openrouterKey && (
						<button
							onClick={handleClearOpenRouter}
							className="flex items-center gap-1.5 rounded-xl bg-white/[0.07] px-3 py-2 text-xs font-semibold text-[#ff6961]"
						>
							<Trash2 size={13} />
							OpenRouter
						</button>
					)}
					<a
						href="https://console.groq.com/keys"
						target="_blank"
						rel="noreferrer noopener"
						className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-[#4a9dff]"
					>
						API keys
						<ExternalLink size={11} />
					</a>
				</div>

				{testResult && (
					<div
						className={`mt-3 flex items-center gap-2 rounded-xl bg-black/20 px-3 py-2 text-[11px] ${
							testResult.ok ? "text-[#35d06f]" : "text-[#ff6961]"
						}`}
					>
						{testResult.ok ? <Check size={13} /> : <X size={13} />}
						<span className="break-all font-mono">{testResult.msg}</span>
					</div>
				)}
			</section>

			<h2 className="mb-3 mt-8 px-1 text-[15px] font-semibold uppercase tracking-[0.08em] text-[#77777d]">
				{isRu ? "Безопасность" : "Security"}
			</h2>
			<section className="overflow-hidden rounded-[28px] border border-white/[0.04] bg-[#1c1c1e]">
				{!seedRevealed || !revealedSeed ? (
					<SettingsRow
						icon={
							<SettingsIcon className="bg-gradient-to-br from-[#f2a43c] to-[#d66d19]">
								<Key size={24} strokeWidth={2.2} />
							</SettingsIcon>
						}
						title={t("view_seed")}
						value={isRu ? "24 слова" : "24 words"}
						onClick={handleViewSeed}
					/>
				) : (
					<div className="p-4">
						<div className="mb-3 flex items-center gap-3">
							<SettingsIcon className="bg-gradient-to-br from-[#f2a43c] to-[#d66d19]">
								<Key size={24} />
							</SettingsIcon>
							<span className="text-[17px] font-semibold">
								{isRu ? "Seed-фраза из 24 слов" : "24-word seed phrase"}
							</span>
						</div>
						<div className="selectable-text select-text rounded-2xl border border-red-500/15 bg-[#111113] p-4 font-mono text-xs leading-relaxed text-[#ff6961]">
							{revealedSeed}
						</div>
					</div>
				)}
				<SettingsRow
					icon={
						<SettingsIcon className="bg-gradient-to-br from-[#6a7cff] to-[#3a4fe0]">
							<Key size={24} strokeWidth={2.2} />
						</SettingsIcon>
					}
					title={isRu ? "Фейковый PIN" : "Fake PIN"}
					value={
						localStorage.getItem("wallet_fake_pin")
							? isRu
								? "Вкл"
								: "On"
							: isRu
								? "Выкл"
								: "Off"
					}
					onClick={() => setShowFakePinEditor((v) => !v)}
				/>
				{showFakePinEditor && (
					<div className="p-4 border-t border-white/[0.04]">
						<div className="rounded-2xl border border-white/[0.06] bg-[#111113] p-4">
							<label className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-[#77777d]">
								{isRu ? "Новый PIN" : "New PIN"}
							</label>
							<input
								type="password"
								inputMode="numeric"
								maxLength={4}
								value={fakePinDraft}
								onChange={(event) =>
									setFakePinDraft(event.target.value.replace(/\D/g, "").slice(0, 4))
								}
								placeholder={isRu ? "4 цифры" : "4 digits"}
								className="w-full rounded-[14px] border border-white/[0.08] bg-black/30 px-4 py-3 text-[15px] font-mono text-white outline-none"
							/>
							<p className="mt-2 text-[11px] leading-relaxed text-[#77777d]">
								{isRu
									? "Открывает пустой кошелёк без доступа к реальным данным."
									: "Opens an empty wallet without touching real data."}
							</p>
							<div className="mt-4 flex gap-2">
								<button
									type="button"
									onClick={handleFakePinSave}
									className="flex-1 rounded-[14px] bg-white px-4 py-3 text-sm font-semibold text-black"
								>
									{isRu ? "Сохранить" : "Save"}
								</button>
								<button
									type="button"
									onClick={handleFakePinClear}
									className="rounded-[14px] border border-white/[0.08] bg-[#151518] px-4 py-3 text-sm font-semibold text-[#b4b4bb]"
								>
									{isRu ? "Удалить" : "Clear"}
								</button>
							</div>
						</div>
					</div>
				)}
			</section>

			<h2 className="mb-3 mt-8 px-1 text-[15px] font-semibold uppercase tracking-[0.08em] text-[#77777d]">
				{isRu ? "Опасная зона" : "Danger zone"}
			</h2>
			<button
				onClick={handleWipeWallet}
				className="flex min-h-[68px] w-full items-center gap-4 rounded-[24px] border border-red-500/10 bg-[#1c1c1e] px-4 text-left text-[#ff5d57] transition-colors hover:bg-[#241819] active:bg-[#2b191a]"
			>
				<span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[#ff453a]/15">
					<LogOut size={23} />
				</span>
				<span className="flex-1 text-[16px] font-semibold">{t("logout")}</span>
				<ChevronRight size={22} className="text-[#6d3d3d]" />
			</button>


		</motion.div>
	);
};
