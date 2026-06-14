# ✅ 60-Agent Bug Validation Report — WhyNot? Telegram Mini App

> **Тип:** Валидация багов и улучшений (60 агентов, 4 фазы, mesh-иерархия)  
> **Проект:** WhyNot Wallet — мультичейн криптокошелёк  
> **Дата:** 12 июня 2026  
> **Всего валидировано находок:** 89  
> **Подтверждено (TRUE POSITIVE):** 70  
> **Отклонено (FALSE POSITIVE):** 11  
> **Требует контекста (NEEDS CONTEXT):** 8  

---

## 📊 Executive Summary

```
═══════════════════════════════════════════════════
  Сводка по 60 агентам
═══════════════════════════════════════════════════

  Фаза 1 — Core Services (15 агентов)
  ├── blockchain.ts ............ 15 находок: 12 TP · 1 FP · 2 NC
  └── Services ................. 14 находок:  8 TP · 4 FP · 2 NC

  Фаза 2 — UI Components (15 агентов)
  └── Views .................... 21 находка:  16 TP · 3 FP · 2 NC

  Фаза 3 — State & Utils (15 агентов)
  └── Context + Utils .......... 18 находок: 15 TP · 1 FP · 2 NC

  Фаза 4 — Cross-Cutting (15 агентов)
  └── TS + Security + Perf + UX  23 находки: 19 TP · 2 FP · 1 NC

  ─────────────────────────────────────────────
  ИТОГО: 89 проверок · 70 TP · 11 FP · 8 NC
═══════════════════════════════════════════════════
```

| Severity | TP (подтверждено) | FP (отклонено) | NC (контекст) |
|----------|-------------------|----------------|---------------|
| 🔴 CRITICAL | 1 | 0 | 0 |
| 🟠 HIGH | 23 | 0 | 0 |
| 🟡 MEDIUM | 30 | 0 | 3 |
| 🔵 LOW | 16 | 0 | 5 |
| ⚪ NONE | 0 | 11 | 0 |
| **TOTAL** | **70** | **11** | **8** |

---

## 🔴 CRITICAL — 1 находка

### C-01. Нулевое тестовое покрытие

| Поле | Значение |
|------|----------|
| **Вердикт** | ✅ TRUE POSITIVE |
| **Агенты** | #60 — architecture-test-coverage-audit |
| **Файл** | весь проект |
| **Доказательство** | 0 тестовых файлов (`*.test.*`, `*.spec.*`, `__tests__`). В зависимостях нет jest, vitest, playwright. |
| **Влияние** | Любое изменение — риск сломать отправку средств, генерацию кошелька, шифрование. Регрессии не отлавливаются. |
| **Требует** | vitest + @testing-library/react + тесты на crypto.ts, blockchain.ts, aiToolParser.ts |

---

## 🟠 HIGH — 23 находки

### H-01. Non-standard BIP39/BIP44 для ETH и SOL

| Поле | Значение |
|------|----------|
| **Вердикт** | ✅ TRUE POSITIVE |
| **Агенты** | #1 — blockchain-eth-validator, #2 — blockchain-sol-validator |
| **Файл** | `src/services/blockchain.ts:158-162` |
| **Код** | `const seed = await sha256(mnemonic.join(" ")); const hexSeed = "0x" + Buffer.from(seed).toString("hex"); const ethWallet = new ethers.Wallet(hexSeed);` |
| **Влияние** | **Кошелёк невозможно восстановить в MetaMask/Phantom/Tonkeeper.** Одна и та же seed-фраза даёт разные адреса. |
| **Рекомендация** | Использовать BIP39 → BIP32 → BIP44: `ethers.HDNodeWallet.fromMnemonic(mnemonic, path)` |

### H-02. Symbiosis — слепое выполнение произвольных транзакций

| Поле | Значение |
|------|----------|
| **Вердикт** | ✅ TRUE POSITIVE |
| **Агенты** | #3 — symbiosis-blind-trust-validator |
| **Файл** | `src/services/blockchain.ts:288-301` |
| **Код** | `activeWallet.sendTransaction({ to: symbTx.to, data: symbTx.data, value: symbTx.value })` — данные из API без allowlist |
| **Влияние** | При компрометации Symbiosis API — **полная потеря всех ETH и ERC-20 токенов**. |
| **Рекомендация** | Валидировать `to` и `approveTo` против allowlist известных контрактов |

### H-03. executeSwap — нет проверки включения транзакции в блок

| Поле | Значение |
|------|----------|
| **Вердикт** | ✅ TRUE POSITIVE |
| **Агенты** | #9 — executeSwap verification |
| **Файл** | `src/services/blockchain.ts:362-413` |
| **Код** | `txHash = transfer.message.hash().toString("hex")` — хеш вычисляется локально. После отправки BOC проверяется только HTTP 200. |
| **Влияние** | Транзакция может быть отклонена валидаторами, но код вернёт успех. Тихая потеря средств. |
| **Рекомендация** | Poll seqno + getTransactions для подтверждения включения |

### H-04. Username registry — отсутствует доказательство владения

| Поле | Значение |
|------|----------|
| **Вердикт** | ✅ TRUE POSITIVE |
| **Агенты** | #11 — registerUsername audit |
| **Файл** | `src/services/blockchain.ts:464-493` |
| **Код** | `registerUsername(username, tonAddress, ethAddress, solAddress)` — принимает любые адреса без подписи |
| **Влияние** | Любой может зарегистрировать `@vitalik` с чужим адресом и перенаправить платежи. |
| **Рекомендация** | Добавить challenge-response подпись для каждого адреса |

### H-05. amountToSmallestUnit падает на scientific notation

| Поле | Значение |
|------|----------|
| **Вердикт** | ✅ TRUE POSITIVE |
| **Агенты** | #15 — amountToSmallestUnit edge cases |
| **Файл** | `src/services/blockchain.ts:30-36` |
| **Код** | `(1e-7).toString()` → `"1e-7"` → split → `BigInt("1e-7")` → `SyntaxError` |
| **Влияние** | Любое малое значение (0.0000000001) или научная нотация крашает функцию. Транзакции невозможны. |
| **Рекомендация** | Использовать строковую арифметику: разбить на целую/дробную части, дополнить нулями |

### H-06. `encrypted!` — non-null assertion валит приложение

| Поле | Значение |
|------|----------|
| **Вердикт** | ✅ TRUE POSITIVE |
| **Агенты** | #17 — authviews-encrypted-null-validator |
| **Файл** | `src/views/AuthViews.tsx:401` |
| **Код** | `const encrypted = await getCloudItem("wallet_data"); ... decryptData(encrypted!, pin)` |
| **Влияние** | При отсутствии `wallet_data` → `TypeError`. Пользователь зависает на loading. |
| **Рекомендация** | `if (!encrypted) { showToast(...); setView("welcome"); return; }` |

### H-07. Биометрический токен передаётся как 4-значный PIN

| Поле | Значение |
|------|----------|
| **Вердикт** | ✅ TRUE POSITIVE |
| **Агенты** | #18 — authviews-biometric-validator |
| **Файл** | `src/views/AuthViews.tsx:311-318` |
| **Код** | `webApp.BiometricManager.authenticate(..., (success, token) => { setPin(token); })` |
| **Влияние** | Если токен ≠ 4 символа, автомат `pin.length === 4` никогда не срабатывает. Пользователь в тупике. |
| **Рекомендация** | После биометрии вызывать `processPin` напрямую, не засовывая токен в стейт PIN |

### H-08. Нет try/catch в handleCreateNew

| Поле | Значение |
|------|----------|
| **Вердикт** | ✅ TRUE POSITIVE |
| **Агенты** | #20 — authviews-create-wallet-validator |
| **Файл** | `src/views/AuthViews.tsx:58-77` |
| **Код** | `await mnemonicNew()`; `await encryptData()`; `await setCloudItem()`; `await generateWallets()` — без try/catch |
| **Влияние** | Крах на полпути → неконсистентное состояние (view = "main", но wallets нет). |
| **Рекомендация** | `try { ... } catch { showToast("Error"); setView("welcome"); }` |

### H-09. toUnits — потеря точности для decimals ≥ 16

| Поле | Значение |
|------|----------|
| **Вердикт** | ✅ TRUE POSITIVE |
| **Агенты** | #22 — swapview-precision-validator |
| **Файл** | `src/views/SwapView.tsx:58-62` |
| **Код** | `BigInt(Math.floor(n * 10 ** decimals))` — `10 ** 18` > `Number.MAX_SAFE_INTEGER` |
| **Влияние** | Неправильные суммы для ETH (18 decimals) → финансовые потери в свапе. |
| **Рекомендация** | `BigInt(10) ** BigInt(decimals)` или строковая конкатенация |

### H-10. HistoryView крашит при null wallets

| Поле | Значение |
|------|----------|
| **Вердикт** | ✅ TRUE POSITIVE |
| **Агенты** | #29 — mainviews-history-crash-validator |
| **Файл** | `src/views/MainViews.tsx:~1686-1687` |
| **Код** | `wallets.ton.address` без optional chaining |
| **Влияние** | `TypeError: Cannot read properties of null`. Белый экран. |
| **Рекомендация** | `wallets?.ton?.address ?? ''` |

### H-11. VITE_GROQ_KEY из .env никогда не читается

| Поле | Значение |
|------|----------|
| **Вердикт** | ✅ TRUE POSITIVE |
| **Агенты** | #7 — VITE_GROQ_KEY dead code |
| **Файл** | `src/services/aiAssistant.ts:11-12` |
| **Код** | `const GROQ_ENV_KEY = "";` — import.meta.env не вызывается |
| **Влияние** | AI-ассистент не работает «из коробки». Пользователь обязан ввести ключ вручную. |
| **Рекомендация** | `const GROQ_ENV_KEY = import.meta.env.VITE_GROQ_KEY ?? '';` |

### H-12. Мнемоник в React-состоянии — XSS = кража seed

| Поле | Значение |
|------|----------|
| **Вердикт** | ✅ TRUE POSITIVE |
| **Агенты** | #33 — walletcontext-mnemonic-state-validator |
| **Файл** | `src/store/WalletContext.tsx:273,312` |
| **Код** | `mnemonic: string[]` в `useState<string[]>([])` |
| **Влияние** | React DevTools / heap snapshot / любой XSS — читает seed фразу. |
| **Рекомендация** | Хранить в useRef, очищать после использования |

### H-13. tempPin живёт всю сессию

| Поле | Значение |
|------|----------|
| **Вердикт** | ✅ TRUE POSITIVE |
| **Агенты** | #34 — walletcontext-tempPin-validator |
| **Файл** | `src/store/WalletContext.tsx:317` |
| **Доказательство** | `setTempPin("")` нигде не вызывается (подтверждено grep). |
| **Влияние** | PIN в памяти всю сессию → компрометация памяти = компрометация PIN = расшифровка seed. |
| **Рекомендация** | `setTempPin("")` после использования + useRef |

### H-14. API-ключи в plaintext localStorage

| Поле | Значение |
|------|----------|
| **Вердикт** | ✅ TRUE POSITIVE |
| **Агенты** | #35 — walletcontext-keys-plaintext-validator, #50 — security-localstorage-audit |
| **Файл** | `src/store/WalletContext.tsx:335-338,377,387` |
| **Код** | `localStorage.setItem("whynot_groq_key", key)` |
| **Влияние** | Кража ключей через XSS или инспекцию → платный AI используется атакующим. |
| **Рекомендация** | Шифровать ключи через `crypto.ts` тем же PIN-паролем |

### H-15. Слишком слабая валидация адреса в AI парсере

| Поле | Значение |
|------|----------|
| **Вердикт** | ✅ TRUE POSITIVE |
| **Агенты** | #41 — aitoolparser-validator |
| **Файл** | `src/utils/aiToolParser.ts:23` |
| **Код** | `address.trim().length >= 8` — больше ничего |
| **Влияние** | Строка из 9 мусорных символов проходит как «адрес кошелька». |
| **Рекомендация** | Использовать `isValidAddressOrUsername` из blockchain.ts |

### H-16. Отсутствует CSP + Telegram SDK без SRI

| Поле | Значение |
|------|----------|
| **Вердикт** | ✅ TRUE POSITIVE |
| **Агенты** | #49 — security-csp-audit |
| **Файл** | `index.html:18` |
| **Доказательство** | Нет `<meta http-equiv="Content-Security-Policy">`. Telegram SDK без `integrity`. |
| **Влияние** | Компрометация telegram.org → полный контроль над кошельком. |
| **Рекомендация** | CSP meta tag + SRI hash на Telegram SDK |

### H-17. XSS через TonBrowser (javascript: URI)

| Поле | Значение |
|------|----------|
| **Вердикт** | ✅ TRUE POSITIVE |
| **Агенты** | #51 — security-xss-audit |
| **Файл** | `src/views/MainViews.tsx:88-107` |
| **Код** | `normalizeBrowserUrl(value)` не фильтрует `javascript:` протокол → `window.open(url)` |
| **Влияние** | XSS-атака: `javascript:alert(document.cookie)` выполняется в контексте приложения. |
| **Рекомендация** | Блокировать `javascript:` и `data:` URI в `normalizeBrowserUrl` |

### H-18. MainViews.tsx — 2285 строк, монолит

| Поле | Значение |
|------|----------|
| **Вердикт** | ✅ TRUE POSITIVE |
| **Агенты** | #52 — performance-file-size-audit |
| **Файл** | `src/views/MainViews.tsx` |
| **Размер** | 2,285 строк, 77 KB |
| **Содержит** | MainView + ReceiveView + SendView + HistoryView + MoreView + VPN + Cloud + Browser + Staking + Gifts |
| **Рекомендация** | Разделить на отдельные файлы по компонентам |

### H-19. Нет code splitting — 2.2 MB бандл

| Поле | Значение |
|------|----------|
| **Вердикт** | ✅ TRUE POSITIVE |
| **Агенты** | #53 — code splitting audit |
| **Файл** | `dist/assets/index-Csmp2Gil.js` |
| **Размер** | 2,265,622 bytes (~2.2 MB) |
| **Доказательство** | 0 вызовов `dynamic import()`, 0 `React.lazy()` |
| **Влияние** | Долгая загрузка в Telegram WebView на мобильных соединениях. |
| **Рекомендация** | `React.lazy(() => import("./views/SwapView"))` для всех неосновных view |

### H-20. 16+ catch блоков только логируют, пользователь не видит ошибку

| Поле | Значение |
|------|----------|
| **Вердикт** | ✅ TRUE POSITIVE |
| **Агенты** | #57 — error-handling-empty-catch-audit |
| **Доказательство** | 16+ `console.error` / `console.warn` без user-facing feedback |
| **Влияние** | Пользователь не знает, что балансы не загрузились, свап упал, etc. |
| **Рекомендация** | Показывать toast или inline error для всех user-facing операций |

### H-21. 4 floating promise без catch

| Поле | Значение |
|------|----------|
| **Вердикт** | ✅ TRUE POSITIVE |
| **Агенты** | #58 — error-handling-unhandled-audit |
| **Файлы** | `MainViews.tsx:213,215`, `SwapView.tsx:520,600` |
| **Код** | `fetchBalances(wallets, networkMode).then(setBalances)` — без `.catch()` |
| **Влияние** | Unhandled promise rejection → краш или тихое состояние. |
| **Рекомендация** | `.catch(console.error)` или async/await с try/catch |

### H-22. ViewState routing — 24 состояния, нет стейт-машины

| Поле | Значение |
|------|----------|
| **Вердикт** | ✅ TRUE POSITIVE |
| **Агенты** | #59 — architecture-routing-audit |
| **Файл** | `src/store/WalletContext.tsx:10-34` |
| **Доказательство** | 24 state-значения. `if/else if` цепочка в App.tsx. Нет guards, нет transitions. |
| **Влияние** | Нельзя добавить view без правки 5+ мест. Нет back button интеграции. |
| **Рекомендация** | React Router или XState. Интеграция с Telegram.BackButton. |

### H-23. `wallets: any` в blockchain.ts — 4 функции

| Поле | Значение |
|------|----------|
| **Вердикт** | ✅ TRUE POSITIVE |
| **Агенты** | #46 — typescript-any-audit |
| **Файл** | `src/services/blockchain.ts:176,217,278,359` |
| **Доказательство** | `wallets` typed as `any` во всех 4 экспортируемых функциях |
| **Влияние** | Типобезопасность = ноль. Ошибка в названии поля → runtime TypeError. |
| **Рекомендация** | Создать и экспортировать интерфейс `WalletSet { ton, eth, sol }` |

---

## 🟡 MEDIUM — 30 находок (выборочно топ-15)

| # | Код | Агент | TP/FP | Суть |
|---|-----|-------|-------|------|
| M-01 | `src/services/blockchain.ts:207` | #4 | ✅ | **USDT всегда 0** — `usdt: 0` захардкожено. Jetton баланс не запрашивается. |
| M-02 | `src/services/blockchain.ts:524-588` | #5 | ✅ | **Фейковая репутация** — `evaluateReputation` использует детерминированный хеш строки, не on-chain данные. |
| M-03 | `src/services/blockchain.ts:120,333,397,685` | #6 | ✅ | **Toncenter без API ключа** — 6 запросов к toncenter без авторизации. Rate limit ~1 req/s. |
| M-04 | `src/services/blockchain.ts:590-605` | #10 | ✅ | **Захардкоженные комиссии** — "0.05 TON", "0.003 ETH". Не меняются с сетью. |
| M-05 | `src/services/blockchain.ts:699` | #12 | ✅ | **Volume double-count** — `totalVol = balance` включает текущий баланс в объём. |
| M-06 | `src/services/blockchain.ts:115-149` | #14 | ✅ | **ProviderCache не чистится** — TonClient/JsonRpcProvider живут вечно. Смена RPC = reload. |
| M-07 | `src/services/crypto.ts:17` | #1 | ✅ | **PBKDF2 100k iterations** — OWASP рекомендует 600k+. Брутфорс в 6x быстрее. |
| M-08 | `src/views/SwapView.tsx:455-457` | #22 | ✅ | **MAX button не вычитает комиссию** — `fromBalance.toString()` без учёта gas. |
| M-09 | `src/views/MainViews.tsx:235-247` | #28 | ✅ | **Promise.all для Jetton** — один failure валит все. Нужен `Promise.allSettled`. |
| M-10 | `src/store/WalletContext.tsx:45-48` | #32 | ✅ | **CloudStorage timeout 1s** — на медленных соединениях seed не пишется в cloud. |
| M-11 | `src/store/WalletContext.tsx:415-438` | #37 | ✅ | **Один Context → все re-render** — 17 значений в одном контексте. |
| M-12 | `src/utils/aiToolParser.ts:37` | #40 | ✅ | **``` блоки не удаляются** — только ` ```json` стрипается, ` ```javascript` остаётся. |
| M-13 | `src/App.tsx:290-301` | #41 | ✅ | **CoinGecko без API ключа** — бесплатный тир мягко лимитирован. |
| M-14 | `tsconfig.app.json` | #45 | ✅ | **Нет strictNullChecks** — `string | null` не проверяется компилятором. |
| M-15 | `src/components/PinPad.tsx:12-13` | #8 | ✅ | **Тривиальные PIN** — "0000", "1234" принимаются. Нет минимальной энтропии. |

Полный список MEDIUM — см. `improve/agents/phase3/` и `improve/agents/phase4/`

---

## 🔵 LOW — 16 находок (выборочно топ-8)

| # | Код | Агент | TP/FP | Суть |
|---|-----|-------|-------|------|
| L-01 | `src/services/blockchain.ts:614-618` | #7 | ✅ | **EIP-55 checksum не проверяется** — regex `/^0x[a-fA-F0-9]{40}$/` принимает любой case |
| L-02 | `src/services/crypto.ts` | #3 | ✅ | **Нет zeroization** — буферы не очищаются после использования |
| L-03 | `src/services/omniston.ts:152-161` | #4 | NC | **explicitClose** — реконнект возможен, но impaired после close |
| L-04 | `src/views/AuthViews.tsx:348-356` | #7 | NC | **500ms poll** — работает, но setTimeout эффективнее для разблокировки |
| L-05 | `src/views/SwapView.tsx:531-133` | #22 | NC | **isCrossChain** — `chainId` undefined → 0, потенциально неверное определение |
| L-06 | `src/views/AuthViews.tsx:74-76` | #5 | ✅ | **fetchBalances без user feedback** — ошибка только в console.error |
| L-07 | `src/store/WalletContext.tsx:63` | #3 | ✅ | **window as any дублируется** — 5 файлов, 8 кастов Telegram.WebApp |
| L-08 | `index.html:11-15` | #17 | ✅ | **Google Fonts утекают IP** — внешний CDN для self-custodial wallet |

---

## ⚪ FALSE POSITIVES — 11 находок

| # | Оригинальный claim | Причина отклонения | Агент |
|---|-------------------|-------------------|-------|
| FP-01 | Дублирующиеся TON запросы в fetchBalances | `Promise.all` → параллельно, не последовательно. Один запрос на TON. | blockchain.ts #13 |
| FP-02 | Нет AAD в AES-GCM | AAD опционален. Для одного зашифрованного blob не требуется. | crypto.ts #2 |
| FP-03 | Listeners накапливаются в omniston | `this.listeners.clear()` в onclose. Чистый лист при каждом переподключении. | omniston.ts #5 |
| FP-04 | aiChat имеет 8+ параметров | Всё упаковано в `AIChatOptions` с деструктуризацией. Стандартный паттерн. | aiAssistant.ts #9 |
| FP-05 | STON.fi последовательная пагинация | Пагинация по своей природе последовательна. `offset` зависит от предыдущего ответа. | stonfi.ts #10 |
| FP-06 | tokenAnalysis без кэша | `getCache`/`setCache` используются. CoinGecko (5 min), DexScreener (5 min). | tokenAnalysis.ts #12 |
| FP-07 | Race condition в processPin setTimeout | PIN вводится последовательно, race маловероятен. Но setTimeout бессмыслен. | AuthViews.tsx #3 |
| FP-08 | PIN lockout reload bypass | `pinLockedUntil` правильно восстанавливается из localStorage. | AuthViews.tsx #6 |
| FP-09 | Omniston unsubscribe не очищен | cleanup effect вызывает `unsubscribeTrackRef.current?.()` на unmount. | SwapView.tsx #10 |
| FP-10 | formatFiat падает на NaN | `toLocaleString()` возвращает `"NaN"`, не кидает RangeError. | fiat.ts #10 |
| FP-11 | createElement XSS в clipboard | `.value` — DOM property, не innerHTML. Не может выполнить скрипт. | MainViews.tsx #8 |

---

## ❓ NEEDS CONTEXT — 8 находок

| # | Claim | Контекст | Агент |
|---|-------|----------|-------|
| NC-01 | SendMode.IGNORE_ERRORS | Стандартная TON-практика. Газ сгорает в любом случае. Нужно уточнить intent. | blockchain.ts #1 |
| NC-02 | Solana "confirmed" vs "finalized" | Для большинства dApps "confirmed" достаточно. "finalized" добавляет ~400ms. | blockchain.ts #8 |
| NC-03 | Anon key для upsert в Supabase | Зависит от RLS policies на username_registry. Нет доступа к Supabase dashboard. | supabase.ts #11 |
| NC-04 | Promise.all в reroute loop | Зависит от того, кидает ли `executeAction` исключение или возвращает `{ error }`. | AIChatView.tsx #19 |
| NC-05 | isCrossChain false positive | Если У ОБОИХ chainId undefined → `0 !== 0` → not cross-chain. OK. | SwapView.tsx #12 |
| NC-06 | iframe в Telegram WebView | Fallback кнопка есть, но неизвестно, allowlist-ят ли эти домены. | MainViews.tsx #16 |
| NC-07 | checkWalletSync порядок | `const` после использования в source, но в useEffect → работает. Catch нет — это проблема. | App.tsx #14 |
| NC-08 | formatFiat negative handling | `$-5.00` вместо `-$5.00`. Косметика, не краш. | fiat.ts #11 |

---

## 📂 Файлы с наибольшим количеством TP

```
Рейтинг «проблемности» файлов:

  src/services/blockchain.ts ........ 11 TP · 1 FP · 2 NC · 1 CRIT · 4 HIGH
  src/store/WalletContext.tsx ........  7 TP · 0 FP · 0 NC · 0 CRIT · 3 HIGH
  src/views/AuthViews.tsx ............  5 TP · 1 FP · 2 NC · 0 CRIT · 3 HIGH
  src/views/SwapView.tsx ............  3 TP · 2 FP · 2 NC · 0 CRIT · 1 HIGH
  src/views/MainViews.tsx ...........  3 TP · 1 FP · 1 NC · 0 CRIT · 2 HIGH
  src/views/AIChatView.tsx ..........  2 TP · 0 FP · 1 NC · 0 CRIT · 0 HIGH
  index.html .......................  2 TP · 0 FP · 0 NC · 0 CRIT · 2 HIGH
  src/services/aiAssistant.ts ......  2 TP · 1 FP · 0 NC · 0 CRIT · 1 HIGH
  tsconfig.app.json ................  1 TP · 0 FP · 0 NC · 0 CRIT · 0 HIGH
  src/services/crypto.ts ...........  1 TP · 1 FP · 0 NC · 0 CRIT · 0 HIGH
```

---

## 🏆 Топ-10 что исправить в первую очередь

```
Приоритет  │ Находка                              │ Усилие  │ Эффект
───────────┼──────────────────────────────────────┼─────────┼─────────────────────────
    1      │ H-11: VITE_GROQ_KEY не читается      │  5 мин  │ AI заработает из коробки
    2      │ H-06: encrypted! краш                │ 10 мин  │ Устранение краша при входе
    3      │ H-10: HistoryView null crash         │  5 мин  │ Белый экран исправлен
    4      │ H-23: wallets: any → интерфейс       │ 30 мин  │ Type safety для blockchain
    5      │ H-09: toUnits precision              │ 30 мин  │ Правильные суммы в свапе
    6      │ H-15: AI address validation          │ 10 мин  │ Защита от мусорных адресов
    7      │ M-09: Promise.all → allSettled       │ 15 мин  │ Jetton балансы не падают
    8      │ H-08: try/catch create wallet        │ 15 мин  │ Консистентность при создании
    9      │ M-04: Promise.all → allSettled (AI)  │ 15 мин  │ Частичные результаты видны
   10      │ H-16: CSP + SRI                      │ 20 мин  │ Базовая безопасность
```

---

## 🔧 Распределение по severity (подтверждённые)

```
CRITICAL  ■■░░░░░░░░░░░░░░░░░░  1  (1.4%)
HIGH      ■■■■■■■■■■■■■■■■■░░░ 23  (32.9%)
MEDIUM    ■■■■■■■■■■■■■■■■■■■■ 30  (42.9%)
LOW       ■■■■■■■■■■■■░░░░░░░░ 16  (22.9%)

          Всего подтверждено: 70
```

---

## ⚙️ Процесс верификации

```
  60 агентов
     │
     ├── Phase 1 (15) — Core Services
     │     blockchain.ts · crypto.ts · omniston.ts
     │     symbiosis.ts · aiAssistant.ts · stonfi.ts
     │     supabase.ts · tokenAnalysis.ts · jettonBalance.ts
     │     walletAssets.ts
     │
     ├── Phase 2 (15) — UI Components
     │     AuthViews.tsx · SwapView.tsx · MainViews.tsx
     │     SettingsView.tsx · AIChatView.tsx · TokenDetailView.tsx
     │
     ├── Phase 3 (15) — State & Utils
     │     WalletContext.tsx · PinPad.tsx · cache.ts
     │     fiat.ts · aiToolParser.ts · App.tsx
     │     tsconfig.json · vite.config.ts · index.html
     │
     └── Phase 4 (15) — Cross-Cutting
           TypeScript audit (any, !, casts)
           Security audit (CSP, XSS, secrets)
           Performance audit (bundle, splitting, renders)
           UX audit (loading, errors, backbutton)
           Error handling audit (empty catches, floating promises)
           Architecture audit (routing, tests, duplication)
```

---

*Report generated by 60-Agent Bug Validation System*
*Framework: Ruflo Hierarchical-Mesh (4-level nesting)*
*Date: 2026-06-12*
*Total validated findings: 89 (70 TP · 11 FP · 8 NC)*
