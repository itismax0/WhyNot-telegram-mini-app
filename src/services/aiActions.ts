import { evaluateReputationReal } from "./blockchain";
import type { ReputationDetails } from "./blockchain";
import {
	analyzeToken,
	formatTokenAnalysisCompact,
} from "./tokenAnalysis";
import type { TokenAnalysisResult } from "./tokenAnalysis";
import type { AIAction } from "../utils/aiToolParser";

export interface ActionExecutionResult {
	action: AIAction;
	ok: boolean;
	data?: unknown;
	error?: string;
}

export async function executeAction(
	action: AIAction,
	networkMode: "mainnet" | "testnet" | "devnet" = "mainnet"
): Promise<ActionExecutionResult> {
	try {
		if (action.action === "evaluate_wallet") {
			const result = await evaluateReputationReal(
				action.address,
				networkMode
			);
			if (!result) {
				return {
					action,
					ok: false,
					error: "Invalid or unrecognized address",
				};
			}
			return { action, ok: true, data: result };
		}
		if (action.action === "analyze_token") {
			const result: TokenAnalysisResult = await analyzeToken(action.query);
			return { action, ok: true, data: result };
		}
		return { action, ok: false, error: "Unknown action" };
	} catch (e: any) {
		return {
			action,
			ok: false,
			error: e?.message || "Action execution failed",
		};
	}
}

export function formatActionResultForLLM(
	exec: ActionExecutionResult
): string {
	if (!exec.ok) {
		return JSON.stringify({
			action: exec.action,
			ok: false,
			error: exec.error || "Action failed",
		});
	}
	if (exec.action.action === "evaluate_wallet") {
		const d = exec.data as ReputationDetails;
		return JSON.stringify({
			action: "evaluate_wallet",
			ok: true,
			address: exec.action.address,
			score: d.score,
			labelKey: d.labelKey,
			descKey: d.descKey,
			criteria: d.criteria,
			colorClass: d.colorClass,
		});
	}
	if (exec.action.action === "analyze_token") {
		const result = exec.data as TokenAnalysisResult;
		return formatTokenAnalysisCompact(result);
	}
	return JSON.stringify({ action: exec.action, ok: true });
}
