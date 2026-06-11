# Threat Model

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

High-impact failure modes:
- Complete wallet takeover through seed disclosure or weak backup encryption.
- Payment redirection through forged identity or registry tampering.
- Malicious transaction payloads or swap responses causing unintended transfers.
- Same-origin script execution leading to wallet backup or API-key theft.
