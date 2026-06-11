# SEC-001 Validation Report

Rubric:
- [x] Attacker can obtain an encrypted blob without knowing the PIN under realistic client compromise, backup, CloudStorage, or same-origin theft scenarios.
- [x] The blob format contains salt, IV, and ciphertext/tag sufficient for offline verification.
- [x] The PIN keyspace is exactly four digits.
- [x] Successful decryption yields the seed phrase.
- [x] The seed derives private keys for supported chains.

Evidence: `PinPad.tsx:12-13` limits input to four digits. `crypto.ts:6-18` derives the AES-GCM key from that PIN. `crypto.ts:72-81` shows all required decryption inputs are in the stored blob. `AuthViews.tsx:62-63` and `AuthViews.tsx:151-152` encrypt seed phrases. `WalletContext.tsx:68-84` stores the encrypted blob.

Disposition: reportable. Confidence: high. Runtime execution was not needed because the code directly defines the complete offline verifier.
