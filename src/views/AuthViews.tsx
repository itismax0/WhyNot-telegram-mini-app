import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, FolderOpen, Import, ScanFace, Fingerprint as FingerprintIcon } from "lucide-react";
import { mnemonicNew, mnemonicValidate } from "@ton/crypto";
import {
	useWallet,
	setCloudItem,
	getCloudItem,
	getWebApp,
	setWalletData,
	getWalletData,
	getWalletDeviceSecret,
} from "../store/WalletContext";
import {
	decryptWalletData,
	encryptWalletData,
	isLegacyWalletData,
} from "../services/crypto";
import {
	generateWallets,
	fetchBalances,
} from "../services/blockchain";
import { PinPad } from "../components/PinPad";
import { Icons } from "../icons/Icons";

const FAKE_PIN_KEY = "wallet_fake_pin";

const getFakePin = () => localStorage.getItem(FAKE_PIN_KEY) ?? "";

async function decryptAndMigrateWallet(
	encrypted: string,
	pin: string
): Promise<string> {
	const legacy = isLegacyWalletData(encrypted);
	const deviceSecret = await getWalletDeviceSecret(legacy);
	const plaintext = await decryptWalletData(encrypted, pin, deviceSecret);

	if (legacy) {
		const upgraded = await encryptWalletData(plaintext, pin, deviceSecret);
		await setWalletData(upgraded);
	}

	return plaintext;
}

async function createEmptyWalletSet() {
	const seed = await mnemonicNew();
	const wallets = await generateWallets(seed);
	seed.fill("");
	return wallets;
}

export const WelcomeView = () => {
	const { setView, t } = useWallet();
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="flex flex-col min-h-screen p-6"
		>
			<div className="flex-1 flex flex-col items-center justify-center text-center">
				<div className="w-24 h-24 mb-8 rounded-[2rem] bg-[#111] flex items-center justify-center border border-[#222] shadow-2xl">
					<Icons.LogoWhyNot size={48} />
				</div>
				<h1 className="text-3xl font-semibold mb-4 tracking-tight">
					WhyNot? WALLET
				</h1>
				<p className="text-gray-500 text-sm max-w-[260px] leading-relaxed">
					{t("welcome_desc")}
				</p>
			</div>
			<div className="pb-6">
				<button
					onClick={() => setView("pin-create")}
					className="w-full py-4 bg-white text-black font-semibold text-base rounded-2xl active:scale-[0.98] transition-transform shadow-lg shadow-white/10"
				>
					{t("create_wallet")}
				</button>
			</div>
		</motion.div>
	);
};

export const RestorePromptView = () => {
	const {
		setView,
		t,
		tempPin,
		setWallets,
		setBalances,
		setWalletMode,
		networkMode,
		biometricAvailable,
		setTempPin,
		showToast,
	} = useWallet();

	const handleCreateNew = async () => {
		try {
			setView("loading");
			const seed = await mnemonicNew();
			if (!seed || seed.length !== 24 || seed.some((w) => !w)) {
				throw new Error("Mnemonic generation failed: invalid result");
			}
			setWalletMode("real");
			const deviceSecret = await getWalletDeviceSecret(true);
			const encrypted = await encryptWalletData(
				seed.join(" "),
				tempPin,
				deviceSecret
			);
			await setWalletData(encrypted);

			const generated = await generateWallets(seed);
			seed.fill("");
			setWallets(generated);
			setTempPin("");

			if (biometricAvailable) {
				setView("biometric-setup");
			} else {
				setView("main");
			}

			fetchBalances(generated, networkMode)
				.then(setBalances)
				.catch((e) => {
					console.error(e);
					showToast("Failed to fetch balances");
				});
		} catch (e) {
			console.error("Wallet creation failed", e);
			showToast("Failed to create wallet");
			setView("welcome");
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="flex flex-col min-h-screen p-6"
		>
			<div className="flex-1 flex flex-col items-center justify-center text-center">
				<div className="w-20 h-20 bg-[#111] border border-[#222] rounded-3xl flex items-center justify-center mb-6 text-gray-400">
					<Import size={36} strokeWidth={1.5} />
				</div>
				<h2 className="text-2xl font-semibold mb-4">
					{t("restore_title")}
				</h2>
				<p className="text-gray-500 text-sm max-w-[280px] leading-relaxed mb-8">
					{t("restore_desc")}
				</p>
			</div>
			<div className="flex flex-col gap-4 pb-6">
				<button
					onClick={() => setView("restore-input")}
					className="w-full py-4 bg-white text-black font-semibold rounded-2xl active:scale-95 transition-transform"
				>
					{t("btn_restore")}
				</button>
				<button
					onClick={handleCreateNew}
					className="w-full py-4 bg-[#111] border border-[#222] text-white font-semibold rounded-2xl active:scale-95 transition-transform"
				>
					{t("btn_create_new")}
				</button>
			</div>
		</motion.div>
	);
};

export const RestoreInputView = () => {
	const {
		setView,
		t,
		tempPin,
		setWallets,
		setBalances,
		setWalletMode,
		networkMode,
		showToast,
		biometricAvailable,
		setTempPin,
	} = useWallet();
	const [wordsInput, setWordsInput] = useState("");

	const handleRestore = async () => {
		const rawWords = wordsInput.trim().toLowerCase().split(/\s+/);

		setWordsInput("");

		if (rawWords.length !== 24) {
			showToast("Enter exactly 24 words");
			return;
		}

		const isValid = await mnemonicValidate(rawWords);
		if (!isValid) {
			showToast("Invalid seed phrase checksum");
			return;
		}

		setView("loading");
		try {
			setWalletMode("real");
			const deviceSecret = await getWalletDeviceSecret(true);
			const encrypted = await encryptWalletData(
				rawWords.join(" "),
				tempPin,
				deviceSecret
			);
			await setWalletData(encrypted);

			const generated = await generateWallets(rawWords);
			rawWords.fill("");
			setWallets(generated);
			setTempPin("");

			if (biometricAvailable) {
				setView("biometric-setup");
			} else {
				setView("main");
			}

			fetchBalances(generated, networkMode)
				.then(setBalances)
				.catch(() => {});
		} catch {
			rawWords.fill("");
			showToast("Restoration error");
			setView("welcome");
		}
	};

	return (
		<motion.div
			initial={{ x: "100%" }}
			animate={{ x: 0 }}
			className="flex flex-col min-h-screen p-6"
		>
			<div className="flex items-center gap-4 mb-6 pt-2">
				<button
					onClick={() => setView("restore-prompt")}
					className="p-2 bg-[#111] rounded-full"
				>
					<ChevronLeft size={20} />
				</button>
				<h2 className="font-medium text-lg">{t("restore_title")}</h2>
			</div>
			<div className="flex flex-col items-center mb-6">
				<FolderOpen
					size={48}
					strokeWidth={1.5}
					className="text-gray-500 mb-2"
				/>
				<p className="text-xs text-gray-400 text-center">
					{t("enter_mnemonic")}
				</p>
			</div>
			<textarea
				rows={5}
				value={wordsInput}
				onChange={(e) => setWordsInput(e.target.value)}
				className="w-full bg-[#111] border border-[#222] rounded-2xl p-4 font-mono text-sm outline-none placeholder-gray-700 select-text"
				placeholder="apple banana cherry..."
			/>
			<div className="mt-auto pb-6">
				<button
					onClick={handleRestore}
					className="w-full py-4 bg-white text-black font-semibold rounded-2xl"
				>
					{t("continue")}
				</button>
			</div>
		</motion.div>
	);
};

export const BiometricSetupView = () => {
	const { t, language, biometricType, setView, tempPin, setBiometricEnabled, showToast } = useWallet();

	const typeLabel = biometricType === "faceid" 
		? "Face ID"
		: biometricType === "fingerprint" 
			? "Touch ID"
			: language === "ru"
				? "биометрию"
				: "biometrics";
	const title =
		language === "ru" ? `Настройте ${typeLabel}` : `Set up ${typeLabel}`;
	const description =
		language === "ru"
			? `Используйте ${typeLabel} для быстрого входа и безопасного подтверждения операций.`
			: `Use ${typeLabel} for quick access and secure transaction confirmation.`;
	const enableLabel =
		language === "ru"
			? `ВКЛЮЧИТЬ ${typeLabel.toUpperCase()}`
			: `ENABLE ${typeLabel.toUpperCase()}`;
	const skipLabel = language === "ru" ? "ПРОПУСТИТЬ" : "SKIP";

	const handleEnable = useCallback(() => {
		const app = getWebApp();
		if (app?.BiometricManager) {
			app.BiometricManager.requestAccess(t("enable_biometric"), (granted: boolean) => {
				if (granted) {
					app.BiometricManager.updateBiometricToken(tempPin, (success: boolean) => {
						if (success) {
							setBiometricEnabled(true);
							showToast("Biometrics enabled");
							setView("main");
						} else {
							showToast("Failed to enable biometrics");
							setView("main");
						}
					});
				} else {
					setView("main");
				}
			});
		} else {
			setView("main");
		}
	}, [t, tempPin, setBiometricEnabled, showToast, setView]);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="flex flex-col min-h-screen p-6"
		>
			<div className="flex-1 flex flex-col items-center justify-center text-center">
				<div className="w-24 h-24 bg-[#111] border border-[#222] rounded-[2.5rem] flex items-center justify-center mb-8 text-[#387aff] shadow-2xl shadow-[#387aff]/10">
					{biometricType === "faceid" ? (
						<ScanFace size={48} strokeWidth={1.5} />
					) : (
						<FingerprintIcon size={48} strokeWidth={1.5} />
					)}
				</div>
				<h2 className="text-2xl font-semibold mb-4">
					{title}
				</h2>
				<p className="text-gray-500 text-sm max-w-[280px] leading-relaxed mb-8">
					{description}
				</p>
			</div>
			<div className="flex flex-col gap-4 pb-6">
				<button
					onClick={handleEnable}
					className="w-full py-4 bg-white text-black font-semibold rounded-2xl active:scale-95 transition-transform"
				>
					{enableLabel}
				</button>
				<button
					onClick={() => setView("main")}
					className="w-full py-4 bg-[#111] border border-[#222] text-gray-400 font-semibold rounded-2xl active:scale-95 transition-transform"
				>
					{skipLabel}
				</button>
			</div>
		</motion.div>
	);
};

export const PinManager = () => {
	const {
		view,
		setView,
		setWallets,
		setBalances,
		showToast,
		tempPin,
		setTempPin,
		networkMode,
		setWalletMode,
		setSeedRevealed,
		setRevealedSeed,
		biometricEnabled,
		biometricAvailable,
		setBiometricEnabled,
		t,
	} = useWallet();
	const [pinAttempts, setPinAttempts] = useState(0);
	const [pinLockedUntil, setPinLockedUntil] = useState(0);
	const [lockoutLoaded, setLockoutLoaded] = useState(false);
	const [resetTrigger, setResetTrigger] = useState(0);
	const isProcessingRef = useRef(false);

	const saveLockout = useCallback(
		async (attempts: number, lockedUntil: number) => {
			await Promise.all([
				setCloudItem("pin_attempts", String(attempts)),
				setCloudItem("pin_locked_until", String(lockedUntil)),
			]);
			localStorage.setItem("pin_attempts", String(attempts));
			if (lockedUntil > Date.now()) {
				localStorage.setItem(
					"pin_locked_until",
					String(lockedUntil)
				);
			} else {
				localStorage.removeItem("pin_locked_until");
			}
		},
		[]
	);

	useEffect(() => {
		Promise.all([
			getCloudItem("pin_attempts"),
			getCloudItem("pin_locked_until"),
		]).then(([attemptsRaw, lockedRaw]) => {
			const raw = localStorage.getItem("pin_attempts");
			const localParsed = raw ? Number(raw) : 0;
			const cloudParsed = attemptsRaw ? Number(attemptsRaw) : 0;
			const attempts =
				Number.isFinite(cloudParsed) && cloudParsed > 0
					? cloudParsed
					: Number.isFinite(localParsed) && localParsed > 0
						? localParsed
						: 0;

			const lockedRaw2 = localStorage.getItem("pin_locked_until");
			const localLocked = lockedRaw2 ? Number(lockedRaw2) : 0;
			const cloudLocked = lockedRaw ? Number(lockedRaw) : 0;
			const lockedUntil =
				Number.isFinite(cloudLocked) && cloudLocked > Date.now()
					? cloudLocked
					: Number.isFinite(localLocked) && localLocked > Date.now()
						? localLocked
						: 0;

			setPinAttempts(attempts);
			setPinLockedUntil(lockedUntil);
			setLockoutLoaded(true);

			if (attempts > 0) {
				saveLockout(attempts, lockedUntil);
			}
		});
	}, [saveLockout]);

	useEffect(() => {
		if (pinAttempts > 0) {
			saveLockout(pinAttempts, pinLockedUntil);
		}
	}, [pinAttempts, pinLockedUntil, saveLockout]);

	useEffect(() => {
		if (pinLockedUntil <= Date.now()) return;
		const targetTime = pinLockedUntil;
		const timer = window.setInterval(() => {
			if (Date.now() >= targetTime) {
				setPinLockedUntil(0);
				setPinAttempts(0);
				setResetTrigger((n) => n + 1);
				window.clearInterval(timer);
			}
		}, 500);
		return () => window.clearInterval(timer);
	}, [pinLockedUntil]);

	const registerPinFailure = useCallback(() => {
		setPinAttempts((current) => {
			const next = current + 1;
			if (next >= 5) {
				const lockoutMs = Math.min(
					5 * 60_000,
					30_000 * (1 + Math.floor((next - 5) / 2))
				);
				setPinLockedUntil(Date.now() + lockoutMs);
				showToast("Too many attempts. Try again later.");
			} else {
				showToast(t("invalid_pin"));
			}
			return next;
		});
	}, [showToast, t]);

	const handlePinCreate = useCallback(
		async (currentPin: string) => {
			setTempPin(currentPin);
			setView("pin-repeat");
		},
		[setTempPin, setView]
	);

	const handlePinRepeat = useCallback(
		async (currentPin: string) => {
			if (currentPin === tempPin) {
				setView("restore-prompt");
			} else {
				showToast("PINs do not match");
				setView("pin-create");
			}
		},
		[tempPin, showToast, setView]
	);

	const handlePinEnter = useCallback(
		async (currentPin: string) => {
			setView("loading");
			try {
				const fakePin = getFakePin();
				if (fakePin && currentPin === fakePin) {
					const fakeWallets = await createEmptyWalletSet();
					setWalletMode("decoy");
					setWallets(fakeWallets);
					setBalances({
						whynot: 0,
						ton: 0,
						eth: 0,
						sol: 0,
						usdt: 0,
						btc: 0,
					});
					setTempPin("");
					setPinAttempts(0);
					setPinLockedUntil(0);
					saveLockout(0, 0);
					setRevealedSeed(null);
					setSeedRevealed(false);
					setView("main");
					return;
				}

				const encrypted = await getWalletData();
				if (!encrypted) {
					showToast("No wallet data found");
					setView("welcome");
					return;
				}
				const decryptedStr = await decryptAndMigrateWallet(
					encrypted,
					currentPin
				);
				const seed = decryptedStr.split(/\s+/).filter(Boolean);
				setWalletMode("real");
				const generated = await generateWallets(seed);
				seed.fill("");
				setWallets(generated);

				setView("main");
				setTempPin("");
				setPinAttempts(0);
				setPinLockedUntil(0);
				saveLockout(0, 0);

				fetchBalances(generated, networkMode)
					.then(setBalances)
					.catch(() => {});
			} catch {
				registerPinFailure();
				setView("pin-enter");
			}
		},
		[
			setWallets,
			setView,
			showToast,
			networkMode,
			setBalances,
			registerPinFailure,
			setTempPin,
			saveLockout,
			setWalletMode,
			setSeedRevealed,
			setRevealedSeed,
		]
	);

	const handlePinConfirmSeed = useCallback(
		async (currentPin: string) => {
			setView("loading");
			try {
				const encrypted = await getWalletData();
				if (!encrypted) {
					showToast("No wallet data found");
					setView("settings");
					return;
				}
				const seed = await decryptAndMigrateWallet(
					encrypted,
					currentPin
				);

				setWalletMode("real");
				setRevealedSeed(seed);
				setSeedRevealed(true);
				setView("settings");
			} catch {
				registerPinFailure();
				setView("pin-confirm-seed");
			}
		},
			[
				setView,
				showToast,
				setSeedRevealed,
				setRevealedSeed,
				setWalletMode,
				registerPinFailure,
			]
		);

	const handlePinConfirmBiometric = useCallback(
		async (currentPin: string) => {
			setView("loading");
			try {
				const encrypted = await getWalletData();
				if (!encrypted) {
					showToast("No wallet data found");
					setView("settings");
					return;
				}
				await decryptAndMigrateWallet(encrypted, currentPin);
				setWalletMode("real");

				const app = getWebApp();
				if (app?.BiometricManager) {
					app.BiometricManager.updateBiometricToken(
						currentPin,
						(success: boolean) => {
							if (success) {
								setBiometricEnabled(true);
								showToast("Biometric access enabled");
								setView("settings");
							} else {
								showToast(
									"Failed to store biometric token"
								);
							}
						}
					);
				}
			} catch {
				registerPinFailure();
				setView("pin-confirm-biometric");
			}
		},
		[
			setView,
			showToast,
			setBiometricEnabled,
			setWalletMode,
			registerPinFailure,
		]
	);

	const handleBiometricAuth = useCallback(() => {
		const app = getWebApp();
		if (app?.BiometricManager && biometricEnabled && biometricAvailable) {
			app.BiometricManager.authenticate(
				t("enter_pin"),
				(success: boolean, token?: string) => {
					if (success && token && token.length > 0) {
						handlePinEnter(token);
					}
				}
			);
		}
	}, [biometricEnabled, biometricAvailable, t, handlePinEnter]);

	useEffect(() => {
		if (view === "pin-enter") {
			handleBiometricAuth();
		}
	}, [view, handleBiometricAuth]);

	const processPin = useCallback(
		async (completedPin: string) => {
			if (!lockoutLoaded) return;
			if (isProcessingRef.current) return;
			if (pinLockedUntil > Date.now()) {
				showToast("Too many attempts. Try again later.");
				return;
			}

			if (view === "pin-create") {
				const trivial = [
					"0000",
					"1111",
					"2222",
					"3333",
					"4444",
					"5555",
					"6666",
					"7777",
					"8888",
					"9999",
					"1234",
					"4321",
					"2580",
				];
				if (trivial.includes(completedPin)) {
					showToast(t("pin_too_simple"));
					return;
				}
			}

			isProcessingRef.current = true;
			const currentView = view;

			setTimeout(async () => {
				try {
					if (currentView === "pin-create") {
						await handlePinCreate(completedPin);
					} else if (currentView === "pin-repeat") {
						await handlePinRepeat(completedPin);
					} else if (currentView === "pin-enter") {
						await handlePinEnter(completedPin);
					} else if (currentView === "pin-confirm-seed") {
						await handlePinConfirmSeed(completedPin);
					} else if (currentView === "pin-confirm-biometric") {
						await handlePinConfirmBiometric(completedPin);
					}
				} catch (e) {
					console.warn("processPin error:", e);
				} finally {
					isProcessingRef.current = false;
				}
			}, 200);
		},
		[
			view,
			pinLockedUntil,
			lockoutLoaded,
			showToast,
			t,
			handlePinCreate,
			handlePinRepeat,
			handlePinEnter,
			handlePinConfirmSeed,
			handlePinConfirmBiometric,
		]
	);

	const handlePinComplete = useCallback(
		(completedPin: string) => {
			processPin(completedPin);
		},
		[processPin]
	);

	const title =
		view === "pin-create"
			? t("pin_create")
			: view === "pin-repeat"
				? t("pin_repeat")
				: view === "pin-confirm-seed"
					? t("pin_confirm_seed")
					: view === "pin-confirm-biometric"
						? t("pin_confirm_bio")
						: t("pin_enter");

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0 }}
			className="flex flex-col min-h-screen"
		>
			<PinPad
				title={title}
				onComplete={handlePinComplete}
				resetTrigger={resetTrigger}
			/>
		</motion.div>
	);
};
