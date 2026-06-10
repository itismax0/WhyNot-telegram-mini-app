import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	useMemo,
} from "react";

type ViewState =
	| "loading"
	| "welcome"
	| "pin-create"
	| "pin-repeat"
	| "pin-enter"
	| "pin-confirm-seed"
	| "pin-confirm-biometric"
	| "restore-prompt"
	| "restore-input"
	| "biometric-setup"
	| "main"
	| "receive"
	| "send"
	| "swap"
	| "history"
	| "settings"
	| "more"
	| "vpn"
	| "cloud"
	| "token_detail"
	| "ai";
type NetworkMode = "mainnet" | "testnet" | "devnet";
type Language = "en" | "ru";

export const getCloudItem = (key: string): Promise<string | null> => {
	return new Promise((resolve) => {
		if (!isCloudSupported() || !webApp?.CloudStorage) {
			resolve(localStorage.getItem(key));
			return;
		}
		const timeout = setTimeout(() => {
			console.warn(`[CloudStorage] getItem("${key}") timeout, falling back to localStorage`);
			resolve(localStorage.getItem(key));
		}, 1000);
		webApp.CloudStorage.getItem(key, (err: any, value: string) => {
			clearTimeout(timeout);
			if (err) {
				console.warn(`[CloudStorage] getItem("${key}") error:`, err);
				resolve(localStorage.getItem(key));
			} else if (!value) {
				resolve(localStorage.getItem(key));
			} else {
				resolve(value);
			}
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
		const timeout = setTimeout(() => {
			console.warn(`[CloudStorage] setItem("${key}") timeout`);
			try {
				localStorage.setItem("cloud_unverified", "1");
			} catch {
				/* localStorage quota / disabled */
			}
			resolve();
		}, 1000);
		webApp.CloudStorage.setItem(key, value, (err: any) => {
			clearTimeout(timeout);
			if (err) {
				console.warn(`[CloudStorage] setItem("${key}") error:`, err);
				try {
					localStorage.setItem("cloud_unverified", "1");
				} catch {
					/* localStorage quota / disabled */
				}
			}
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
		const timeout = setTimeout(() => {
			console.warn(`[CloudStorage] removeItem("${key}") timeout`);
			resolve();
		}, 1000);
		webApp.CloudStorage.removeItem(key, (err: any) => {
			clearTimeout(timeout);
			if (err) {
				console.warn(`[CloudStorage] removeItem("${key}") error:`, err);
			}
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
		reputation_title: "Wallet reputation assessment",
		evaluated_ai: "AI Evaluated",
		good_reputation: "Good reputation",
		excellent_reputation: "Excellent reputation",
		average_reputation: "Average reputation",
		low_reputation: "Low reputation (Suspicious)",
		rep_desc_excellent: "The wallet shows high historical activity, large volume of transactions, no risky connections, and is fully trusted.",
		rep_desc_good: "The wallet has been active for more than 6 months. Transactions are mostly positive, no signs of fraud were detected.",
		rep_desc_average: "The wallet has moderate activity or was created recently. Exercise standard caution when transferring.",
		rep_desc_low: "Warning: High risk score. Association with suspicious contracts or reported fraud lists detected.",
		network_fee: "Network Fee",
		transfer_time: "Transfer Time",
		protection_active: "Active",
		protection_title: "WhyNotWallet Protection",
		click_details: "Click to see criteria analysis",
		criteria_activity: "Address Activity",
		criteria_purity: "Transaction Purity",
		criteria_volume: "Liquidity/Volume",
		criteria_age: "Account Age",
		send_amount: "Send {{amount}} {{symbol}}",
		disclaimer: "By clicking \"Send\", you agree to the terms of service and confirm the correctness of data.",
		recipient_title: "Recipient",
		sum_title: "Amount",
		transfer_title: "Transfer",
		biometric_faceid: "Face ID",
		biometric_fingerprint: "Fingerprint",
		enable_biometric: "Enable Biometrics",
		ecosystem: "Ecosystem",
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
		reputation_title: "Оценка репутации кошелька",
		evaluated_ai: "Оценено AI",
		good_reputation: "Хорошая репутация",
		excellent_reputation: "Превосходная репутация",
		average_reputation: "Средняя репутация",
		low_reputation: "Низкая репутация (Подозрительный)",
		rep_desc_excellent: "Кошелек демонстрирует высокую историческую активность, большой объем транзакций, отсутствие рискованных связей и пользуется полным доверием.",
		rep_desc_good: "Кошелек проявляет активность более 6 месяцев. Транзакции в основном положительные, признаки мошенничества не выявлены.",
		rep_desc_average: "Кошелек имеет умеренную активность или был создан недавно. Соблюдайте стандартную осторожность при переводе.",
		rep_desc_low: "Внимание: Высокий уровень риска. Обнаружена связь с подозрительными смарт-контрактами или жалобами пользователей.",
		network_fee: "Комиссия сети",
		transfer_time: "Время перевода",
		protection_active: "Активна",
		protection_title: "Защита WhyNotWallet",
		click_details: "Нажмите для подробного анализа",
		criteria_activity: "Активность адреса",
		criteria_purity: "Чистота транзакций",
		criteria_volume: "Объем/Ликвидность",
		criteria_age: "Возраст кошелька",
		send_amount: "Отправить {{amount}} {{symbol}}",
		disclaimer: "Нажимая «Отправить», вы соглашаетесь с условиями сервиса и подтверждаете корректность данных.",
		recipient_title: "Получатель",
		sum_title: "Сумма",
		transfer_title: "Перевод",
		biometric_faceid: "Face ID",
		biometric_fingerprint: "Отпечаток пальца",
		enable_biometric: "Включить биометрию",
		biometric_setup_title: "Защитите свой кошелек",
		biometric_setup_desc: "Используйте {{type}} для быстрого входа и безопасного подтверждения операций.",
		btn_enable: "ВКЛЮЧИТЬ {{type}}",
		btn_skip: "ПРОПУСТИТЬ",
		ecosystem: "Экосистема",
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
	changes: Record<string, number>;
	setChanges: (c: Record<string, number>) => void;
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
	selectedAsset: any;
	setSelectedAsset: (a: any) => void;
	groqKey: string | null;
	setGroqKey: (k: string | null) => void;
	openrouterKey: string | null;
	setOpenrouterKey: (k: string | null) => void;
	biometricEnabled: boolean;
	setBiometricEnabled: (v: boolean) => void;
	biometricAvailable: boolean;
	biometricType: "faceid" | "fingerprint" | "biometrics" | null;
}

type WalletDataContextType = Omit<WalletContextType, "setView" | "setWallets" | "setBalances" | "setRates" | "setChanges" | "setMnemonic" | "showToast" | "setNetworkMode" | "setLanguage" | "setTempPin" | "setSeedRevealed" | "setSelectedAsset" | "setGroqKey" | "setOpenrouterKey" | "setBiometricEnabled">;
type WalletActionsContextType = Pick<WalletContextType, "setView" | "setWallets" | "setBalances" | "setRates" | "setChanges" | "setMnemonic" | "showToast" | "setNetworkMode" | "setLanguage" | "setTempPin" | "setSeedRevealed" | "setSelectedAsset" | "setGroqKey" | "setOpenrouterKey" | "setBiometricEnabled">;

const WalletDataContext = createContext<WalletDataContextType>({} as WalletDataContextType);
const WalletActionsContext = createContext<WalletActionsContextType>({} as WalletActionsContextType);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
	const [view, setViewState] = useState<ViewState>("loading");
	const [wallets, setWallets] = useState<any>(null);
	const [balances, setBalances] = useState<Record<string, number>>({});
	const [rates, setRates] = useState<Record<string, number>>({});
	const [changes, setChanges] = useState<Record<string, number>>({});
	const [mnemonic, setMnemonic] = useState<string[]>([]);
	const [toast, setToast] = useState<string | null>(null);
	const [networkMode, setNetworkModeState] = useState<NetworkMode>("mainnet");
	const [language, setLanguageState] = useState<Language>("en");
	const [tempPin, setTempPin] = useState<string>("");
	const [seedRevealed, setSeedRevealed] = useState<boolean>(false);
	const [selectedAsset, setSelectedAsset] = useState<any>(null);
	const [groqKey, setGroqKeyState] = useState<string | null>(null);
	const [openrouterKey, setOpenrouterKeyState] = useState<string | null>(null);
	const [biometricEnabled, setBiometricEnabledState] = useState<boolean>(false);
	const [biometricAvailable, setBiometricAvailable] = useState<boolean>(false);
	const [biometricType, setBiometricType] = useState<"faceid" | "fingerprint" | "biometrics" | null>(null);

	useEffect(() => {
		const savedLang = localStorage.getItem("wallet_lang") as Language;
		if (savedLang) setLanguageState(savedLang);
		const savedNet = localStorage.getItem("wallet_net") as NetworkMode;
		if (savedNet) setNetworkModeState(savedNet);
		const savedGroq = localStorage.getItem("whynot_groq_key");
		if (savedGroq) setGroqKeyState(savedGroq);
		const savedOr = localStorage.getItem("whynot_openrouter_key");
		if (savedOr) setOpenrouterKeyState(savedOr);
		const savedBio = localStorage.getItem("wallet_biometric") === "true";
		setBiometricEnabledState(savedBio);

		// Initialize BiometricManager
		if (webApp?.BiometricManager) {
			webApp.BiometricManager.init(() => {
				setBiometricAvailable(webApp.BiometricManager.isInited && webApp.BiometricManager.isBiometricAvailable);
				
				const platform = webApp.platform;
				if (platform === "ios") {
					setBiometricType("faceid");
				} else if (platform === "android") {
					setBiometricType("fingerprint");
				} else {
					setBiometricType("biometrics");
				}
			});
		}
	}, []);

	const setLanguage = useCallback((l: Language) => {
		setLanguageState(l);
		localStorage.setItem("wallet_lang", l);
	}, []);

	const setNetworkMode = useCallback((m: NetworkMode) => {
		setNetworkModeState(m);
		localStorage.setItem("wallet_net", m);
	}, []);

	const setGroqKey = useCallback((k: string | null) => {
		if (k && k.trim()) {
			setGroqKeyState(k.trim());
			localStorage.setItem("whynot_groq_key", k.trim());
		} else {
			setGroqKeyState(null);
			localStorage.removeItem("whynot_groq_key");
		}
	}, []);

	const setOpenrouterKey = useCallback((k: string | null) => {
		if (k && k.trim()) {
			setOpenrouterKeyState(k.trim());
			localStorage.setItem("whynot_openrouter_key", k.trim());
		} else {
			setOpenrouterKeyState(null);
			localStorage.removeItem("whynot_openrouter_key");
		}
	}, []);

	const setBiometricEnabled = useCallback((v: boolean) => {
		setBiometricEnabledState(v);
		localStorage.setItem("wallet_biometric", v ? "true" : "false");
	}, []);

	const showToast = useCallback((msg: string) => {
		setToast(msg);
		setTimeout(() => setToast(null), 3000);
	}, []);

	const t = useCallback(
		(key: string) => {
			return translations[language][key] || key;
		},
		[language]
	);

	const setView = useCallback((v: ViewState) => {
		setViewState(v);
	}, []);

	const dataValue = useMemo<WalletDataContextType>(
		() => ({
			view,
			wallets,
			balances,
			rates,
			changes,
			mnemonic,
			toast,
			networkMode,
			language,
			t,
			tempPin,
			seedRevealed,
			selectedAsset,
			groqKey,
			openrouterKey,
			biometricEnabled,
			biometricAvailable,
			biometricType,
		}),
		[view, wallets, balances, rates, changes, mnemonic, toast, networkMode, language, t, tempPin, seedRevealed, selectedAsset, groqKey, openrouterKey, biometricEnabled, biometricAvailable, biometricType]
	);

	const actionsValue = useMemo<WalletActionsContextType>(
		() => ({
			setView,
			setWallets,
			setBalances,
			setRates,
			setChanges,
			setMnemonic,
			showToast,
			setNetworkMode,
			setLanguage,
			setTempPin,
			setSeedRevealed,
			setSelectedAsset,
			setGroqKey,
			setOpenrouterKey,
			setBiometricEnabled,
		}),
		[setView, setWallets, setBalances, setRates, setChanges, setMnemonic, showToast, setNetworkMode, setLanguage, setTempPin, setSeedRevealed, setSelectedAsset, setGroqKey, setOpenrouterKey, setBiometricEnabled]
	);


	return (
		<WalletActionsContext.Provider value={actionsValue}>
			<WalletDataContext.Provider value={dataValue}>
				{children}
			</WalletDataContext.Provider>
		</WalletActionsContext.Provider>
	);
};

export const useWallet = () => {
	const data = useContext(WalletDataContext);
	const actions = useContext(WalletActionsContext);
	return { ...data, ...actions };
};
