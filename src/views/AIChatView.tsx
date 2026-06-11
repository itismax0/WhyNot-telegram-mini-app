import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Bot,
	ChevronLeft,
	Loader2,
	Send,
	Sparkles,
	Trash2,
	User,
	ExternalLink,
	ShieldCheck,
	TrendingUp,
	Droplets,
	Coins,
	BarChart3,
	Settings as SettingsIcon,
} from "lucide-react";
import { useWallet } from "../store/WalletContext";
import { aiChat, MAX_REROUTE_ITERATIONS, AI_MODEL_PRIMARY, type AIMessage } from "../services/aiAssistant";
import {
	parseAndExtractActions,
	MAX_ACTIONS_PER_TURN,
	type AIAction,
} from "../utils/aiToolParser";
import { executeAction, formatActionResultForLLM } from "../services/aiActions";
import type { ReputationDetails } from "../services/blockchain";
import type { TokenAnalysisResult } from "../services/tokenAnalysis";

interface ActionCardData {
	action: AIAction;
	result?: unknown;
	error?: string;
}

interface ChatTurn {
	id: string;
	role: "user" | "assistant";
	content: string;
	model?: string;
	timestamp: number;
	actionCards?: ActionCardData[];
}

const STORAGE_KEY = "whynot_ai_chat_history";

const SUGGESTIONS_EN: { icon: string; text: string }[] = [
	{
		icon: "🛡",
		text: "Evaluate this TON address: EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
	},
	{
		icon: "📊",
		text: "Analyze the PEPE token — is it safe to buy?",
	},
	{
		icon: "💱",
		text: "How do I swap ETH for SOL with the lowest fees?",
	},
	{
		icon: "🔒",
		text: "What are the most important self-custody rules?",
	},
];

const SUGGESTIONS_RU: { icon: string; text: string }[] = [
	{
		icon: "🛡",
		text: "Оцени кошелёк TON: EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
	},
	{
		icon: "📊",
		text: "Проанализируй токен PEPE — безопасно ли его покупать?",
	},
	{
		icon: "💱",
		text: "Как обменять ETH на SOL с минимальной комиссией?",
	},
	{
		icon: "🔒",
		text: "Какие главные правила самостоятельного хранения крипты?",
	},
];

function loadHistory(): ChatTurn[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as ChatTurn[];
		if (!Array.isArray(parsed)) return [];
		return parsed.slice(-50);
	} catch {
		return [];
	}
}

function saveHistory(turns: ChatTurn[]) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(turns.slice(-50)));
	} catch (e) {
		console.warn("AIChatView: failed to save history", e);
	}
}

function rid() {
	return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function reputationColor(score: number): string {
	if (score >= 8.5) return "#30d158";
	if (score >= 7.0) return "#34c759";
	if (score >= 4.5) return "#ff9f0a";
	return "#ff453a";
}

function ReputationCard({ data }: { data: ReputationDetails }) {
	const score = Math.round(data.score * 10) / 10;
	const color = reputationColor(score);
	const radius = 24;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (score / 10) * circumference;
	const critEntries: Array<[string, number]> = [
		["activity", data.criteria.activity],
		["purity", data.criteria.purity],
		["volume", data.criteria.volume],
		["age", data.criteria.age],
	];
	return (
		<div className="bg-[#0c1a2e] border border-[#1a2f5c]/60 rounded-[14px] p-3 flex gap-3 items-center">
			<svg width="60" height="60" className="flex-shrink-0 -rotate-90">
				<circle
					cx="30"
					cy="30"
					r={radius}
					stroke="#1a2f5c"
					strokeWidth="4"
					fill="none"
				/>
				<circle
					cx="30"
					cy="30"
					r={radius}
					stroke={color}
					strokeWidth="4"
					fill="none"
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					strokeLinecap="round"
				/>
				<text
					x="30"
					y="35"
					textAnchor="middle"
					fill={color}
					fontSize="14"
					fontWeight="700"
					className="rotate-90"
					style={{ transformOrigin: "30px 30px" }}
				>
					{score}
				</text>
			</svg>
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-1.5 mb-1">
					<ShieldCheck size={12} className="text-[#387aff]" />
					<span className="text-[11px] font-semibold text-white">
						Wallet reputation
					</span>
				</div>
				<div className="space-y-1">
					{critEntries.map(([k, v]) => (
						<div key={k} className="flex items-center gap-2">
							<span className="text-[10px] text-[#8e8e93] w-14">
								{k}
							</span>
							<div className="flex-1 h-1 bg-[#1a2f5c]/40 rounded-full overflow-hidden">
								<div
									className="h-full rounded-full"
									style={{
										width: `${Math.min(100, v * 10)}%`,
										background: reputationColor(v),
									}}
								/>
							</div>
							<span className="text-[10px] font-mono w-6 text-right text-white">
								{v}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function formatNumber(n: number | undefined, opts: { compact?: boolean; prefix?: string } = {}): string {
	if (n == null || !isFinite(n)) return "—";
	const { compact = true, prefix = "" } = opts;
	if (compact && Math.abs(n) >= 1_000_000_000) {
		return `${prefix}${(n / 1_000_000_000).toFixed(2)}B`;
	}
	if (compact && Math.abs(n) >= 1_000_000) {
		return `${prefix}${(n / 1_000_000).toFixed(2)}M`;
	}
	if (compact && Math.abs(n) >= 1_000) {
		return `${prefix}${(n / 1_000).toFixed(1)}K`;
	}
	return `${prefix}${n.toLocaleString(undefined, { maximumFractionDigits: 4 })}`;
}

function TokenCard({ data }: { data: TokenAnalysisResult }) {
	if (!data.bestMatch) {
		return (
			<div className="bg-[#2a1010] border border-red-900/40 rounded-[14px] p-3 text-[12px] text-red-300">
				Token not found: {data.error || "no data"}
			</div>
		);
	}
	const t = data.bestMatch;
	const change = t.change24h;
	const changeColor =
		change == null
			? "text-[#8e8e93]"
			: change >= 0
				? "text-green-400"
				: "text-red-400";
	return (
		<div className="bg-[#0c1a2e] border border-[#1a2f5c]/60 rounded-[14px] p-3 flex flex-col gap-2">
			<div className="flex items-center gap-2.5">
				{t.thumb ? (
					<img
						src={t.thumb}
						alt={t.symbol}
						className="w-9 h-9 rounded-full bg-[#0a1530] object-contain"
					/>
				) : (
					<div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#387aff] to-[#5d3aff] flex items-center justify-center">
						<Coins size={16} className="text-white" />
					</div>
				)}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-1.5">
						<span className="text-[13px] font-bold text-white">
							{t.symbol?.toUpperCase()}
						</span>
						<span className="text-[11px] text-[#8e8e93] truncate">
							{t.name}
						</span>
					</div>
					<div className="flex items-center gap-2 mt-0.5">
						{t.marketCapRank != null && (
							<span className="text-[10px] text-[#8e8e93] font-mono">
								#{t.marketCapRank}
							</span>
						)}
						{t.priceUsd != null && (
							<span className="text-[11px] font-mono text-white">
								${t.priceUsd < 0.01
									? t.priceUsd.toExponential(2)
									: t.priceUsd.toLocaleString(undefined, {
											maximumFractionDigits: 4,
										})}
							</span>
						)}
						{change != null && (
							<span className={`text-[10px] font-mono ${changeColor}`}>
								{change >= 0 ? "+" : ""}
								{change.toFixed(1)}%
							</span>
						)}
					</div>
				</div>
			</div>
			<div className="grid grid-cols-3 gap-2">
				<div className="flex flex-col">
					<div className="flex items-center gap-1 text-[9px] text-[#8e8e93]">
						<BarChart3 size={9} />MCap
					</div>
					<span className="text-[11px] font-mono text-white">
						{formatNumber(t.marketCap, { prefix: "$" })}
					</span>
				</div>
				<div className="flex flex-col">
					<div className="flex items-center gap-1 text-[9px] text-[#8e8e93]">
						<TrendingUp size={9} />
						Vol 24h
					</div>
					<span className="text-[11px] font-mono text-white">
						{formatNumber(t.totalVolume24h, { prefix: "$" })}
					</span>
				</div>
				<div className="flex flex-col">
					<div className="flex items-center gap-1 text-[9px] text-[#8e8e93]">
						<Droplets size={9} />
						Liq
					</div>
					<span className="text-[11px] font-mono text-white">
						{formatNumber(t.dexTopPair?.liquidityUsd, { prefix: "$" })}
					</span>
				</div>
			</div>
			{t.dexTopPair?.url && (
				<a
					href={t.dexTopPair.url}
					target="_blank"
					rel="noreferrer noopener"
					className="text-[10px] text-[#387aff] hover:underline flex items-center gap-1"
				>
					View on DexScreener ({t.dexTopPair.dexId} · {t.dexTopPair.chainId})
					<ExternalLink size={9} />
				</a>
			)}
			{t.descriptionEn && (
				<p className="text-[10px] text-[#8e8e93] line-clamp-3 leading-snug">
					{t.descriptionEn}
				</p>
			)}
		</div>
	);
}

function ActionCard({ card }: { card: ActionCardData }) {
	if (card.action.action === "evaluate_wallet") {
		if (card.error) {
			return (
				<div className="bg-[#2a1010] border border-red-900/40 rounded-[14px] p-3 text-[12px] text-red-300">
					Reputation error: {card.error}
				</div>
			);
		}
		const data = card.result as ReputationDetails | undefined;
		if (!data) return null;
		return <ReputationCard data={data} />;
	}
	if (card.action.action === "analyze_token") {
		if (card.error) {
			return (
				<div className="bg-[#2a1010] border border-red-900/40 rounded-[14px] p-3 text-[12px] text-red-300">
					Token error: {card.error}
				</div>
			);
		}
		const data = card.result as TokenAnalysisResult | undefined;
		if (!data) return null;
		return <TokenCard data={data} />;
	}
	return null;
}

export const AIChatView = () => {
	const {
		setView,
		language,
		showToast,
		view,
		selectedAsset,
		networkMode,
		groqKey,
		openrouterKey,
	} = useWallet();
	const [turns, setTurns] = useState<ChatTurn[]>(() => loadHistory());
	const [input, setInput] = useState("");
	const [sending, setSending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [rerouteStep, setRerouteStep] = useState(0);
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const abortRef = useRef<AbortController | null>(null);
	const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const suggestions = language === "ru" ? SUGGESTIONS_RU : SUGGESTIONS_EN;

	useEffect(() => {
		return () => {
			abortRef.current?.abort();
		};
	}, []);

	useEffect(() => {
		if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
		saveTimerRef.current = setTimeout(() => {
			saveHistory(turns);
			saveTimerRef.current = null;
		}, 500);
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [turns]);

	useEffect(() => {
		return () => {
			if (saveTimerRef.current) {
				clearTimeout(saveTimerRef.current);
				saveTimerRef.current = null;
			}
		};
	}, []);

	const send = async (text: string) => {
		const trimmed = text.trim();
		if (!trimmed || sending) return;

		const userTurn: ChatTurn = {
			id: rid(),
			role: "user",
			content: trimmed,
			timestamp: Date.now(),
		};
		const baseTurns = [...turns, userTurn];
		setTurns(baseTurns);
		setInput("");
		setError(null);
		setSending(true);
		setRerouteStep(0);

		const apiContext = {
			view,
			selectedAssetSymbol: selectedAsset?.symbol,
			networkMode,
			language,
		};

		const buildApiMessages = (
			turnsForApi: ChatTurn[],
			extra?: AIMessage[]
		): AIMessage[] => {
			const sliced = turnsForApi
				.slice(-20)
				.map((t) => ({ role: t.role, content: t.content }));
			return [...(extra || []), ...sliced];
		};

		abortRef.current = new AbortController();
		let lastModel = AI_MODEL_PRIMARY;
		let finalText = "";
		let finalCards: ActionCardData[] = [];

		try {
			let currentTurns = [...baseTurns];
			for (let iter = 0; iter <= MAX_REROUTE_ITERATIONS; iter++) {
				setRerouteStep(iter);
				const apiMessages = buildApiMessages(currentTurns);
				const result = await aiChat({
					messages: apiMessages,
					signal: abortRef.current.signal,
					apiKey: groqKey,
					openrouterKey,
					context: apiContext,
				});
				lastModel = result.model;
				const { cleanText, actions } = parseAndExtractActions(
					result.content
				);
				const limitedActions = actions.slice(0, MAX_ACTIONS_PER_TURN);
				if (!limitedActions.length) {
					finalText = cleanText;
					break;
				}
				if (iter === MAX_REROUTE_ITERATIONS) {
					finalText = cleanText;
					break;
				}
				const settledResults = await Promise.allSettled(
					limitedActions.map((a) => executeAction(a, networkMode))
				);
				const execResults = settledResults
					.filter((r) => r.status === "fulfilled")
					.map((r: any) => r.value);
				const execErrors = settledResults
					.filter((r) => r.status === "rejected")
					.map((r: any) => ({ action: { action: "error" as const }, error: r.reason?.message || "Unknown error" }));
				finalCards = [...execResults, ...execErrors].map((e: any) => ({
					action: e.action,
					result: e.data,
					error: e.error,
				}));
				const toolMessages: AIMessage[] = [
					{ role: "assistant", content: result.content },
					...execResults.flatMap((e) => [
						{
							role: "user" as const,
							content: `[Tool result for action ${e.action.action}]\n${formatActionResultForLLM(e)}\n\nNow write a final natural-language reply that uses this data. Do NOT include additional JSON action blocks. Reply in ${language === "ru" ? "Russian" : "English"}.`,
						},
					]),
				];
				currentTurns = [
					...currentTurns,
					{
						id: rid(),
						role: "assistant",
						content: result.content,
						model: result.model,
						timestamp: Date.now(),
					},
					...execResults.map((e) => ({
						id: rid(),
						role: "user" as const,
						content: `[Tool result for ${e.action.action}] ${formatActionResultForLLM(e)}`,
						timestamp: Date.now(),
					})),
				];
				setTurns((prev) => [
					...prev,
					{
						id: rid(),
						role: "assistant",
						content: result.content,
						model: result.model,
						timestamp: Date.now(),
						actionCards: [...finalCards],
					},
				]);
				finalText = "";
				if (iter < MAX_REROUTE_ITERATIONS) {
					const finalResult = await aiChat({
						messages: buildApiMessages(currentTurns, toolMessages),
						signal: abortRef.current.signal,
					apiKey: groqKey,
						context: apiContext,
					});
					lastModel = finalResult.model;
					const parsed = parseAndExtractActions(finalResult.content);
					finalText = parsed.cleanText;
					if (parsed.actions.length) {
						currentTurns = [
							...currentTurns,
							{
								id: rid(),
								role: "assistant",
								content: finalResult.content,
								model: finalResult.model,
								timestamp: Date.now(),
							},
						];
						continue;
					}
				}
				break;
			}

			setTurns((prev) => [
				...prev,
				{
					id: rid(),
					role: "assistant",
					content: finalText,
					model: lastModel,
					timestamp: Date.now(),
					actionCards: finalCards.length ? finalCards : undefined,
				},
			]);
		} catch (e: any) {
			if (e?.name === "AbortError") {
				setTurns((prev) => prev.slice(0, -1));
				return;
			}
			console.error("AI chat error", e);
			const msg = e?.message || "";
			let friendly = "Failed to get a response. Please try again.";
			if (msg.includes("429")) {
				friendly = language === "ru"
					? "Достигнут лимит (429). Добавьте свой ключ в Настройки или подождите."
					: "Rate limit (429). Add your own key in Settings or wait.";
			} else 			if (msg.includes("401") || msg.includes("403")) {
				friendly = language === "ru"
					? "Неверный API ключ. Откройте Настройки и проверьте ключ."
					: "Invalid API key. Open Settings and check your key.";
			} else if (msg.includes("NO_API_KEY")) {
				friendly = language === "ru"
					? "AI ключ не задан. Откройте Настройки → AI assistant и добавьте Groq или OpenRouter ключ."
					: "AI key is not set. Open Settings → AI assistant and add a Groq or OpenRouter key.";
			}
			setError(friendly);
		} finally {
			setSending(false);
			setRerouteStep(0);
			abortRef.current = null;
		}
	};

	const handleClear = () => {
		if (turns.length === 0) return;
		abortRef.current?.abort();
		setTurns([]);
		setError(null);
		showToast(language === "ru" ? "Чат очищен" : "Chat cleared");
	};

	const handleBack = () => {
		abortRef.current?.abort();
		setView("main");
	};

	const handleGoToSettings = () => {
		setView("settings");
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="flex flex-col min-h-screen bg-black text-white select-none"
		>
			<div className="flex justify-between items-center px-5 pt-5 pb-3 flex-shrink-0">
				<button
					onClick={handleBack}
					className="p-2 bg-[#121214] border border-[#202023]/60 rounded-full hover:bg-[#1a1a1d] transition-all"
					aria-label="Back"
				>
					<ChevronLeft size={20} />
				</button>
				<div className="text-center flex-1">
					<h2 className="font-semibold text-[17px] text-white flex items-center justify-center gap-1.5">
						<Sparkles size={16} className="text-[#387aff]" />
						{language === "ru" ? "AI-ассистент" : "AI assistant"}
					</h2>
					<p className="text-[11px] text-gray-500 font-medium tracking-wide mt-0.5">
						WhyNotWallet
					</p>
				</div>
				<button
					onClick={handleClear}
					className="p-2 bg-[#121214] border border-[#202023]/60 rounded-full hover:bg-[#1a1a1d] transition-all"
					aria-label="Clear chat"
				>
					<Trash2 size={18} className="text-[#8e8e93]" />
				</button>
			</div>

			<div
				ref={scrollRef}
				className="flex-1 overflow-y-auto px-4 pb-4"
			>
				{turns.length === 0 ? (
					<div className="flex flex-col items-center justify-center pt-8 px-2">
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#387aff] to-[#5d3aff] flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20"
						>
							<Bot size={32} className="text-white" />
						</motion.div>
						<h3 className="text-[20px] font-bold text-white text-center mb-1">
							{language === "ru"
								? "AI-ассистент WhyNot"
								: "AI assistant WhyNot"}
						</h3>
						<p className="text-[13px] text-[#8e8e93] text-center max-w-[280px] mb-6">
							{language === "ru"
								? "Анализирует рынок, находит возможности и защищает ваши средства."
								: "Analyzes the market, finds opportunities, and protects your funds."}
						</p>

						<div className="w-full space-y-2">
							{suggestions.map((s, i) => (
								<motion.button
									key={i}
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.05 * i }}
									onClick={() => send(s.text)}
									disabled={sending}
									className="w-full text-left bg-[#121214] border border-[#202023]/60 hover:bg-[#1a1a1d] active:bg-[#202024] rounded-[16px] px-4 py-3 flex items-start gap-3 transition-all disabled:opacity-50"
								>
									<span className="text-[18px] flex-shrink-0 mt-0.5">
										{s.icon}
									</span>
									<span className="text-[13px] text-[#d1d1d6] leading-snug">
										{s.text}
									</span>
								</motion.button>
							))}
						</div>
					</div>
				) : (
					<div className="flex flex-col gap-3 pt-2">
						<AnimatePresence initial={false}>
							{turns.map((turn) => (
								<motion.div
									key={turn.id}
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0 }}
									className={`flex gap-2 ${
										turn.role === "user"
											? "justify-end"
											: "justify-start"
									}`}
								>
									{turn.role === "assistant" && (
										<div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#387aff] to-[#5d3aff] flex items-center justify-center flex-shrink-0 mt-1">
											<Bot
												size={16}
												className="text-white"
											/>
										</div>
									)}
									<div
										className={`max-w-[80%] rounded-[16px] px-3 py-2.5 ${
											turn.role === "user"
												? "bg-[#387aff] text-white"
												: "bg-[#1c1c1e] text-white border border-[#2c2c2e]/60"
										}`}
									>
										{turn.actionCards && turn.actionCards.length > 0 && (
											<div className="flex flex-col gap-2 mb-2">
												{turn.actionCards.map((c, i) => (
													<ActionCard key={i} card={c} />
												))}
											</div>
										)}
										{turn.content && (
											<p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">
												{turn.content}
											</p>
										)}
										{turn.role === "assistant" && turn.model && (
											<p className="text-[10px] text-[#6e6e73] mt-1.5 font-mono">
												{turn.model.replace(":free", "")}
											</p>
										)}
									</div>
									{turn.role === "user" && (
										<div className="w-8 h-8 rounded-full bg-[#2c2c2e] flex items-center justify-center flex-shrink-0 mt-1">
											<User
												size={16}
												className="text-[#d1d1d6]"
											/>
										</div>
									)}
								</motion.div>
							))}
						</AnimatePresence>

						{sending && (
							<motion.div
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								className="flex gap-2 justify-start"
							>
								<div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#387aff] to-[#5d3aff] flex items-center justify-center flex-shrink-0 mt-1">
									<Bot size={16} className="text-white" />
								</div>
								<div className="bg-[#1c1c1e] border border-[#2c2c2e]/60 rounded-[16px] px-4 py-3 flex items-center gap-2">
									<Loader2
										size={14}
										className="animate-spin text-[#387aff]"
									/>
									<span className="text-[12px] text-[#8e8e93]">
										{rerouteStep > 0
											? language === "ru"
												? `Обрабатываю данные (шаг ${rerouteStep + 1})…`
												: `Processing data (step ${rerouteStep + 1})…`
											: language === "ru"
												? "Думаю…"
												: "Thinking…"}
									</span>
								</div>
							</motion.div>
						)}

						{error && (
							<div className="bg-red-500/10 border border-red-500/30 rounded-[14px] px-4 py-3 text-[12px] text-red-400 flex flex-col gap-2">
								<span>{error}</span>
								{!groqKey && !openrouterKey && (
									<button
										onClick={handleGoToSettings}
										className="self-start flex items-center gap-1 text-[11px] text-[#387aff] hover:underline"
									>
										<SettingsIcon size={11} />
										{language === "ru"
											? "Открыть настройки"
											: "Open settings"}
									</button>
								)}
							</div>
						)}
					</div>
				)}
			</div>

			<div className="flex-shrink-0 border-t border-[#202023]/60 bg-[#0c0c0e] px-3 py-3 pb-5">
				<div className="flex items-end gap-2">
					<div className="flex-1 bg-[#15151a] border border-[#202023]/60 rounded-[20px] px-4 py-2.5 flex items-end gap-2 focus-within:border-[#387aff]/60 transition-colors">
						<textarea
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									send(input);
								}
							}}
							placeholder={
								language === "ru"
									? "Спросите о рынке, мостах или безопасности…"
									: "Ask about markets, bridges, or security…"
							}
							rows={1}
							disabled={sending}
							className="flex-1 bg-transparent text-[14px] text-white placeholder-[#6e6e73] outline-none resize-none max-h-32 leading-snug"
						/>
					</div>
					<button
						onClick={() => send(input)}
						disabled={!input.trim() || sending}
						className="w-11 h-11 rounded-full bg-[#387aff] hover:bg-[#2d6de0] active:bg-[#2460c7] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all flex-shrink-0"
					>
						{sending ? (
							<Loader2 size={18} className="animate-spin" />
						) : (
							<Send size={18} />
						)}
					</button>
				</div>
				<p className="text-[10px] text-[#6e6e73] text-center mt-2">
					{language === "ru"
						? "AI может ошибаться. Не делитесь seed-фразой."
						: "AI can make mistakes. Never share your seed phrase."}
				</p>
			</div>
		</motion.div>
	);
};
