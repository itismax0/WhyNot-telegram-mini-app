# Finding Discovery Report

Scope: repository-wide scan of `C:\Users\Maxim\Desktop\whynot\WhyNot-telegram-mini-app-main`.

## Candidates

### SEC-001 Offline recovery of wallet seed from 4-digit PIN

Affected locations:
- `src/components/PinPad.tsx:12-13` limits PIN entry to four digits.
- `src/services/crypto.ts:6-18` derives an AES-GCM key from the PIN with PBKDF2-SHA256 and 100,000 iterations.
- `src/views/AuthViews.tsx:62-63` and `src/views/AuthViews.tsx:151-152` encrypt generated/restored seed phrases using that PIN.
- `src/store/WalletContext.tsx:68-84` stores the encrypted blob in localStorage and Telegram CloudStorage.

Attacker-controlled source: stolen `wallet_data` encrypted backup plus offline PIN guesses.

Broken control: a four-digit PIN is the only secret protecting the seed backup; no online rate limit applies to offline decryption.

Impact: full recovery of the mnemonic and derived TON/EVM/Solana private keys.

### SEC-002 Telegram username registry hijacking via unverified initDataUnsafe and client upsert

Affected locations:
- `src/views/AuthViews.tsx:69-72`, `src/views/AuthViews.tsx:158-161`, and `src/views/AuthViews.tsx:364-367` trust `Telegram.WebApp.initDataUnsafe.user.username`.
- `src/services/blockchain.ts:464-482` writes username mappings for supplied wallet addresses.
- `src/services/supabase.ts:8-14` initializes Supabase from client-exposed environment variables.
- `src/services/supabase.ts:27-35` performs `upsert` on `username_registry` with `onConflict: "username"`.

Attacker-controlled source: forged Mini App runtime object or direct Supabase client request with the public key.

Broken control: no server-side Telegram `initData` signature validation or ownership binding before overwriting a username mapping.

Impact: transfers to `@victim` can resolve to attacker-controlled addresses.

## Reviewed Files

`src/App.tsx`, `src/components/PinPad.tsx`, `src/views/AuthViews.tsx`, `src/views/MainViews.tsx`, `src/views/SettingsView.tsx`, `src/views/AIChatView.tsx`, `src/views/SwapView.tsx`, `src/views/TokenPickerModal.tsx`, `src/store/WalletContext.tsx`, `src/services/crypto.ts`, `src/services/blockchain.ts`, `src/services/supabase.ts`, `src/services/aiAssistant.ts`, `src/services/aiActions.ts`, `src/services/stonfi.ts`, `src/services/omniston.ts`, `src/services/symbiosis.ts`, `src/services/jettonBalance.ts`, `src/services/tokenAnalysis.ts`, `src/utils/aiToolParser.ts`, `src/utils/cache.ts`, `index.html`, `package.json`, `vite.config.ts`, `.env`, `.env.example`.
