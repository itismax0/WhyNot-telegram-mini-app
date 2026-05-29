import React, { createContext, useContext, useState, useEffect } from "react";

type ViewState =
	| "loading"
	| "welcome"
	| "pin-create"
	| "pin-repeat"
	| "pin-enter"
	| "pin-confirm-seed"
	| "restore-prompt"
	| "restore-input"
	| "main"
	| "receive"
	| "send"
	| "history"
	| "settings";
type NetworkMode = "mainnet" | "testnet" | "devnet";
type Language = "en" | "ru";

const cloudStorage = (window as any).Telegram?.WebApp?.CloudStorage;

export const getCloudItem = (key: string): Promise<string | null> => {
	return new Promise((resolve) => {
		if (!isCloudSupported() || !webApp?.CloudStorage) {
			resolve(localStorage.getItem(key));
			return;
		}
		const timeout = setTimeout(() => {
			resolve(localStorage.getItem(key));
		}, 1000);
		webApp.CloudStorage.getItem(key, (err: any, value: string) => {
			clearTimeout(timeout);
			if (err || !value) resolve(localStorage.getItem(key));
			else resolve(value);
		});
	});
};

const webApp = (window as any).Telegram?.WebApp;
const isCloudSupported = (): boolean => {
	return (
		webApp &&
		typeof webApp.isVersionAtLeast === "function" &&
		webApp.isVersionAtLeast("6.3")
	);
};

export const setCloudItem = (key: string, value: string): Promise<void> => {
	return new Promise((resolve) => {
		localStorage.setItem(key, value);
		if (!isCloudSupported() || !webApp?.CloudStorage) {
			resolve();
			return;
		}
		const timeout = setTimeout(() => resolve(), 1000);
		webApp.CloudStorage.setItem(key, value, () => {
			clearTimeout(timeout);
			resolve();
		});
	});
};

export const removeCloudItem = (key: string): Promise<void> => {
	return new Promise((resolve) => {
		localStorage.removeItem(key);
		if (!isCloudSupported() || !webApp?.CloudStorage) {
			resolve();
			return;
		}
		const timeout = setTimeout(() => resolve(), 1000);
		webApp.CloudStorage.removeItem(key, () => {
			clearTimeout(timeout);
			resolve();
		});
	});
};

export const translations: Record<Language, Record<string, string>> = {
	en: {
		welcome_desc:
			"The ultimate next-gen multi-chain wallet. Securely manage assets fully under your own control.",
		create_wallet: "CREATE WALLET",
		restore_title: "RESTORE WALLET",
		restore_desc:
			"Do you want to restore an existing wallet using your seed phrase, or create a brand new one?",
		btn_restore: "RESTORE WITH SEED",
		btn_create_new: "CREATE NEW WALLET",
		enter_mnemonic: "Enter your 24-word seed phrase:",
		total_balance: "Total Balance",
		assets: "Assets",
		receive: "Receive",
		send: "Send",
		copied: "Address copied!",
		tx_sent: "Transaction sent successfully!",
		invalid_pin: "Invalid PIN code",
		pin_mismatch: "PINs do not match",
		available: "Available",
		amount: "Amount",
		recipient: "Recipient Address or @username",
		continue: "CONTINUE",
		settings: "Settings",
		network: "Network Mode",
		language: "Language",
		view_seed: "View Seed Phrase",
		logout: "Log Out / Wipe Wallet",
		mainnet: "Mainnet",
		testnet: "Testnet (Recommended)",
		devnet: "Devnet",
		enter_pin_to_view: "Enter your PIN to view seed",
		history: "History",
		no_txs: "No transactions found",
		history_desc: "Transactions loaded from the blockchain ledger",
		username_error: "Recipient not found. Make sure they use WhyNot?",
	},
	ru: {
		welcome_desc:
			"Мультичейн кошелек нового поколения. Безопасно управляйте активами под вашим полным контролем.",
		create_wallet: "СОЗДАТЬ КОШЕЛЕК",
		restore_title: "ВОССТАНОВЛЕНИЕ КОШЕЛЬКА",
		restore_desc:
			"Хотите восстановить существующий кошелек с помощью сид-фразы или создать абсолютно новый?",
		btn_restore: "ВОССТАНОВИТЬ СИД-ФРАЗОЙ",
		btn_create_new: "СОЗДАТЬ НОВЫЙ КОШЕЛЕК",
		enter_mnemonic: "Введите вашу сид-фразу из 24 слов через пробел:",
		total_balance: "Общий баланс",
		assets: "Активы",
		receive: "Пополнить",
		send: "Отправить",
		copied: "Адрес скопирован в буфер!",
		tx_sent: "Транзакция успешно отправлена!",
		invalid_pin: "Неверный ПИН-код",
		pin_mismatch: "ПИН-коды не совпадают",
		available: "Доступно",
		amount: "Сумма",
		recipient: "Адрес получателя или @юзернейм",
		continue: "ПРОДОЛЖИТЬ",
		settings: "Настройки",
		network: "Режим Сети",
		language: "Язык",
		view_seed: "Показать сид-фразу",
		logout: "Выйти / Удалить кошелек",
		mainnet: "Основная сеть",
		testnet: "Тестнет",
		devnet: "Девнет",
		enter_pin_to_view: "Введите ПИН для просмотра сида",
		history: "История",
		no_txs: "Транзакции не найдены",
		history_desc: "Транзакции загружены из блокчейн-реестра",
		username_error:
			"Получатель не найден. Убедитесь, что он использует WhyNot?",
	},
};

interface WalletContextType {
	view: ViewState;
	setView: (v: ViewState) => void;
	wallets: any;
	setWallets: (w: any) => void;
	balances: Record<string, number>;
	setBalances: (b: Record<string, number>) => void;
	rates: Record<string, number>;
	setRates: (r: Record<string, number>) => void;
	mnemonic: string[];
	setMnemonic: (m: string[]) => void;
	toast: string | null;
	showToast: (msg: string) => void;
	networkMode: NetworkMode;
	setNetworkMode: (m: NetworkMode) => void;
	language: Language;
	setLanguage: (l: Language) => void;
	t: (key: string) => string;
	tempPin: string;
	setTempPin: (pin: string) => void;
	seedRevealed: boolean;
	setSeedRevealed: (v: boolean) => void;
}

const WalletContext = createContext<WalletContextType>({} as WalletContextType);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
	const [view, setView] = useState<ViewState>("loading");
	const [wallets, setWallets] = useState<any>(null);
	const [balances, setBalances] = useState<Record<string, number>>({});
	const [rates, setRates] = useState<Record<string, number>>({});
	const [mnemonic, setMnemonic] = useState<string[]>([]);
	const [toast, setToast] = useState<string | null>(null);
	const [networkMode, setNetworkModeState] = useState<NetworkMode>("mainnet");
	const [language, setLanguageState] = useState<Language>("en");
	const [tempPin, setTempPin] = useState<string>("");
	const [seedRevealed, setSeedRevealed] = useState<boolean>(false);

	useEffect(() => {
		const savedLang = localStorage.getItem("wallet_lang") as Language;
		if (savedLang) setLanguageState(savedLang);
		const savedNet = localStorage.getItem("wallet_net") as NetworkMode;
		if (savedNet) setNetworkModeState(savedNet);
	}, []);

	const setLanguage = (l: Language) => {
		setLanguageState(l);
		localStorage.setItem("wallet_lang", l);
	};

	const setNetworkMode = (m: NetworkMode) => {
		setNetworkModeState(m);
		localStorage.setItem("wallet_net", m);
	};

	const showToast = (msg: string) => {
		setToast(msg);
		setTimeout(() => setToast(null), 3000);
	};

	const t = (key: string) => {
		return translations[language][key] || key;
	};

	return (
		<WalletContext.Provider
			value={{
				view,
				setView,
				wallets,
				setWallets,
				balances,
				setBalances,
				rates,
				setRates,
				mnemonic,
				setMnemonic,
				toast,
				showToast,
				networkMode,
				setNetworkMode,
				language,
				setLanguage,
				t,
				tempPin,
				setTempPin,
				seedRevealed,
				setSeedRevealed,
			}}
		>
			{children}
		</WalletContext.Provider>
	);
};

export const useWallet = () => useContext(WalletContext);
