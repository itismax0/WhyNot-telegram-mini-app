import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, FolderOpen, Import, ScanFace, Fingerprint as FingerprintIcon } from "lucide-react";
import { mnemonicNew, mnemonicValidate } from "@ton/crypto";
import { useWallet, setCloudItem, getCloudItem } from "../store/WalletContext";
import { encryptData, decryptData } from "../services/crypto";
import {
	generateWallets,
	fetchBalances,
	registerUsername,
} from "../services/blockchain";
import { PinPad } from "../components/PinPad";
import { Icons } from "../icons/Icons";

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
		setMnemonic,
		setWallets,
		setBalances,
		networkMode,
		biometricAvailable,
	} = useWallet();

	const handleCreateNew = async () => {
		setView("loading");
		const seed = await mnemonicNew();
		const encrypted = await encryptData(seed.join(" "), tempPin);
		await setCloudItem("wallet_data", encrypted);

		setMnemonic(seed);
		const generated = await generateWallets(seed);
		setWallets(generated);

		const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user
			?.username;
		if (tgUser) {
			await registerUsername(tgUser, generated.ton.address, generated.eth.address, generated.sol.address);
		}

		if (biometricAvailable) {
			setView("biometric-setup");
		} else {
			setView("main");
		}

		fetchBalances(generated, networkMode)
			.then(setBalances)
			.catch((e) => console.error(e));
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
		setMnemonic,
		setWallets,
		setBalances,
		networkMode,
		showToast,
		biometricAvailable,
	} = useWallet();
	const [wordsInput, setWordsInput] = useState("");

	const handleRestore = async () => {
		const rawWords = wordsInput.trim().toLowerCase().split(/\s+/);

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
			const encrypted = await encryptData(rawWords.join(" "), tempPin);
			await setCloudItem("wallet_data", encrypted);

			setMnemonic(rawWords);
			const generated = await generateWallets(rawWords);
			setWallets(generated);

			const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe
				?.user?.username;
			if (tgUser) {
				await registerUsername(tgUser, generated.ton.address, generated.eth.address, generated.sol.address);
			}

			if (biometricAvailable) {
				setView("biometric-setup");
			} else {
				setView("main");
			}

			fetchBalances(generated, networkMode)
				.then(setBalances)
				.catch((e) => console.error(e));
		} catch {
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
	const { t, biometricType, setView, tempPin, setBiometricEnabled, showToast } = useWallet();

	const typeLabel = biometricType === "faceid" 
		? t("biometric_faceid") 
		: biometricType === "fingerprint" 
			? t("biometric_fingerprint") 
			: t("enable_biometric");

	const handleEnable = useCallback(() => {
		const webApp = (window as any).Telegram?.WebApp;
		if (webApp?.BiometricManager) {
			webApp.BiometricManager.requestAccess({ reason: t("enable_biometric") }, (granted: boolean) => {
				if (granted) {
					webApp.BiometricManager.updateBiometricToken(tempPin, (success: boolean) => {
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
					{t("biometric_setup_title")}
				</h2>
				<p className="text-gray-500 text-sm max-w-[280px] leading-relaxed mb-8">
					{t("biometric_setup_desc").replace("{{type}}", typeLabel)}
				</p>
			</div>
			<div className="flex flex-col gap-4 pb-6">
				<button
					onClick={handleEnable}
					className="w-full py-4 bg-white text-black font-semibold rounded-2xl active:scale-95 transition-transform"
				>
					{t("btn_enable").replace("{{type}}", typeLabel.toUpperCase())}
				</button>
				<button
					onClick={() => setView("main")}
					className="w-full py-4 bg-[#111] border border-[#222] text-gray-400 font-semibold rounded-2xl active:scale-95 transition-transform"
				>
					{t("btn_skip")}
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
		setMnemonic,
		showToast,
		tempPin,
		setTempPin,
		networkMode,
		setSeedRevealed,
		biometricEnabled,
		biometricAvailable,
		setBiometricEnabled,
		t,
	} = useWallet();
	const [pin, setPin] = useState("");

	const handleBiometricAuth = useCallback(() => {
		const webApp = (window as any).Telegram?.WebApp;
		if (webApp?.BiometricManager && biometricEnabled && biometricAvailable) {
			webApp.BiometricManager.authenticate(
				{ reason: t("enter_pin") },
				(success: boolean, token?: string) => {
					if (success && token) {
						setPin(token);
					}
				}
			);
		}
	}, [biometricEnabled, biometricAvailable, t]);

	useEffect(() => {
		if (view === "pin-enter") {
			handleBiometricAuth();
		}
	}, [view, handleBiometricAuth]);

	useEffect(() => {
		if (pin.length === 4) processPin();
	}, [pin]);

	const processPin = useCallback(async () => {
		setTimeout(
			() =>
				(async () => {
					if (view === "pin-create") {
						setTempPin(pin);
						setPin("");
						setView("pin-repeat");
					} else if (view === "pin-repeat") {
						if (pin === tempPin) {
							setView("restore-prompt");
						} else {
							showToast("PINs do not match");
							setPin("");
							setView("pin-create");
						}
					} else if (view === "pin-enter") {
						setView("loading");
						try {
							const encrypted = await getCloudItem("wallet_data");
							const decryptedStr = await decryptData(encrypted!, pin);
							const seed = decryptedStr.split(/\s+/).filter(Boolean);
							setMnemonic(seed);
							const generated = await generateWallets(seed);
							setWallets(generated);

							const tgUser = (window as any).Telegram?.WebApp
								?.initDataUnsafe?.user?.username;
							if (tgUser) {
								await registerUsername(tgUser, generated.ton.address, generated.eth.address, generated.sol.address);
							}

							setView("main");

							fetchBalances(generated, networkMode)
								.then(setBalances)
								.catch((e) => console.error(e));
						} catch {
							showToast("Invalid PIN code");
							setPin("");
							setView("pin-enter");
						}
					} else if (view === "pin-confirm-seed") {
						try {
							const encrypted = await getCloudItem("wallet_data");
							await decryptData(encrypted!, pin);

							setSeedRevealed(true);
							setPin("");
							setView("settings");
						} catch {
							showToast("Invalid PIN code");
							setPin("");
						}
					} else if (view === "pin-confirm-biometric") {
						try {
							const encrypted = await getCloudItem("wallet_data");
							await decryptData(encrypted!, pin);

							const webApp = (window as any).Telegram?.WebApp;
							if (webApp?.BiometricManager) {
								webApp.BiometricManager.updateBiometricToken(
									pin,
									(success: boolean) => {
										if (success) {
											setBiometricEnabled(true);
											showToast("Biometric access enabled");
											setPin("");
											setView("settings");
										} else {
											showToast("Failed to store biometric token");
											setPin("");
										}
									}
								);
							}
						} catch {
							showToast("Invalid PIN code");
							setPin("");
						}
					}
				})().catch((e) => console.warn("processPin error:", e)),
			200
		);
	}, [
		view,
		setView,
		tempPin,
		setTempPin,
		showToast,
		pin,
		setMnemonic,
		setWallets,
		setBalances,
		networkMode,
		setSeedRevealed,
		setBiometricEnabled,
	]);

	const title =
		view === "pin-create"
			? "Create PIN"
			: view === "pin-repeat"
				? "Repeat PIN"
				: view === "pin-confirm-seed"
					? "Enter PIN to View Seed"
					: view === "pin-confirm-biometric"
						? "Enter PIN to Enable Biometrics"
						: "Enter PIN";

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0 }}
			className="flex flex-col min-h-screen"
		>
			<PinPad title={title} pin={pin} setPin={setPin} />
		</motion.div>
	);
};
