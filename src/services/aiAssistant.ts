import {
	buildKnowledgeBaseSection,
	buildContextSection,
	buildCapabilitiesSection,
	type AIContext,
} from "./aiKnowledgeBase";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const GROQ_ENV_KEY = "";
const OPENROUTER_ENV_KEY = "";

export const GROQ_DEFAULT_KEY = GROQ_ENV_KEY;
export const OPENROUTER_DEFAULT_KEY = OPENROUTER_ENV_KEY;

const GROQ_MODELS = [
	"llama-3.3-70b-versatile",
	"llama-3.1-8b-instant",
	"gemma2-9b-it",
	"mixtral-8x7b-32768",
];

const OPENROUTER_MODELS = [
	"moonshotai/kimi-k2.6:free",
	"google/gemma-4-31b-it:free",
	"nvidia/nemotron-3-ultra-550b-a55b:free",
	"qwen/qwen3-next-80b-a3b-instruct:free",
];

export const AI_MODEL_PRIMARY = GROQ_MODELS[0];

type Provider = "groq" | "openrouter";

function validateKey(key: string): Provider | null {
	if (key.startsWith("gsk_")) return "groq";
	if (key.startsWith("sk-")) return "openrouter";
	return null;
}

export interface AIMessage {
	role: "system" | "user" | "assistant";
	content: string;
}

export interface AIChatOptions {
	messages: AIMessage[];
	temperature?: number;
	maxTokens?: number;
	signal?: AbortSignal;
	apiKey?: string | null;
	groqKey?: string | null;
	openrouterKey?: string | null;
	context?: AIContext | null;
}

export interface AIChatResult {
	content: string;
	model: string;
	provider: Provider;
}

function buildSystemPrompt(context: AIContext | null | undefined): string {
	const sections: string[] = [];
	sections.push(
		"You are the AI assistant for WhyNot Wallet, a non-custodial Telegram mini app wallet."
	);
	sections.push(buildKnowledgeBaseSection());
	sections.push(buildCapabilitiesSection());
	if (context) {
		sections.push(buildContextSection(context));
	}
	sections.push(
		"\n## RESPONSE STYLE\n- Reply in the same language the user uses (English or Russian).\n- Be concise: 2-5 short paragraphs max. Use bullet points for lists.\n- Never ask the user for their seed phrase, private key, PIN, or password. If they share one, warn them immediately.\n- For security-sensitive questions, prefer text answers over action calls.\n- When you include an action call, place it at the END of your reply, after your explanation."
	);
	return sections.join("\n\n");
}

interface ProviderConfig {
	url: string;
	models: string[];
	buildHeaders: (key: string) => Record<string, string>;
}

const PROVIDERS: Record<Provider, ProviderConfig> = {
	groq: {
		url: GROQ_API_URL,
		models: GROQ_MODELS,
		buildHeaders: (key) => ({
			Authorization: `Bearer ${key}`,
			"Content-Type": "application/json",
		}),
	},
	openrouter: {
		url: OPENROUTER_API_URL,
		models: OPENROUTER_MODELS,
		buildHeaders: (key) => ({
			Authorization: `Bearer ${key}`,
			"Content-Type": "application/json",
			"HTTP-Referer":
				typeof window !== "undefined"
					? window.location.origin
					: "https://whynot-wallet.app",
			"X-Title": "WhyNot Wallet",
		}),
	},
};

async function callProvider(
	provider: Provider,
	key: string,
	messages: AIMessage[],
	temperature: number,
	maxTokens: number,
	signal?: AbortSignal
): Promise<AIChatResult> {
	const config = PROVIDERS[provider];
	let lastError: unknown = null;
	const providerLabel = provider === "groq" ? "Groq" : "OpenRouter";

	for (let i = 0; i < config.models.length; i++) {
		const model = config.models[i];
		try {
			const res = await fetch(config.url, {
				method: "POST",
				headers: config.buildHeaders(key),
				body: JSON.stringify({
					model,
					messages,
					temperature,
					max_tokens: maxTokens,
					stream: false,
				}),
				signal,
			});

			if (!res.ok) {
				const text = await res.text().catch(() => "");
				const isRateLimit = res.status === 429;
				if (isRateLimit && i < config.models.length - 1) {
					await new Promise((r) => setTimeout(r, 250));
				}
				throw new Error(
					`${providerLabel} ${res.status} on ${model}: ${text.substring(0, 200)}`
				);
			}

			const data = await res.json();
			const content = data?.choices?.[0]?.message?.content;
			if (!content) {
				throw new Error(`Empty response from ${model}`);
			}
			return { content, model, provider };
		} catch (e: any) {
			if (e?.name === "AbortError") {
				throw e;
			}
			lastError = e;
			console.warn(`AI model ${model} failed:`, e?.message ?? e);
		}
	}

	throw new Error(
		`All ${providerLabel} models failed: ${lastError instanceof Error ? lastError.message : "unknown"}`
	);
}

export async function aiChat({
	messages,
	temperature = 0.6,
	maxTokens = 800,
	signal,
	apiKey,
	groqKey,
	openrouterKey,
	context,
}: AIChatOptions): Promise<AIChatResult> {
	const systemPrompt = buildSystemPrompt(context || null);
	const allMessages: AIMessage[] = [
		{ role: "system", content: systemPrompt },
		...messages,
	];

	let resolvedGroq: string | null = null;
	let resolvedOpenRouter: string | null = null;

	if (apiKey && apiKey.trim()) {
		const trimmed = apiKey.trim();
		const provider = validateKey(trimmed);
		if (!provider) {
			throw new Error(
				"NO_API_KEY: API key must start with `gsk_` (Groq) or `sk-` (OpenRouter)."
			);
		}
		if (provider === "groq") {
			resolvedGroq = trimmed;
			resolvedOpenRouter =
				openrouterKey && openrouterKey.trim()
					? openrouterKey.trim()
					: OPENROUTER_DEFAULT_KEY;
		} else {
			resolvedOpenRouter = trimmed;
			resolvedGroq =
				groqKey && groqKey.trim()
					? groqKey.trim()
					: GROQ_DEFAULT_KEY;
		}
	} else {
		resolvedGroq = groqKey && groqKey.trim() ? groqKey.trim() : GROQ_DEFAULT_KEY;
		resolvedOpenRouter =
			openrouterKey && openrouterKey.trim()
				? openrouterKey.trim()
				: OPENROUTER_DEFAULT_KEY;
	}

	if (!resolvedGroq && !resolvedOpenRouter) {
		throw new Error(
			"NO_API_KEY: No AI API key set. Add your Groq or OpenRouter key in Settings → AI assistant."
		);
	}

	const lastErrors: unknown[] = [];

	if (resolvedGroq) {
		try {
			return await callProvider(
				"groq",
				resolvedGroq,
				allMessages,
				temperature,
				maxTokens,
				signal
			);
		} catch (e: any) {
			if (e?.name === "AbortError") throw e;
			lastErrors.push(e);
			console.warn("Groq failed, falling back to OpenRouter:", e?.message ?? e);
		}
	}

	if (resolvedOpenRouter) {
		return await callProvider(
			"openrouter",
			resolvedOpenRouter,
			allMessages,
			temperature,
			maxTokens,
			signal
		);
	}

	throw new Error(
		`All AI providers failed: ${lastErrors
			.map((e) => (e instanceof Error ? e.message : "unknown"))
			.join("; ")}`
	);
}

export function detectKeyProvider(key: string): Provider | null {
	return validateKey(key);
}

export interface AIRawTurn {
	id: string;
	role: "user" | "assistant" | "tool";
	content: string;
	model?: string;
	actions?: unknown;
	timestamp: number;
}

export const MAX_REROUTE_ITERATIONS = 2;
