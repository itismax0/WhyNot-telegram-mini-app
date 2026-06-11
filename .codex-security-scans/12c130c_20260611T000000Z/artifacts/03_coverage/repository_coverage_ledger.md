# Repository Coverage Ledger

| Row | Surface | Risk Area | Disposition | Evidence |
| --- | --- | --- | --- | --- |
| COV-001 | Wallet backup encryption | Seed disclosure / offline brute force | reportable | SEC-001 |
| COV-002 | Telegram username registry | Identity spoofing / payment redirection | reportable | SEC-002 |
| COV-003 | React UI rendering and chat display | XSS | suppressed | No `dangerouslySetInnerHTML`; React text rendering escapes attacker content in reviewed views. |
| COV-004 | AI action parser | Tool/action abuse | suppressed | Only `evaluate_wallet` action parsed; no transfer or secret-reading action sink found. |
| COV-005 | Swap and quote services | Malicious external API transaction construction | no issue found | Review did not identify a reproducible attacker-controlled route beyond intended external quote trust; no final finding emitted. |
| COV-006 | Hardcoded `.env` key | Secret handling | rejected as app runtime finding | `.env` contains a Groq key, but current source sets default env constants to empty strings and built `dist` did not contain the key. This remains a secret hygiene issue, not a reproduced client runtime vulnerability. |
