# Reviewed Surfaces

| Surface | Risk Area | Outcome | Notes |
| --- | --- | --- | --- |
| Wallet backup encryption | Seed disclosure | Reported | Four-digit PIN protects encrypted seed backups stored in localStorage/CloudStorage. |
| Telegram username registry | Payment redirection | Reported | Client trusts `initDataUnsafe` and upserts username mappings. |
| UI rendering and AI chat | XSS | No issue found | No unsafe HTML rendering found in reviewed UI. |
| AI actions | Privileged action abuse | No issue found | Parser exposes wallet reputation lookup only. |
| Swap/network services | Malicious quote or transaction data | No issue found | No concrete independently reproducible exploit path survived review. |
| `.env` Groq key | Secret exposure | Rejected | Secret exists in worktree, but is not read by current client source or present in built bundle. |
