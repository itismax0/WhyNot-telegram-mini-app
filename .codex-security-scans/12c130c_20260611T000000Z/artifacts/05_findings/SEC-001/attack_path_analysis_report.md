# SEC-001 Attack Path Analysis

Attack path:
1. Attacker obtains `wallet_data` from browser storage, Telegram CloudStorage, a profile backup, malicious extension, malware, or any same-origin script issue.
2. Attacker splits the stored base64 blob into salt, IV, and ciphertext/tag.
3. Attacker tries PINs `0000` through `9999` with PBKDF2-SHA256 and AES-GCM.
4. The successful PIN returns the mnemonic.
5. The mnemonic derives TON, EVM, and Solana private keys.

Counterevidence considered: PBKDF2 uses 100,000 iterations and random salt/IV, but the four-digit keyspace keeps the attack bounded to 10,000 attempts and there is no online rate limit.

Severity: high. The attack requires theft of the encrypted blob, but that blob is deliberately synchronized/stored and the resulting impact is full wallet compromise.
