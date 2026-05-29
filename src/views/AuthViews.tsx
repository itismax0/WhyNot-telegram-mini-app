import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Icons } from "../icons/Icons"; 
import { mnemonicNew, mnemonicValidate } from "@ton/crypto";
import { useWallet, setCloudItem, getCloudItem } from "../store/WalletContext";
import { encryptData, decryptData } from "../services/crypto";
import { generateWallets, fetchBalances } from "../services/blockchain";
import { PinPad } from "../components/PinPad";

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
					<Icons.LogoWhyNot
						size={48}
					/>
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
	} = useWallet();

	const handleCreateNew = async () => {
		setView("loading");
		const seed = await mnemonicNew();
		const encrypted = await encryptData(seed.join(" "), tempPin);
		await setCloudItem("wallet_data", encrypted);

		setMnemonic(seed);
		const generated = await generateWallets(seed);
		setWallets(generated);
		setBalances(await fetchBalances(generated, networkMode));
		setView("main");
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="flex flex-col min-h-screen p-6"
		>
			<div className="flex-1 flex flex-col items-center justify-center text-center">
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
			setBalances(await fetchBalances(generated, networkMode));
			setView("main");
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
			<div className="flex items-center gap-4 mb-8 pt-2">
				<button
					onClick={() => setView("restore-prompt")}
					className="p-2 bg-[#111] rounded-full"
				>
					<ChevronLeft size={20} />
				</button>
				<h2 className="font-medium text-lg">{t("restore_title")}</h2>
			</div>
			<p className="text-sm text-gray-500 mb-4">{t("enter_mnemonic")}</p>
			<textarea
				rows={6}
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
	} = useWallet();
	const [pin, setPin] = useState("");

	useEffect(() => {
		if (pin.length === 4) processPin();
	}, [pin]);

	const processPin = async () => {
		setTimeout(async () => {
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
					const seed = decryptedStr.split(" ");
					setMnemonic(seed);
					const generated = await generateWallets(seed);
					setWallets(generated);
					setBalances(await fetchBalances(generated, networkMode));
					setView("main");
				} catch {
					showToast("Invalid PIN code");
					setPin("");
					setView("pin-enter");
				}
			}
		}, 200);
	};

	const title =
		view === "pin-create"
			? "Create PIN"
			: view === "pin-repeat"
				? "Repeat PIN"
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
