export interface TelegramCloudStorage {
	getItem(key: string, callback: (error: any, value: string) => void): void;
	setItem(key: string, value: string, callback: (error: any) => void): void;
	removeItem(key: string, callback: (error: any) => void): void;
}

export interface TelegramBiometricManager {
	isInited: boolean;
	isBiometricAvailable: boolean;
	init: (callback: () => void) => void;
	authenticate: (
		reason: string,
		callback: (success: boolean, token?: string) => void
	) => void;
	requestAccess: (
		reason: string,
		callback: (success: boolean, token?: string) => void
	) => void;
	updateBiometricToken: (token: string, callback: (success: boolean) => void) => void;
}

export interface TelegramHapticFeedback {
	selectionChanged(): void;
	impactOccurred(style: "light" | "medium" | "heavy"): void;
	notificationOccurred(type: "error" | "success" | "warning"): void;
}

export interface TelegramWebApp {
	ready(): void;
	expand(): void;
	close(): void;
	setHeaderColor(color: string): void;
	setBackgroundColor(color: string): void;
	isVersionAtLeast(version: string): boolean;
	platform: string;
	initData: string;
	initDataUnsafe: any;
	CloudStorage: TelegramCloudStorage;
	BiometricManager: TelegramBiometricManager;
	HapticFeedback: TelegramHapticFeedback;
	version: string;
	colorScheme: "light" | "dark";
	themeParams: Record<string, string>;
}

declare global {
	interface Window {
		Telegram?: {
			WebApp: TelegramWebApp;
		};
	}
}
