async function getDerivationKey(
	pin: string,
	salt: Uint8Array
): Promise<CryptoKey> {
	const enc = new TextEncoder();
	const keyMaterial = await window.crypto.subtle.importKey(
		"raw",
		enc.encode(pin),
		{ name: "PBKDF2" },
		false,
		["deriveBits", "deriveKey"]
	);
	return window.crypto.subtle.deriveKey(
		{
			name: "PBKDF2",
			salt: salt as unknown as BufferSource,
			iterations: 100000,
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
	const salt = window.crypto.getRandomValues(new Uint8Array(16));
	const iv = window.crypto.getRandomValues(new Uint8Array(12));
	const key = await getDerivationKey(pin, salt);
	const enc = new TextEncoder();
	const encryptedContent = await window.crypto.subtle.encrypt(
		{ name: "AES-GCM", iv: iv as unknown as BufferSource },
		key,
		enc.encode(text)
	);

	const combined = new Uint8Array(
		salt.length + iv.length + encryptedContent.byteLength
	);
	combined.set(salt, 0);
	combined.set(iv, salt.length);
	combined.set(new Uint8Array(encryptedContent), salt.length + iv.length);
	return bytesToBase64(combined);
}

export async function decryptData(
	encryptedBase64: string,
	pin: string
): Promise<string> {
	const combined = base64ToBytes(encryptedBase64);
	const salt = combined.slice(0, 16);
	const iv = combined.slice(16, 28);
	const data = combined.slice(28);

	const key = await getDerivationKey(pin, salt);
	const decryptedContent = await window.crypto.subtle.decrypt(
		{ name: "AES-GCM", iv: iv as unknown as BufferSource },
		key,
		data
	);
	return new TextDecoder().decode(decryptedContent);
}
