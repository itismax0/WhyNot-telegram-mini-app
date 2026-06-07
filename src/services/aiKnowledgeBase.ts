export interface AIKnowledgeView {
	id: string;
	title: string;
	trigger: string;
	purpose: string;
	actions: string[];
}

export interface AIKnowledgeAsset {
	id: string;
	symbol: string;
	name: string;
	network: string;
	decimals: number;
	chainId: number;
	symbiosisAddress: string;
	isNative: boolean;
}

export interface AIKnowledgeRoute {
	from: string;
	to: string;
	engine: "omniston" | "symbiosis" | "native_send";
	notes: string;
}

const VIEWS: AIKnowledgeView[] = [
	{
		id: "welcome",
		title: "Welcome screen",
		trigger: "First launch, no wallet in cloud",
		purpose: "Create a new wallet",
		actions: ["CREATE WALLET → goes to pin-create"],
	},
	{
		id: "pin-create",
		title: "PIN setup",
		trigger: "After CREATE WALLET",
		purpose: "Set 4-digit PIN (encrypts seed)",
		actions: ["Enter 4 digits", "Auto-advance to pin-repeat"],
	},
	{
		id: "pin-repeat",
		title: "PIN confirmation",
		trigger: "After pin-create",
		purpose: "Confirm PIN",
		actions: ["Re-enter PIN", "On match → restore-prompt (set up backup seed)"],
	},
	{
		id: "restore-prompt",
		title: "Backup prompt",
		trigger: "After PIN confirmed",
		purpose: "Show 24-word seed once for backup",
		actions: ["RESTORE WITH SEED → restore-input", "CREATE NEW WALLET → main"],
	},
	{
		id: "restore-input",
		title: "Seed input",
		trigger: "RESTORE WITH SEED",
		purpose: "Restore from 24-word phrase",
		actions: ["Paste/type 24 words", "On valid → main"],
	},
	{
		id: "pin-enter",
		title: "PIN unlock",
		trigger: "App reopen with existing wallet",
		purpose: "Decrypt seed and enter app",
		actions: ["Enter 4 digits", "On match → main"],
	},
	{
		id: "pin-confirm-seed",
		title: "PIN to reveal seed",
		trigger: "Settings → View Seed",
		purpose: "Confirm PIN to show 24-word seed",
		actions: ["Enter PIN → reveal seed in Settings"],
	},
	{
		id: "main",
		title: "Home (Wallet tab)",
		trigger: "Default screen",
		purpose: "Portfolio overview",
		actions: [
			"Total balance with hide eye toggle",
			"3 round buttons: Receive | Send | History",
			"Asset list (click → token_detail)",
			"AI assistant banner (click → ai)",
			"Settings gear → settings",
		],
	},
	{
		id: "receive",
		title: "Receive",
		trigger: "Main → Receive",
		purpose: "Get deposit address + QR",
		actions: [
			"Combobox: pick asset (TON, ETH, SOL, USDT, BTC)",
			"QR code",
			"COPY ADDRESS button",
		],
	},
	{
		id: "send",
		title: "Send",
		trigger: "Main → Send",
		purpose: "Transfer tokens with recipient reputation check",
		actions: [
			"Recipient input (@username or address)",
			"Amount input with asset selector",
			"Reputation card auto-loads (1-10 score)",
			"Network fee + transfer time",
			"Confirm → success screen",
		],
	},
	{
		id: "swap",
		title: "Exchange",
		trigger: "Bottom nav → Exchange",
		purpose: "Swap tokens (TON↔jetton via Omniston, cross-chain via Symbiosis)",
		actions: [
			"From/To token pickers (with main, popular, custom jetton address)",
			"Amount input + MAX button",
			"Auto quote with rate and 24h change",
			"SWAP → confirm → track → success/refund",
		],
	},
	{
		id: "history",
		title: "Transaction history (TON only)",
		trigger: "Main → History",
		purpose: "Last 10 transactions from toncenter",
		actions: ["List of tx with icon, type, amount, date"],
	},
	{
		id: "settings",
		title: "Settings",
		trigger: "Main → gear icon, or bottom nav → Settings",
		purpose: "Network, language, Groq key, view seed, wipe",
		actions: [
			"Network select (mainnet/testnet/devnet)",
			"Language toggle EN/RU",
			"Groq API key (for AI assistant)",
			"View Seed (PIN-protected)",
			"Wipe Wallet (deletes all data)",
		],
	},
	{
		id: "more",
		title: "More",
		trigger: "Bottom nav → More",
		purpose: "Quick links grid",
		actions: ["Receive, History, Assets, Settings tiles"],
	},
	{
		id: "token_detail",
		title: "Token detail",
		trigger: "Click any asset in Main",
		purpose: "Chart, news, holders, AI score per asset",
		actions: [
			"5 tabs: Overview, News, Analytics, Holders, About",
			"Binance klines chart",
			"CoinGecko market data",
			"rss2json + Cointelegraph news",
			"Top holders (Solana only via getLargestAccounts)",
			"Hardcoded AI score (ton 8.6, eth 9.1, sol 8.3, usdt 7.2, btc 9.4)",
		],
	},
	{
		id: "ai",
		title: "AI assistant",
		trigger: "AI banner on main, or from token_detail (future)",
		purpose: "Chat with LLM (Groq)",
		actions: [
			"4 quick suggestions",
			"Input + send",
			"Local history (50 turns)",
			"Can request evaluate_wallet and analyze_token actions",
		],
	},
];

const ASSETS: AIKnowledgeAsset[] = [
	{
		id: "ton",
		symbol: "TON",
		name: "Toncoin",
		network: "TON",
		decimals: 9,
		chainId: 85918,
		symbiosisAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
		isNative: true,
	},
	{
		id: "usdt",
		symbol: "USDT",
		name: "Tether USD",
		network: "TON (jetton)",
		decimals: 6,
		chainId: 85918,
		symbiosisAddress: "0x9328Eb759596C38a25f59028B146Fecdc3621Dfe",
		isNative: false,
	},
	{
		id: "eth",
		symbol: "ETH",
		name: "Ethereum",
		network: "Ethereum (EVM)",
		decimals: 18,
		chainId: 1,
		symbiosisAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
		isNative: true,
	},
	{
		id: "sol",
		symbol: "SOL",
		name: "Solana",
		network: "Solana",
		decimals: 9,
		chainId: 5426,
		symbiosisAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
		isNative: true,
	},
	{
		id: "btc",
		symbol: "BTC",
		name: "Bitcoin",
		network: "Bitcoin",
		decimals: 8,
		chainId: 3652501241,
		symbiosisAddress: "0x1dfc1e32d75b3f4cb2f2b1bcecad984e99eeba05",
		isNative: true,
	},
];

const CHAINS = [
	{ name: "TON", chainId: 85918, omniston: 607, symbiosis: 85918, type: "L1" },
	{ name: "Ethereum", chainId: 1, symbiosis: 1, type: "L1 EVM" },
	{ name: "BSC", chainId: 56, symbiosis: 56, type: "L1 EVM" },
	{ name: "Polygon", chainId: 137, symbiosis: 137, type: "L2 EVM" },
	{ name: "Arbitrum", chainId: 42161, symbiosis: 42161, type: "L2 EVM" },
	{ name: "Optimism", chainId: 10, symbiosis: 10, type: "L2 EVM" },
	{ name: "Base", chainId: 8453, symbiosis: 8453, type: "L2 EVM" },
	{ name: "Solana", chainId: 5426, symbiosis: 5426, type: "L1" },
	{ name: "Bitcoin", chainId: 3652501241, symbiosis: 3652501241, type: "L1", readOnly: true },
];

const ROUTES: AIKnowledgeRoute[] = [
	{
		from: "TON ↔ Jetton (STON.fi listed)",
		to: "TON ↔ Jetton",
		engine: "omniston",
		notes: "Both on TON chain_id=607. Lowest fees.",
	},
	{
		from: "Cross-chain (TON ↔ EVM ↔ SOL ↔ BTC)",
		to: "Cross-chain",
		engine: "symbiosis",
		notes: "Symbiosis v1 API for EVM↔EVM, v2 for BTC pairs. PartnerId whynot-mini-app.",
	},
	{
		from: "Any → any",
		to: "Native send (same chain)",
		engine: "native_send",
		notes: "TON V4 transfer, ETH legacy, SOL SystemProgram.transfer. BTC is read-only (no signer).",
	},
];

const REPUTATION_CRITERIA = [
	{
		key: "activity",
		weight: 0.25,
		description: "Number of on-chain transactions. 1000+ → 10, 0 → 1.",
	},
	{
		key: "volume",
		weight: 0.25,
		description: "Total transferred value in native units. 10000+ → 10, 0 → 1.",
	},
	{
		key: "age",
		weight: 0.25,
		description: "Wallet age in months. 36+ → 10, 0 → 1.",
	},
	{
		key: "purity",
		weight: 0.25,
		description: "Active + usage-based. Inactive wallets get 1.",
	},
];

const SOURCES = [
	{ name: "CoinGecko", purpose: "Token search, market data, prices", auth: "none (rate-limited)" },
	{ name: "Binance public API", purpose: "Klines (candlesticks), 24h ticker", auth: "none" },
	{ name: "STON.fi", purpose: "Jetton list, prices, swap quotes (v1beta7 TON-only)", auth: "none" },
	{ name: "Omniston WS", purpose: "TON↔jetton quote + tracking", auth: "none", endpoint: "wss://omni-ws.ston.fi" },
	{ name: "Symbiosis REST", purpose: "Cross-chain quotes + status polling", auth: "partnerId", endpoint: "https://api.symbiosis.finance/crosschain" },
	{ name: "toncenter", purpose: "TON balance, transactions, jetton wallets, BOC broadcasting", auth: "none" },
	{ name: "Blockscout (eth.blockscout.com)", purpose: "ETH addresses, transactions, ABI", auth: "none" },
	{ name: "Solana RPC (public)", purpose: "SOL balance, signatures, transactions", auth: "none" },
	{ name: "DexScreener", purpose: "Token search, pairs, liquidity, volume, FDV", auth: "none" },
	{ name: "Groq", purpose: "LLM completions (chat, OpenAI-compatible)", auth: "Bearer token (user's own key)" },
];

const TON_FACTS = [
	"Address format: EQ… (bounceable) or UQ… (non-bounceable), 48 chars, base64url. 0Q and kQ also valid for raw.",
	"Native token: Toncoin (TON), 9 decimals.",
	"Jettons: TON's token standard (similar to ERC-20). Master contract + per-wallet contracts.",
	"Wallet contract: V4 (W5 deprecated). Used in this app.",
	"Gas: pay in TON, very cheap (~0.005 TON per transfer).",
	"Send requires: seqno, subwallet_id, valid_until, op=0, bounce flag, mode.",
	"Seed phrase: 24 English words (BIP-39). Encrypts with AES-GCM + PBKDF2 (100k iter).",
	"PIN: 4 digits. Used to encrypt seed before storing in Telegram CloudStorage.",
	"Popular jettons (hardcoded in TokenPickerModal): TON, USDT, NOT, MAJOR, DOGS.",
	"Omniston TON chain_id = 607. Symbiosis TON chain_id = 85918.",
];

const SAFETY_RULES = [
	"NEVER ask the user for their seed phrase, private key, or PIN.",
	"If user shares a seed phrase or key, IMMEDIATELY warn them, recommend moving funds to a new wallet, and remind to never paste it anywhere online.",
	"If the user pastes an address that looks like a known scam/exploit (Tornado, drainers), warn them BEFORE they send.",
	"For unknown tokens, recommend checking CoinGecko and DexScreener first.",
	"Always remind that this is a non-custodial wallet: only the user controls funds.",
];

export interface AIContext {
	view: string;
	selectedAssetSymbol?: string;
	networkMode: string;
	language: "en" | "ru";
}

export function buildKnowledgeBaseSection(): string {
	return `## WALLET KNOWLEDGE BASE

You are the built-in AI assistant for WhyNot Wallet, a non-custodial Telegram mini app wallet (iOS/Android/Web via Telegram). The wallet supports 5 main assets (TON, ETH, SOL, USDT, BTC) and 17 screens.

### Screens (views)
${VIEWS.map((v) => `- **${v.id}** — ${v.purpose}. Trigger: ${v.trigger}. Actions: ${v.actions.join("; ")}.`).join("\n")}

### Supported assets
${ASSETS.map((a) => `- ${a.symbol} (${a.name}) on ${a.network}, decimals=${a.decimals}, chainId=${a.chainId}, isNative=${a.isNative}, symbiosisAddress=${a.symbiosisAddress}`).join("\n")}

### Supported chains
${CHAINS.map((c) => `- ${c.name} (chainId=${c.chainId})${c.readOnly ? " [read-only]" : ""}`).join("\n")}

### Routing rules
${ROUTES.map((r) => `- ${r.from} → ${r.to}: engine=${r.engine}. ${r.notes}`).join("\n")}

### Reputation scoring (1-10 scale)
Used in Send view to warn about risky recipients. Score = (activity + volume + age + purity) / 4. Bands: ≥8.5 excellent, ≥7.0 good, ≥4.5 average, <4.5 low.
${REPUTATION_CRITERIA.map((c) => `- **${c.key}** (weight ${c.weight}): ${c.description}`).join("\n")}

### Data sources the wallet uses
${SOURCES.map((s) => `- **${s.name}** — ${s.purpose} (auth: ${s.auth})${s.endpoint ? `, endpoint: ${s.endpoint}` : ""}`).join("\n")}

### TON-specific facts
${TON_FACTS.map((f) => `- ${f}`).join("\n")}

### Safety rules (MUST follow)
${SAFETY_RULES.map((r) => `- ${r}`).join("\n")}`;
}

export function buildContextSection(context: AIContext | undefined): string {
	if (!context) return "";
	const lang = context.language === "ru" ? "Russian" : "English";
	const selected = context.selectedAssetSymbol
		? `The user is currently viewing details for: ${context.selectedAssetSymbol}.`
		: "No asset currently selected.";
	return `## CURRENT USER CONTEXT
- Active screen: ${context.view}
- Network mode: ${context.networkMode}
- UI language: ${lang}
- ${selected}

Note: The user has NOT shared their balances, addresses, or seed with you. You cannot see their private data. If they ask about portfolio, refer them to the main screen.`;
}

export function buildCapabilitiesSection(): string {
	return `## YOUR CAPABILITIES

You can request the app to perform REAL actions by including a JSON code block in your reply. The app will execute the action and give you the result, then you explain in natural language.

### Available actions

1. **Evaluate a wallet address** (on-chain reputation, 1-10 score with criteria):
\`\`\`json
{"action": "evaluate_wallet", "address": "<TON|Eth|Sol address>"}
\`\`\`

2. **Analyze a token by name or symbol** (CoinGecko + DexScreener):
\`\`\`json
{"action": "analyze_token", "query": "PEPE"}
\`\`\`

### How to format action calls
- Put the JSON inside a single \`\`\`json code block (triple backticks, language=json).
- Include exactly one JSON object per code block.
- Place action calls at the END of your reply, after your text explanation.
- You may include both an explanation AND an action call in the same reply.
- You may chain up to 2 actions per user message (e.g. evaluate creator wallet of a token).

### When to use actions
- User says "оцени кошелёк X", "is this address safe?", "check reputation of EQ..." → evaluate_wallet
- User says "что за токен PEPE?", "analyze USDC", "is NOT legit?" → analyze_token
- For general questions (navigation, security tips, explanations) → respond with text only, no actions needed.

### Reply language
Match the user's language (${"en"} or Russian). Be concise: 2-5 short paragraphs max. Use bullet points for lists. No filler.`;
}

export const AI_KNOWLEDGE_VIEWS = VIEWS;
export const AI_KNOWLEDGE_ASSETS = ASSETS;
export const AI_KNOWLEDGE_ROUTES = ROUTES;
export const AI_KNOWLEDGE_REPUTATION_CRITERIA = REPUTATION_CRITERIA;
