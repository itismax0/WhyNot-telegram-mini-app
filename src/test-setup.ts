import { webcrypto } from "node:crypto";

if (typeof globalThis.crypto?.subtle === "undefined") {
	Object.defineProperty(globalThis, "crypto", {
		value: webcrypto,
		writable: true,
		configurable: true,
	});
}
