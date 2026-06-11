# Security Review: WhyNot-telegram-mini-app-main

## Scope

- Scan mode: repository-wide Codex Security scan.
- Target: `C:\Users\Maxim\Desktop\whynot\WhyNot-telegram-mini-app-main`.
- Commit: `12c130c`.
- Artifacts: `.codex-security-scans/12c130c_20260611T000000Z`.
- Validation mode: static source tracing plus bounded attack feasibility analysis. No production Supabase RLS policy or Telegram backend verifier was present in the repository.
- Requested filter: only findings that a realistic attacker can reproduce were included.

### Scan Summary

| Field | Value |
| --- | --- |
| Reportable findings | 2 |
| Severity mix | high: 2 |
| Confidence mix | high: 1, medium-high: 1 |
| Coverage | React/Vite frontend, wallet backup encryption, Telegram identity registration, username resolution, AI/UI rendering, swap/network services |
| Final reports | `report.md`, `report.html` |

## Threat Model

WhyNot Wallet is a self-custodial Telegram Mini App wallet. The primary assets are seed phrases, derived private keys for TON/EVM/Solana wallets, encrypted wallet backups in browser storage and Telegram CloudStorage, recipient-address integrity, and external API keys users may configure for the AI assistant.

Trust boundaries:
- Browser and Telegram Mini App runtime are untrusted client environments.
- Telegram identity data must be treated as untrusted unless validated from signed `initData` server-side.
- Supabase client access uses public browser credentials and must rely on server-side RLS or edge functions for authorization.
- External quote, token, blockchain, and AI APIs return untrusted data.
- User-entered addresses, usernames, seed phrases, PINs, API keys, and swap parameters are attacker-controlled inputs.

Security invariants:
- Theft of an encrypted wallet backup must not be enough to recover the seed with a small offline search.
- Username-to-address bindings must only be written by the real Telegram account owner.
- Recipient resolution must not allow an attacker to substitute their own wallet for a victim username.
- Transaction construction must preserve the user-confirmed recipient, amount, chain, token, and payload.
- Untrusted API or chat content must not execute script in the app origin.

## Findings

| Severity | Confidence | Finding |
| --- | --- | --- |
| high | high | [Offline recovery of wallet seed from 4-digit PIN](#1-offline-recovery-of-wallet-seed-from-4-digit-pin) |
| high | medium-high | [Telegram username registry hijacking via unverified initDataUnsafe](#2-telegram-username-registry-hijacking-via-unverified-initdataunsafe) |

### Confidence Scale

| Label | Meaning |
| --- | --- |
| high | Direct source, configuration, or runtime evidence supports the finding, with no material unresolved reachability or exploitability blocker. |
| medium | Source evidence supports a plausible issue, but runtime behavior, deployment configuration, role reachability, type constraints, or exploit reliability still need proof. |
| low | Weak or incomplete evidence; included only for explicit follow-up candidates. |

### [1] Offline recovery of wallet seed from 4-digit PIN

| Field | Value |
| --- | --- |
| Severity | high |
| Confidence | high |
| Confidence rationale | The repository contains the full encryption and decryption logic, and the four-digit keyspace makes offline verification directly reproducible from a stolen blob. |
| Category | Weak password-based encryption of wallet backup |
| CWE | CWE-521 Weak Password Requirements; CWE-916 Use of Password Hash With Insufficient Computational Effort |
| Affected lines | `src/components/PinPad.tsx:12-13`; `src/services/crypto.ts:6-18`; `src/services/crypto.ts:72-81`; `src/views/AuthViews.tsx:62-63`; `src/views/AuthViews.tsx:151-152`; `src/store/WalletContext.tsx:68-84`; `src/services/blockchain.ts:151-162` |

#### Summary

The seed phrase is encrypted with a four-digit PIN and stored as `wallet_data`. An attacker who obtains that encrypted blob can test all 10,000 possible PINs offline; successful AES-GCM authentication returns the mnemonic. The mnemonic then derives the TON, EVM, and Solana keys used by the app.

#### Validation

The validation traced seed creation/restoration to `encryptData`, then traced the stored blob format to `decryptData`. `PinPad` prevents entering more than four digits, so the effective secret space is fixed at 10,000 values. PBKDF2 with 100,000 iterations slows each guess, but does not make the keyspace large enough for a wallet seed backup.

#### Dataflow

`mnemonicNew` or restored words -> `encryptData(seed, tempPin)` -> `setCloudItem("wallet_data", encrypted)` -> `localStorage` and Telegram CloudStorage -> attacker obtains blob -> brute-force PIN with `decryptData` logic -> mnemonic -> `generateWallets`.

#### Reachability

The attacker needs a copy of `wallet_data`, obtainable from browser profile access, device malware, malicious browser extension, backup leakage, Telegram CloudStorage compromise, or a separate same-origin script issue. No app-side lockout or rate limit applies after the blob is copied.

#### Severity

High: the precondition is theft of the encrypted backup, but the impact is complete wallet compromise. Additional evidence of mass CloudStorage exposure would raise urgency; proof that wallet backups are stored only in a hardware-backed keystore would lower it.

#### Remediation

Do not protect wallet seeds with a four-digit PIN alone. Use a high-entropy backup secret, platform secure storage, WebAuthn/passkey or hardware-backed key material, and a memory-hard KDF such as Argon2id with parameters calibrated for the target devices. If a short PIN remains for UX, use it only to unlock a locally protected key with hardware rate limiting, not as the direct encryption password for the seed.

### [2] Telegram username registry hijacking via unverified initDataUnsafe

| Field | Value |
| --- | --- |
| Severity | high |
| Confidence | medium-high |
| Confidence rationale | The client-side source-to-sink path is direct; exact production exploitability depends on Supabase RLS allowing the browser upsert path required by the feature. |
| Category | Authentication bypass / payment redirection |
| CWE | CWE-345 Insufficient Verification of Data Authenticity; CWE-862 Missing Authorization |
| Affected lines | `src/views/AuthViews.tsx:69-72`; `src/views/AuthViews.tsx:158-161`; `src/views/AuthViews.tsx:364-367`; `src/services/blockchain.ts:464-482`; `src/services/blockchain.ts:489-494`; `src/services/supabase.ts:8-14`; `src/services/supabase.ts:27-35` |

#### Summary

The app trusts `Telegram.WebApp.initDataUnsafe.user.username` and writes that username to a Supabase registry with the current wallet addresses. `initDataUnsafe` is client-controlled unless signed Telegram `initData` is validated by a trusted backend. Because the registry write is performed from the browser with a publishable key and `upsert` on `username`, an attacker can bind a victim username to attacker addresses when the table permits this client write path.

#### Validation

The validation followed all three auth flows that call `registerUsername`, then traced `registerUsername` to `upsertUsername`. The code does not verify Telegram signatures before writing. The remaining uncertainty is the exact deployed Supabase RLS policy, which is not in the repository; however, the feature as implemented requires a browser-accessible write path or equivalent server policy.

#### Dataflow

Forged `window.Telegram.WebApp.initDataUnsafe.user.username` -> `AuthViews` auth flow -> `registerUsername(username, generated addresses)` -> `upsertUsername` -> `username_registry` row overwritten -> `resolveUsername("@victim")` returns attacker addresses -> sender transfer goes to attacker.

#### Reachability

An attacker can run the app outside Telegram or inject the Telegram object before the auth flow, and can also attempt direct Supabase REST writes with the public publishable key. A sender only needs to use `@username` recipient resolution for the redirected address to matter.

#### Severity

High when the deployed table permits the upsert: the attacker can redirect payments intended for a victim username without compromising either user's wallet keys. A checked-in RLS policy requiring a server-verified Telegram user id would lower severity or suppress the finding.

#### Remediation

Move username registration to a trusted backend or Supabase Edge Function. Verify Telegram signed `initData` with the bot token server-side, bind rows to immutable Telegram user ids, reject client-supplied username ownership, and prevent overwriting an existing username unless the same verified user id owns it. Add tests for forged `initDataUnsafe` and direct anonymous upsert attempts.

## Reviewed Surfaces

| Surface | Risk Area | Outcome | Notes |
| --- | --- | --- | --- |
| Wallet backup encryption | Seed disclosure | Reported | Four-digit PIN protects encrypted seed backups stored in localStorage/CloudStorage. |
| Telegram username registry | Payment redirection | Reported | Client trusts `initDataUnsafe` and upserts username mappings. |
| UI rendering and AI chat | XSS | No issue found | No unsafe HTML rendering found in reviewed UI. |
| AI actions | Privileged action abuse | No issue found | Parser exposes wallet reputation lookup only. |
| Swap/network services | Malicious quote or transaction data | No issue found | No concrete independently reproducible exploit path survived review. |
| `.env` Groq key | Secret exposure | Rejected | Secret exists in worktree, but is not read by current client source or present in built bundle. Rotate it anyway if it is real. |

## Open Questions And Follow Up

- Verify deployed Supabase RLS for `username_registry`; if anon upsert is denied and a trusted backend performs verified writes, update `SEC-002` accordingly.
- Rotate the Groq key present in `.env` if it is valid, even though current client code and `dist` did not expose it.
