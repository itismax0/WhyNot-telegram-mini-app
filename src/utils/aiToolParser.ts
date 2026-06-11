import { isValidAddressOrUsername } from "../services/blockchain";

export type AIAction =
	| { action: "evaluate_wallet"; address: string }
	| { action: "analyze_token"; query: string };

export interface ParsedAIResponse {
	cleanText: string;
	actions: AIAction[];
}

function tryParseActionObject(raw: string): AIAction | null {
	let obj: any;
	try {
		obj = JSON.parse(raw);
	} catch {
		return null;
	}
	if (!obj || typeof obj !== "object" || typeof obj.action !== "string") {
		return null;
	}
	const action = String(obj.action).toLowerCase();
	if (action === "evaluate_wallet") {
		const address = obj.address;
		if (typeof address === "string" && isValidAddressOrUsername(address.trim())) {
			return { action: "evaluate_wallet", address: address.trim() };
		}
	} else if (action === "analyze_token") {
		const q = obj.query ?? obj.name ?? obj.symbol;
		if (typeof q === "string" && q.trim().length >= 1) {
			return { action: "analyze_token", query: q.trim() };
		}
	}
	return null;
}

export function parseAndExtractActions(text: string): ParsedAIResponse {
	const actions: AIAction[] = [];
	const codeBlockRe = /```\w*\s*([\s\S]*?)```/g;
	const matchedSpans: Array<{ start: number; end: number }> = [];
	let m: RegExpExecArray | null;
	while ((m = codeBlockRe.exec(text)) !== null) {
		const inner = m[1].trim();
		const parsed = tryParseActionObject(inner);
		if (parsed) {
			actions.push(parsed);
			matchedSpans.push({ start: m.index, end: m.index + m[0].length });
		}
	}
	let cleanText = text;
	for (let i = matchedSpans.length - 1; i >= 0; i--) {
		const span = matchedSpans[i];
		cleanText = cleanText.slice(0, span.start) + cleanText.slice(span.end);
	}
	cleanText = cleanText.replace(/\n{3,}/g, "\n\n").trim();
	return { cleanText, actions };
}

export const MAX_ACTIONS_PER_TURN = 3;
