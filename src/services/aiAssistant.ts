import {
	buildKnowledgeBaseSection,
	buildContextSection,
	buildCapabilitiesSection,
	type AIContext,
} from "./aiKnowledgeBase";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const ENV_DEFAULT_KEY =
	(import.meta as any)?.env?.VITE_OPENROUTER_KEY || "";

export const OPENROUTER_DEFAULT_KEY = ENV_DEFAULT_KEY;

export const AI_MODEL_FALLBACKS = [
	"moonshotai/kimi-k2.6:free",
	"google/gemma-4-31b-it:free",
	"nvidia/nemotron-3-ultra-550b-a55b:free",
	"qwen/qwen3-next-80b-a3b-instruct:free",
];

export const AI_MODEL_PRIMARY = AI_MODEL_FALLBACKS[0];

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
	context?: AIContext | null;
}

export interface AIChatResult {
	content: string;
	model: string;
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

export async function aiChat({
	messages,
	temperature = 0.6,
	maxTokens = 800,
	signal,
	apiKey,
	context,
}: AIChatOptions): Promise<AIChatResult> {
	const systemPrompt = buildSystemPrompt(context || null);
	const allMessages: AIMessage[] = [
		{ role: "system", content: systemPrompt },
		...messages,
	];

	const key = apiKey && apiKey.trim() ? apiKey.trim() : OPENROUTER_DEFAULT_KEY;
	if (!key) {
		throw new Error(
			"NO_API_KEY: OpenRouter API key is not set. Add your key in Settings → AI assistant."
		);
	}

	let lastError: unknown = null;

	for (const model of AI_MODEL_FALLBACKS) {
		try {
			const res = await fetch(OPENROUTER_API_URL, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${key}`,
					"Content-Type": "application/json",
					"HTTP-Referer":
						typeof window !== "undefined"
							? window.location.origin
							: "https://whynot-wallet.app",
					"X-Title": "WhyNot Wallet",
				},
				body: JSON.stringify({
					model,
					messages: allMessages,
					temperature,
					max_tokens: maxTokens,
					stream: false,
				}),
				signal,
			});

			if (!res.ok) {
				const text = await res.text().catch(() => "");
				throw new Error(
					`OpenRouter ${res.status} on ${model}: ${text.substring(0, 200)}`
				);
			}

			const data = await res.json();
			const content = data?.choices?.[0]?.message?.content;
			if (!content) {
				throw new Error(`Empty response from ${model}`);
			}
			return { content, model };
		} catch (e: any) {
			if (e?.name === "AbortError") {
				throw e;
			}
			lastError = e;
			console.warn(`AI model ${model} failed:`, e?.message ?? e);
		}
	}

	throw new Error(
		`All AI models failed: ${lastError instanceof Error ? lastError.message : "unknown"}`
	);
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
