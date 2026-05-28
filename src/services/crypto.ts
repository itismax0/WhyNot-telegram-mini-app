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
	return btoa(String.fromCharCode(...combined));
}

export async function decryptData(
	encryptedBase64: string,
	pin: string
): Promise<string> {
	const combined = new Uint8Array(
		atob(encryptedBase64)
			.split("")
			.map((c) => c.charCodeAt(0))
	);
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
