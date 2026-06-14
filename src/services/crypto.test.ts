import { describe, expect, it } from "vitest";
import {
	decryptData,
	decryptWalletData,
	encryptData,
	encryptWalletData,
	isLegacyWalletData,
} from "./crypto";

function bytesToBase64(bytes: Uint8Array): string {
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary);
}

async function encryptLegacy(text: string, pin: string): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const material = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(pin),
		"PBKDF2",
		false,
		["deriveKey"]
	);
	const key = await crypto.subtle.deriveKey(
		{
			name: "PBKDF2",
			hash: "SHA-256",
			iterations: 100_000,
			salt,
		},
		material,
		{ name: "AES-GCM", length: 256 },
		false,
		["encrypt"]
	);
	const ciphertext = new Uint8Array(
		await crypto.subtle.encrypt(
			{ name: "AES-GCM", iv },
			key,
			new TextEncoder().encode(text)
		)
	);
	const combined = new Uint8Array(28 + ciphertext.length);
	combined.set(salt, 0);
	combined.set(iv, 16);
	combined.set(ciphertext, 28);
	return bytesToBase64(combined);
}

describe("crypto", () => {
	const testData =
		"test seed phrase with twenty four words goes here for testing";
	const testPin = "1234";

	it("encrypts and decrypts successfully", async () => {
		const encrypted = await encryptData(testData, testPin);
		await expect(decryptData(encrypted, testPin)).resolves.toBe(testData);
	});

	it("fails to decrypt with wrong PIN", async () => {
		const encrypted = await encryptData(testData, testPin);
		await expect(decryptData(encrypted, "0000")).rejects.toThrow();
	});

	it("produces different ciphertext each time", async () => {
		const first = await encryptData(testData, testPin);
		const second = await encryptData(testData, testPin);
		expect(first).not.toBe(second);
	});

	it("keeps legacy wallets readable with their existing PIN", async () => {
		const legacy = await encryptLegacy(testData, testPin);
		expect(isLegacyWalletData(legacy)).toBe(true);
		await expect(
			decryptWalletData(legacy, testPin, null)
		).resolves.toBe(testData);
	});

	it("binds the current format to the device secret", async () => {
		const encrypted = await encryptWalletData(
			testData,
			testPin,
			"device-secret-a"
		);
		expect(isLegacyWalletData(encrypted)).toBe(false);
		await expect(
			decryptWalletData(encrypted, testPin, null)
		).rejects.toThrow("device secret");
		await expect(
			decryptWalletData(encrypted, testPin, "device-secret-b")
		).rejects.toThrow();
		await expect(
			decryptWalletData(encrypted, testPin, "device-secret-a")
		).resolves.toBe(testData);
	});
});
