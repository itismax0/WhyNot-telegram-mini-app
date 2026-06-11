# SEC-002 Attack Path Analysis

Attack path:
1. Attacker runs the client with forged `window.Telegram.WebApp.initDataUnsafe.user.username` or calls Supabase directly with the public key.
2. Attacker creates/restores their own wallet.
3. The app registers the victim username to attacker TON/EVM/Solana addresses.
4. A sender types `@victim` and the app resolves that registry record.
5. Funds are sent to the attacker's address.

Counterevidence considered: secure Supabase RLS or a server-side edge function could defeat direct writes, but no such server-side ownership check is present in the repository. The client feature as written requires anonymous/public client writes unless policies outside the repo add constraints.

Severity: high when the upsert policy is enabled, because the issue can redirect user payments without compromising the sender's wallet.
