import { describe, it, expect } from "vitest";
import { encryptData, decryptData } from "./crypto";

describe("crypto", () => {
	const testData = "test seed phrase with twenty four words goes here for testing";
	const testPin = "1234";

	it("encrypts and decrypts successfully", async () => {
		const encrypted = await encryptData(testData, testPin);
		expect(encrypted).toBeTruthy();
		expect(typeof encrypted).toBe("string");
		const decrypted = await decryptData(encrypted, testPin);
		expect(decrypted).toBe(testData);
	});

	it("fails to decrypt with wrong PIN", async () => {
		const encrypted = await encryptData(testData, testPin);
		await expect(decryptData(encrypted, "0000")).rejects.toThrow();
	});

	it("produces different ciphertext each time", async () => {
		const enc1 = await encryptData(testData, testPin);
		const enc2 = await encryptData(testData, testPin);
		expect(enc1).not.toBe(enc2);
	});

	it("handles empty string", async () => {
		const encrypted = await encryptData("", testPin);
		const decrypted = await decryptData(encrypted, testPin);
		expect(decrypted).toBe("");
	});

	it("handles unicode characters", async () => {
		const unicode = "Hello 世界 Привет 🚀";
		const encrypted = await encryptData(unicode, testPin);
		const decrypted = await decryptData(encrypted, testPin);
		expect(decrypted).toBe(unicode);
	});
});
