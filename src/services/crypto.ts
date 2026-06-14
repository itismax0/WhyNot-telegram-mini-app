const LEGACY_ITERATIONS = 100_000;
const CURRENT_ITERATIONS = 600_000;

interface EncryptedWalletV2 {
	v: 2;
	alg: "AES-GCM-256";
	kdf: "PBKDF2-SHA256";
	iterations: number;
	deviceBound: boolean;
	salt: string;
	iv: string;
	data: string;
}

async function getDerivationKey(
	pin: string,
	salt: Uint8Array,
	iterations: number,
	deviceSecret?: string | null
): Promise<CryptoKey> {
	const enc = new TextEncoder();
	const keyInput = deviceSecret ? `${pin}:${deviceSecret}` : pin;
	const keyMaterial = await window.crypto.subtle.importKey(
		"raw",
		enc.encode(keyInput),
		{ name: "PBKDF2" },
		false,
		["deriveBits", "deriveKey"]
	);
	return window.crypto.subtle.deriveKey(
		{
			name: "PBKDF2",
			salt: salt as unknown as BufferSource,
			iterations,
			hash: "SHA-256",
		},
		keyMaterial,
		{ name: "AES-GCM", length: 256 },
		false,
		["encrypt", "decrypt"]
	);
}

function bytesToBase64(bytes: Uint8Array): string {
	let binary = "";
	const chunk = 0x8000;
	for (let i = 0; i < bytes.length; i += chunk) {
		binary += String.fromCharCode.apply(
			null,
			Array.from(bytes.subarray(i, i + chunk))
		);
	}
	return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
	const binary = atob(b64);
	const out = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		out[i] = binary.charCodeAt(i);
	}
	return out;
}

export async function encryptData(text: string, pin: string): Promise<string> {
	return encryptWalletData(text, pin, null);
}

export async function encryptWalletData(
	text: string,
	pin: string,
	deviceSecret: string | null
): Promise<string> {
	const salt = window.crypto.getRandomValues(new Uint8Array(16));
	const iv = window.crypto.getRandomValues(new Uint8Array(12));
	const key = await getDerivationKey(
		pin,
		salt,
		CURRENT_ITERATIONS,
		deviceSecret
	);
	const enc = new TextEncoder();
	const encryptedContent = await window.crypto.subtle.encrypt(
		{ name: "AES-GCM", iv: iv as unknown as BufferSource },
		key,
		enc.encode(text)
	);

	const result: EncryptedWalletV2 = {
		v: 2,
		alg: "AES-GCM-256",
		kdf: "PBKDF2-SHA256",
		iterations: CURRENT_ITERATIONS,
		deviceBound: Boolean(deviceSecret),
		salt: bytesToBase64(salt),
		iv: bytesToBase64(iv),
		data: bytesToBase64(new Uint8Array(encryptedContent)),
	};
	salt.fill(0);
	iv.fill(0);
	return JSON.stringify(result);
}

export async function decryptData(
	encryptedBase64: string,
	pin: string
): Promise<string> {
	return decryptWalletData(encryptedBase64, pin, null);
}

export function isLegacyWalletData(encrypted: string): boolean {
	return !encrypted.trimStart().startsWith("{");
}

export async function decryptWalletData(
	encrypted: string,
	pin: string,
	deviceSecret: string | null
): Promise<string> {
	if (!isLegacyWalletData(encrypted)) {
		const payload = JSON.parse(encrypted) as Partial<EncryptedWalletV2>;
		if (
			payload.v !== 2 ||
			payload.alg !== "AES-GCM-256" ||
			payload.kdf !== "PBKDF2-SHA256" ||
			typeof payload.iterations !== "number" ||
			payload.iterations < CURRENT_ITERATIONS ||
			typeof payload.salt !== "string" ||
			typeof payload.iv !== "string" ||
			typeof payload.data !== "string"
		) {
			throw new Error("Unsupported encrypted wallet format");
		}
		if (payload.deviceBound && !deviceSecret) {
			throw new Error("Wallet device secret is unavailable");
		}

		const salt = base64ToBytes(payload.salt);
		const iv = base64ToBytes(payload.iv);
		const data = base64ToBytes(payload.data);
		try {
			const key = await getDerivationKey(
				pin,
				salt,
				payload.iterations,
				payload.deviceBound ? deviceSecret : null
			);
			const decryptedContent = await window.crypto.subtle.decrypt(
				{ name: "AES-GCM", iv: iv as unknown as BufferSource },
				key,
				data
			);
			return new TextDecoder().decode(decryptedContent);
		} finally {
			salt.fill(0);
			iv.fill(0);
			data.fill(0);
		}
	}

	const encryptedBase64 = encrypted;
	const combined = base64ToBytes(encryptedBase64);
	const salt = combined.slice(0, 16);
	const iv = combined.slice(16, 28);
	const data = combined.slice(28);

	try {
		const key = await getDerivationKey(
			pin,
			salt,
			LEGACY_ITERATIONS,
			null
		);
		const decryptedContent = await window.crypto.subtle.decrypt(
			{ name: "AES-GCM", iv: iv as unknown as BufferSource },
			key,
			data
		);
		return new TextDecoder().decode(decryptedContent);
	} finally {
		combined.fill(0);
		salt.fill(0);
		iv.fill(0);
		data.fill(0);
	}
}
