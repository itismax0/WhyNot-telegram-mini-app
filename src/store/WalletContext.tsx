import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	useMemo,
	useRef,
} from "react";
import type { WalletSet } from "../services/blockchain";
import { ASSETS, clearWalletSecrets } from "../services/blockchain";

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
	| "browser"
	| "staking"
	| "gifts"
	| "token_detail"
	| "card"
	| "ai";
type NetworkMode = "mainnet" | "testnet" | "devnet";
type Language = "en" | "ru";
type Currency = "usd" | "eur" | "rub";
type WalletMode = "real" | "decoy";

export const getWebApp = () => window.Telegram?.WebApp;

const isCloudSupported = (): boolean => {
	const app = getWebApp();
	return Boolean(
		app &&
			typeof app.isVersionAtLeast === "function" &&
			app.isVersionAtLeast("6.3")
	);
};

export const getCloudItem = (key: string): Promise<string | null> => {
	return new Promise((resolve) => {
		const app = getWebApp();
		if (!isCloudSupported() || !app?.CloudStorage) {
			resolve(localStorage.getItem(key));
			return;
		}
		const timeout = setTimeout(() => {
			if (import.meta.env.DEV) {
				console.warn(`[CloudStorage] getItem("${key}") timeout, falling back to localStorage`);
			} else {
				console.warn("[CloudStorage] getItem timeout");
			}
			resolve(localStorage.getItem(key));
		}, 5000);
		app.CloudStorage.getItem(key, (err: any, value: string) => {
			clearTimeout(timeout);
			if (err) {
				if (import.meta.env.DEV) {
					console.warn(`[CloudStorage] getItem("${key}") error:`, err);
				}
				resolve(localStorage.getItem(key));
			} else {
				resolve(value ?? localStorage.getItem(key));
			}
		});
	});
};

export const setCloudItem = (key: string, value: string): Promise<void> => {
	return new Promise((resolve) => {
		const app = getWebApp();
		localStorage.setItem(key, value);
		if (!isCloudSupported() || !app?.CloudStorage) {
			resolve();
			return;
		}
		const timeout = setTimeout(() => {
			if (import.meta.env.DEV) {
				console.warn(`[CloudStorage] setItem("${key}") timeout`);
			}
			try {
				localStorage.setItem("cloud_unverified", "1");
			} catch {
				/* localStorage quota / disabled */
			}
			resolve();
		}, 5000);
		app.CloudStorage.setItem(key, value, (err: any) => {
			clearTimeout(timeout);
			if (err) {
				if (import.meta.env.DEV) {
					console.warn(`[CloudStorage] setItem("${key}") error:`, err);
				}
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
		const app = getWebApp();
		localStorage.removeItem(key);
		if (!isCloudSupported() || !app?.CloudStorage) {
			resolve();
			return;
		}
		const timeout = setTimeout(() => {
			if (import.meta.env.DEV) {
				console.warn(`[CloudStorage] removeItem("${key}") timeout`);
			}
			resolve();
		}, 5000);
		app.CloudStorage.removeItem(key, (err: any) => {
			clearTimeout(timeout);
			if (err) {
				if (import.meta.env.DEV) {
					console.warn(`[CloudStorage] removeItem("${key}") error:`, err);
				}
			}
			resolve();
		});
	});
};

const WALLET_DATA_KEY = "wallet_data";
const WALLET_DEVICE_SECRET_KEY = "wallet_device_secret";
const STORAGE_TIMEOUT_MS = 5000;

const isSecureStorageSupported = (): boolean => {
	const app = getWebApp();
	return Boolean(
		app?.SecureStorage &&
			typeof app.isVersionAtLeast === "function" &&
			app.isVersionAtLeast("9.0")
	);
};

const getSecureItem = (key: string): Promise<string | null> =>
	new Promise((resolve, reject) => {
		const storage = getWebApp()?.SecureStorage;
		if (!storage) {
			reject(new Error("Telegram SecureStorage is unavailable"));
			return;
		}

		let settled = false;
		const timeout = setTimeout(() => {
			if (!settled) {
				settled = true;
				reject(new Error("Telegram SecureStorage read timed out"));
			}
		}, STORAGE_TIMEOUT_MS);

		storage.getItem(key, (error, value) => {
			if (settled) return;
			settled = true;
			clearTimeout(timeout);
			if (error) {
				reject(new Error(`Telegram SecureStorage read failed: ${String(error)}`));
				return;
			}
			resolve(value ?? null);
		});
	});

const setSecureItem = (key: string, value: string): Promise<void> =>
	new Promise((resolve, reject) => {
		const storage = getWebApp()?.SecureStorage;
		if (!storage) {
			reject(new Error("Telegram SecureStorage is unavailable"));
			return;
		}

		let settled = false;
		const timeout = setTimeout(() => {
			if (!settled) {
				settled = true;
				reject(new Error("Telegram SecureStorage write timed out"));
			}
		}, STORAGE_TIMEOUT_MS);

		storage.setItem(key, value, (error, stored) => {
			if (settled) return;
			settled = true;
			clearTimeout(timeout);
			if (error || stored === false) {
				reject(
					new Error(
						`Telegram SecureStorage write failed: ${String(error ?? "not stored")}`
					)
				);
				return;
			}
			resolve();
		});
	});

const removeSecureItem = (key: string): Promise<void> =>
	new Promise((resolve, reject) => {
		const storage = getWebApp()?.SecureStorage;
		if (!storage) {
			resolve();
			return;
		}

		let settled = false;
		const timeout = setTimeout(() => {
			if (!settled) {
				settled = true;
				reject(new Error("Telegram SecureStorage removal timed out"));
			}
		}, STORAGE_TIMEOUT_MS);

		storage.removeItem(key, (error) => {
			if (settled) return;
			settled = true;
			clearTimeout(timeout);
			if (error) {
				reject(
					new Error(`Telegram SecureStorage removal failed: ${String(error)}`)
				);
				return;
			}
			resolve();
		});
	});

const getCloudItemOnly = (key: string): Promise<string | null> =>
	new Promise((resolve) => {
		const app = getWebApp();
		if (!isCloudSupported() || !app?.CloudStorage) {
			resolve(null);
			return;
		}
		const timeout = setTimeout(() => resolve(null), STORAGE_TIMEOUT_MS);
		app.CloudStorage.getItem(key, (error, value) => {
			clearTimeout(timeout);
			resolve(error ? null : value || null);
		});
	});

const setCloudItemOnly = (key: string, value: string): Promise<void> =>
	new Promise((resolve, reject) => {
		const app = getWebApp();
		if (!isCloudSupported() || !app?.CloudStorage) {
			reject(new Error("Telegram CloudStorage is unavailable"));
			return;
		}
		const timeout = setTimeout(
			() => reject(new Error("Telegram CloudStorage write timed out")),
			STORAGE_TIMEOUT_MS
		);
		app.CloudStorage.setItem(key, value, (error) => {
			clearTimeout(timeout);
			if (error) {
				reject(new Error(`Telegram CloudStorage write failed: ${String(error)}`));
				return;
			}
			resolve();
		});
	});

export const getWalletData = async (): Promise<string | null> => {
	if (isSecureStorageSupported()) {
		const secureValue = await getSecureItem(WALLET_DATA_KEY);
		if (secureValue) return secureValue;
	}

	const cloudValue = await getCloudItemOnly(WALLET_DATA_KEY);
	if (cloudValue) return cloudValue;

	// Read the old browser copy once so existing wallets can migrate safely.
	const legacyValue = localStorage.getItem(WALLET_DATA_KEY);
	if (!legacyValue) return null;
	return legacyValue;
};

export const setWalletData = async (value: string): Promise<void> => {
	if (isSecureStorageSupported()) {
		await setSecureItem(WALLET_DATA_KEY, value);
		await removeCloudItem(WALLET_DATA_KEY);
		localStorage.removeItem(WALLET_DATA_KEY);
		return;
	}

	if (isCloudSupported()) {
		await setCloudItemOnly(WALLET_DATA_KEY, value);
		localStorage.removeItem(WALLET_DATA_KEY);
		return;
	}

	// Development/browser fallback where Telegram storage does not exist.
	localStorage.setItem(WALLET_DATA_KEY, value);
};

export const removeWalletData = async (): Promise<void> => {
	const removals: Promise<void>[] = [removeCloudItem(WALLET_DATA_KEY)];
	if (isSecureStorageSupported()) {
		removals.push(
			removeSecureItem(WALLET_DATA_KEY),
			removeSecureItem(WALLET_DEVICE_SECRET_KEY)
		);
	}
	await Promise.all(removals);
	localStorage.removeItem(WALLET_DATA_KEY);
	localStorage.removeItem("whynot_cards");
	localStorage.removeItem("whynot_card_txs");
};

export const getWalletDeviceSecret = async (
	createIfMissing = false
): Promise<string | null> => {
	if (!isSecureStorageSupported()) return null;

	const existing = await getSecureItem(WALLET_DEVICE_SECRET_KEY);
	if (existing || !createIfMissing) return existing;

	const bytes = window.crypto.getRandomValues(new Uint8Array(32));
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	const secret = btoa(binary);
	bytes.fill(0);
	await setSecureItem(WALLET_DEVICE_SECRET_KEY, secret);
	return secret;
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
		currency: "Currency",
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
		biometric_fingerprint: "Touch ID",
		enable_biometric: "Enable Biometrics",
		biometric_setup_title: "Secure your wallet",
		biometric_setup_desc: "Use {{type}} for quick access and secure transaction confirmation.",
		btn_enable: "ENABLE {{type}}",
		btn_skip: "SKIP",
		ecosystem: "Ecosystem",
		pin_create: "Create PIN",
		pin_repeat: "Repeat PIN",
		pin_confirm_seed: "Enter PIN to View Seed",
		pin_confirm_bio: "Enter PIN to Enable Biometrics",
		pin_enter: "Enter PIN",
		pin_too_simple: "PIN is too simple. Please choose another.",
		enter_pin: "Enter PIN",
		nav_wallet: "Wallet",
		nav_exchange: "Exchange",
		nav_card: "Card",
		nav_settings: "Settings",
		nav_more: "More",
		my_cards: "My cards",
		recent_ops: "Recent operations",
		see_all: "See all",
		virtual: "VIRTUAL",
		card_details: "Details",
		freeze_card: "Freeze",
		unfreeze_card: "Unfreeze",
		limits: "Limits",
		more_actions: "More",
		card_number: "Card Number",
		expiry_date: "Expiry Date",
		cvv: "CVV",
		cardholder: "Cardholder",
		add_card: "Add Card",
		action_irreversible: "This action cannot be undone",
		all_operations: "All operations",
		back: "Back",
		cancel: "Cancel",
		cannot_delete_last_card: "Cannot delete the only card!",
		card_brand_label: "Card Brand",
		card_closed: "Card closed",
		card_created: "Card created successfully!",
		card_design_label: "Design style",
		card_frozen: "Card frozen",
		card_limits_title: "Card Limits",
		card_management: "Card Management",
		card_name_exists: "A card with this name already exists",
		card_name_label: "Card Name",
		card_n: "Card {{n}}",
		card_unfrozen: "Card unfrozen",
		cards_tablist: "Cards",
		change_design: "Change card design",
		choose_design_desc: "Choose color scheme",
		close_card: "Close card",
		close_card_desc: "Irreversibly delete virtual card",
		completed: "Completed",
		confirm_closure: "Confirm closure",
		confirm_delete_card: "Confirm close",
		copied_label: "{{label}} copied!",
		copy_card_number: "Copy card number",
		copy_cvv: "Copy CVV",
		creating: "Creating...",
		design_neon: "Neon Space",
		design_carbon: "Carbon Fiber",
		design_gold: "Imperial Gold",
		design_royal: "Royal Sapphire",
		daily_limit: "Daily Limit",
		daily_limit_max: "Max: $2,000 per day",
		date_time: "Date & time",
		default_card_name: "My Card",
		deposit: "Deposit",
		enter_card_name: "Enter a card name",
		frozen_badge: "FROZEN",
		hide_details: "Hide details",
		just_now: "Just now",
		limits_updated: "Limits updated",
		modal_close: "Close",
		monthly_limit: "Monthly Limit",
		monthly_limit_max: "Max: $10,000 per month",
		new_card_title: "New Virtual Card",
		no_card_ops: "No operations for this card",
		receipt_details: "Receipt details",
		save: "Save",
		select_design: "Select design style",
		show_details: "Show details",
		source_card: "Source Card",
		status: "Status",
		today_at: "Today, {{time}}",
		tx_id: "Transaction ID",
		yes_close: "Yes, close",
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
		currency: "Валюта",
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
		biometric_fingerprint: "Touch ID",
		enable_biometric: "Включить биометрию",
		biometric_setup_title: "Защитите свой кошелек",
		biometric_setup_desc: "Используйте {{type}} для быстрого входа и безопасного подтверждения операций.",
		btn_enable: "ВКЛЮЧИТЬ {{type}}",
		btn_skip: "ПРОПУСТИТЬ",
		ecosystem: "Экосистема",
		pin_create: "Создать PIN",
		pin_repeat: "Повторить PIN",
		pin_confirm_seed: "Введите PIN для просмотра",
		pin_confirm_bio: "Введите PIN для биометрии",
		pin_enter: "Введите PIN",
		pin_too_simple: "Слишком простой PIN. Выберите другой.",
		enter_pin: "Введите PIN",
		nav_wallet: "Кошелек",
		nav_exchange: "Обмен",
		nav_card: "Карта",
		nav_settings: "Настройки",
		nav_more: "Еще",
		my_cards: "Мои карты",
		recent_ops: "Последние операции",
		see_all: "Смотреть все",
		virtual: "VIRTUAL",
		card_details: "Реквизиты",
		freeze_card: "Заморозить",
		unfreeze_card: "Разморозить",
		limits: "Лимиты",
		more_actions: "Еще",
		card_number: "Номер карты",
		expiry_date: "Срок действия",
		cvv: "CVV",
		cardholder: "Владелец карты",
		add_card: "Создать карту",
		action_irreversible: "Это действие нельзя отменить",
		all_operations: "История операций",
		back: "Назад",
		cancel: "Отмена",
		cannot_delete_last_card: "Нельзя удалить единственную карту!",
		card_brand_label: "Платежная система",
		card_closed: "Карта закрыта",
		card_created: "Карта успешно создана!",
		card_design_label: "Стиль карты",
		card_frozen: "Карта временно заморожена",
		card_limits_title: "Лимиты по карте",
		card_management: "Управление картой",
		card_name_exists: "Карта с таким именем уже существует",
		card_name_label: "Название карты",
		card_n: "Карта {{n}}",
		card_unfrozen: "Карта разморожена",
		cards_tablist: "Карты",
		change_design: "Изменить дизайн",
		choose_design_desc: "Выберите стиль оформления",
		close_card: "Закрыть карту",
		close_card_desc: "Безвозвратное закрытие карты",
		completed: "Успешно",
		confirm_closure: "Подтвердите закрытие",
		confirm_delete_card: "Подтвердить закрытие",
		copied_label: "{{label}} скопирован!",
		copy_card_number: "Скопировать номер карты",
		copy_cvv: "Скопировать CVV",
		creating: "Создание...",
		design_neon: "Неон Космос",
		design_carbon: "Карбон",
		design_gold: "Имперское Золото",
		design_royal: "Королевский Сапфир",
		daily_limit: "Дневной лимит",
		daily_limit_max: "Максимум: $2,000 в день",
		date_time: "Дата и время",
		default_card_name: "Моя Карта",
		deposit: "Пополнение",
		enter_card_name: "Введите название карты",
		frozen_badge: "ЗАМОРОЖЕНА",
		hide_details: "Скрыть детали",
		just_now: "Только что",
		limits_updated: "Лимиты обновлены",
		modal_close: "Закрыть",
		monthly_limit: "Месячный лимит",
		monthly_limit_max: "Максимум: $10,000 в месяц",
		new_card_title: "Новая карта",
		no_card_ops: "Нет операций по этой карте",
		receipt_details: "Детали операции",
		save: "Сохранить",
		select_design: "Выберите стиль",
		show_details: "Показать детали",
		source_card: "Карта списания",
		status: "Статус",
		today_at: "Сегодня, {{time}}",
		tx_id: "ID транзакции",
		yes_close: "Да, закрыть",
	},
};

interface WalletDataContextType {
	view: ViewState;
	wallets: WalletSet | null;
	balances: Record<string, number>;
	rates: Record<string, number>;
	changes: Record<string, number>;
	toast: string | null;
	networkMode: NetworkMode;
	language: Language;
	baseCurrency: Currency;
	tempPin: string;
	seedRevealed: boolean;
	selectedAsset: (typeof ASSETS)[number] | null;
	groqKey: string | null;
	openrouterKey: string | null;
	biometricEnabled: boolean;
	biometricAvailable: boolean;
	biometricType: "faceid" | "fingerprint" | "biometrics" | null;
	revealedSeed: string | null;
	walletMode: WalletMode;
	t: (key: string, params?: Record<string, string>) => string;
}

interface WalletActionsContextType {
	setView: (v: ViewState) => void;
	setWallets: (w: WalletSet | null) => void;
	setBalances: (b: Record<string, number>) => void;
	setRates: (r: Record<string, number>) => void;
	setChanges: (c: Record<string, number>) => void;
	showToast: (msg: string) => void;
	setNetworkMode: (m: NetworkMode) => void;
	setLanguage: (l: Language) => void;
	setBaseCurrency: (c: Currency) => void;
	setTempPin: (pin: string) => void;
	setSeedRevealed: (v: boolean) => void;
	setSelectedAsset: (a: (typeof ASSETS)[number] | null) => void;
	setGroqKey: (k: string | null) => void;
	setOpenrouterKey: (k: string | null) => void;
	setBiometricEnabled: (v: boolean) => void;
	setRevealedSeed: (seed: string | null) => void;
	setWalletMode: (mode: WalletMode) => void;
	lockWallet: () => void;
}

const WalletDataContext = createContext<WalletDataContextType | null>(null);
const WalletActionsContext = createContext<WalletActionsContextType | null>(null);

WalletDataContext.displayName = "WalletDataContext";
WalletActionsContext.displayName = "WalletActionsContext";

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
	const [view, setViewState] = useState<ViewState>("loading");
	const [wallets, setWallets] = useState<WalletSet | null>(null);
	const [balances, setBalances] = useState<Record<string, number>>({});
	const [rates, setRates] = useState<Record<string, number>>({});
	const [changes, setChanges] = useState<Record<string, number>>({});
	const [toast, setToast] = useState<string | null>(null);
	const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const [networkMode, setNetworkModeState] = useState<NetworkMode>("mainnet");
	const [language, setLanguageState] = useState<Language>("en");
	const [baseCurrency, setBaseCurrencyState] = useState<Currency>("usd");
	const [tempPinState, setTempPinState] = useState<string>("");
	const setTempPin = useCallback((pin: string) => {
		if (pin !== "" && !/^\d{1,6}$/.test(pin)) {
			if (import.meta.env.DEV) {
				console.warn("[WalletContext] Invalid tempPin format rejected");
			}
			return;
		}
		setTempPinState(pin);
	}, []);
	const [seedRevealedState, setSeedRevealedState] = useState<boolean>(false);
	const setSeedRevealed = useCallback((v: boolean) => {
		setSeedRevealedState(v);
	}, []);
	const [selectedAssetState, setSelectedAssetState] = useState<
		(typeof ASSETS)[number] | null
	>(null);
	const setSelectedAsset = useCallback(
		(a: (typeof ASSETS)[number] | null) => {
			setSelectedAssetState(a);
		},
		[]
	);
	const [groqKey, setGroqKeyState] = useState<string | null>(null);
	const [openrouterKey, setOpenrouterKeyState] = useState<string | null>(
		null
	);
	const [biometricEnabled, setBiometricEnabledState] =
		useState<boolean>(false);
	const [biometricAvailable, setBiometricAvailable] =
		useState<boolean>(false);
	const [biometricType, setBiometricType] = useState<
		"faceid" | "fingerprint" | "biometrics" | null
	>(null);
	const [revealedSeed, setRevealedSeed] = useState<string | null>(null);
	const [walletMode, setWalletModeState] = useState<WalletMode>("real");
	const bioInitializedRef = useRef(false);

	useEffect(() => {
		let mounted = true;

		const VALID_LANGUAGES: Language[] = ["en", "ru"];
		const VALID_NETWORKS: NetworkMode[] = ["mainnet", "testnet", "devnet"];

		const savedLang = localStorage.getItem("wallet_lang");
		if (savedLang && (VALID_LANGUAGES as string[]).includes(savedLang)) {
			setLanguageState(savedLang as Language);
		}

		const savedNet = localStorage.getItem("wallet_net");
		if (savedNet && (VALID_NETWORKS as string[]).includes(savedNet)) {
			setNetworkModeState(savedNet as NetworkMode);
		}

		const savedCurrency = localStorage.getItem(
			"wallet_currency"
		) as Currency;
		if (
			savedCurrency === "usd" ||
			savedCurrency === "eur" ||
			savedCurrency === "rub"
		) {
			setBaseCurrencyState(savedCurrency);
		}

		const savedGroq = sessionStorage.getItem("whynot_groq_key");
		if (savedGroq) setGroqKeyState(savedGroq);

		const savedOr = sessionStorage.getItem("whynot_openrouter_key");
		if (savedOr) setOpenrouterKeyState(savedOr);

		const groqKeySet = localStorage.getItem("whynot_groq_key_set") === "1";
		if (groqKeySet && !savedGroq) {
			localStorage.setItem("whynot_groq_needs_reentry", "1");
		}
		const orKeySet = localStorage.getItem("whynot_openrouter_key_set") === "1";
		if (orKeySet && !savedOr) {
			localStorage.setItem("whynot_openrouter_needs_reentry", "1");
		}

		const savedBio = localStorage.getItem("wallet_biometric") === "true";
		setBiometricEnabledState(savedBio);

		// Initialize BiometricManager
		const app = getWebApp();
		if (app?.BiometricManager && !bioInitializedRef.current) {
			bioInitializedRef.current = true;
			app.BiometricManager.init(() => {
				if (!mounted) return;
				const isAvailable =
					app.BiometricManager.isInited === true &&
					app.BiometricManager.isBiometricAvailable === true;

				setBiometricAvailable(isAvailable);

				if (!isAvailable) {
					setBiometricType(null);
					return;
				}

				const platform = app.platform ?? "";
				if (platform === "ios") {
					setBiometricType("faceid");
				} else if (platform === "android") {
					setBiometricType("fingerprint");
				} else {
					setBiometricType(null);
					setBiometricAvailable(false);
				}
			});
		}

		return () => {
			mounted = false;
			if (toastTimerRef.current) {
				clearTimeout(toastTimerRef.current);
			}
		};
	}, []);

	const setLanguage = useCallback((l: Language) => {
		setLanguageState(l);
		localStorage.setItem("wallet_lang", l);
	}, []);

	const setNetworkMode = useCallback((m: NetworkMode) => {
		setNetworkModeState(m);
		localStorage.setItem("wallet_net", m);
	}, []);

	const setBaseCurrency = useCallback((c: Currency) => {
		setBaseCurrencyState(c);
		localStorage.setItem("wallet_currency", c);
	}, []);

	const setGroqKey = useCallback((k: string | null) => {
		if (k && k.trim()) {
			const trimmed = k.trim();
			setGroqKeyState(trimmed);
			localStorage.setItem("whynot_groq_key_set", "1");
			localStorage.removeItem("whynot_groq_needs_reentry");
			sessionStorage.setItem("whynot_groq_key", trimmed);
		} else {
			setGroqKeyState(null);
			localStorage.removeItem("whynot_groq_key_set");
			localStorage.removeItem("whynot_groq_needs_reentry");
			sessionStorage.removeItem("whynot_groq_key");
		}
	}, []);

	const setOpenrouterKey = useCallback((k: string | null) => {
		if (k && k.trim()) {
			const trimmed = k.trim();
			setOpenrouterKeyState(trimmed);
			localStorage.setItem("whynot_openrouter_key_set", "1");
			localStorage.removeItem("whynot_openrouter_needs_reentry");
			sessionStorage.setItem("whynot_openrouter_key", trimmed);
		} else {
			setOpenrouterKeyState(null);
			localStorage.removeItem("whynot_openrouter_key_set");
			localStorage.removeItem("whynot_openrouter_needs_reentry");
			sessionStorage.removeItem("whynot_openrouter_key");
		}
	}, []);

	const setBiometricEnabled = useCallback((v: boolean) => {
		setBiometricEnabledState(v);
		if (v) {
			localStorage.setItem("wallet_biometric", "true");
		} else {
			localStorage.removeItem("wallet_biometric");
		}
	}, []);

	const showToast = useCallback((msg: string) => {
		if (toastTimerRef.current) {
			clearTimeout(toastTimerRef.current);
			toastTimerRef.current = null;
		}
		setToast(msg);
		toastTimerRef.current = setTimeout(() => {
			setToast(null);
			toastTimerRef.current = null;
		}, 3000);
	}, []);

	const t = useCallback(
		(key: string, params?: Record<string, string>) => {
			const dict = translations[language] ?? translations["en"];
			let text = dict[key] || key;
			if (params) {
				Object.entries(params).forEach(([k, v]) => {
					const placeholder = `{{${k}}}`;
					text = text.split(placeholder).join(v);
				});
			}
			return text;
		},
		[language]
	);

	const setView = useCallback((v: ViewState) => {
		setViewState(v);
		const pinViews: ViewState[] = [
			"pin-create",
			"pin-repeat",
			"pin-enter",
			"pin-confirm-seed",
			"pin-confirm-biometric",
		];
		if (!pinViews.includes(v)) {
			setTempPin("");
		}
	}, []);

	const lockWallet = useCallback(() => {
		setWallets((current) => {
			clearWalletSecrets(current);
			return null;
		});
		setWalletModeState("real");
		setRevealedSeed(null);
		setSeedRevealedState(false);
		setTempPinState("");
		setViewState("pin-enter");
	}, []);

	const dataValue = useMemo<WalletDataContextType>(
		() => ({
			view,
			wallets,
			balances,
			rates,
			changes,
			toast,
			networkMode,
			language,
			baseCurrency,
			t,
			tempPin: tempPinState,
			seedRevealed: seedRevealedState,
			selectedAsset: selectedAssetState,
			groqKey,
			openrouterKey,
			biometricEnabled,
			biometricAvailable,
			biometricType,
			revealedSeed,
			walletMode,
		}),
		[
			view,
			wallets,
			balances,
			rates,
			changes,
			toast,
			networkMode,
			language,
			baseCurrency,
			t,
			tempPinState,
			seedRevealedState,
			selectedAssetState,
			groqKey,
			openrouterKey,
			biometricEnabled,
			biometricAvailable,
			biometricType,
			revealedSeed,
			walletMode,
		]
	);

	const actionsValue = useMemo<WalletActionsContextType>(
		() => ({
			setView,
			setWallets,
			setBalances,
			setRates,
			setChanges,
			showToast,
			setNetworkMode,
			setLanguage,
			setBaseCurrency,
			setTempPin,
			setSeedRevealed,
			setSelectedAsset,
			setGroqKey,
			setOpenrouterKey,
			setBiometricEnabled,
			setRevealedSeed,
			setWalletMode: setWalletModeState,
			lockWallet,
		}),
		[
			setView,
			setWallets,
			setBalances,
			setRates,
			setChanges,
			showToast,
			setNetworkMode,
			setLanguage,
			setBaseCurrency,
			setTempPin,
			setSeedRevealed,
			setSelectedAsset,
			setGroqKey,
			setOpenrouterKey,
			setBiometricEnabled,
			setWalletModeState,
			lockWallet,
		]
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

	if (!data || !actions) {
		throw new Error("useWallet() must be used within <WalletProvider>");
	}

	return { ...data, ...actions };
};
