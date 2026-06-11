# Attack Path Analysis Summary

`SEC-001` is reportable as high severity because an attacker who obtains the encrypted wallet backup can test all 10,000 PINs offline and recover the mnemonic. The resulting seed derives private keys for every supported chain.

`SEC-002` is reportable as high severity when the Supabase table allows the client upsert path required by the feature. A forged Telegram username can overwrite recipient mappings and redirect transfers.
