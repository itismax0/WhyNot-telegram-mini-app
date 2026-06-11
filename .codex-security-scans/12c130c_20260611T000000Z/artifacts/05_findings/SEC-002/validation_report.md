# SEC-002 Validation Report

Rubric:
- [x] Client code reads a Telegram username from an untrusted client object.
- [x] The username flows into registry writes.
- [x] Registry writes can overwrite an existing username key.
- [x] Send flow resolves usernames from the registry.
- [ ] Exact production Supabase RLS policy was not present in the repository.

Evidence: `AuthViews.tsx:69-72`, `AuthViews.tsx:158-161`, and `AuthViews.tsx:364-367` trust `initDataUnsafe.user.username`. `blockchain.ts:464-482` forwards the username and wallet addresses to `upsertUsername`. `supabase.ts:27-35` performs `upsert` with `onConflict: "username"`. `blockchain.ts:489-494` begins username resolution from the same registry path.

Disposition: reportable with a deployment precondition that `username_registry` permits the browser upsert path needed by the feature. Confidence: medium-high.
