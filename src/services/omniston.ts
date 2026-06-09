export const OMNISTON_WS_URL = "wss://omni-ws.ston.fi";
export const OMNISTON_WS_URL_SANDBOX = "wss://omni-ws-sandbox.ston.fi";
export const TON_CHAIN_ID = 607;
export const SETTLEMENT_METHOD_SWAP = 0;
export const GASLESS_SETTLEMENT_POSSIBLE = 1;

export interface AssetAddress {
	blockchain: number;
	address: string;
}

export interface SwapChunk {
	protocol: number;
	bid_amount: string;
	ask_amount: string;
	extra: string;
	extra_version: number;
}

export interface SwapStep {
	bid_asset_address: AssetAddress;
	ask_asset_address: AssetAddress;
	chunks: SwapChunk[];
}

export interface SwapRoute {
	steps: SwapStep[];
	gas_budget: string;
}

export interface SwapParams {
	routes: SwapRoute[];
	min_ask_amount: string;
	recommended_min_ask_amount: string;
	recommended_slippage_bps: number;
}

export interface Quote {
	quote_id: string;
	resolver_id?: string;
	resolver_name?: string;
	bid_asset_address: AssetAddress;
	ask_asset_address: AssetAddress;
	bid_units: string;
	ask_units: string;
	referrer_address?: AssetAddress;
	referrer_fee_units?: string;
	protocol_fee_units?: string;
	quote_timestamp: number;
	trade_start_deadline: number;
	estimated_gas_consumption?: number;
	params: {
		swap: SwapParams;
	};
}

export interface TransferMessage {
	target_address: string;
	send_amount: string;
	payload: string;
}

export type TradeStatusType =
	| "awaiting_transfer"
	| "transferring"
	| "swapping"
	| "awaiting_fill"
	| "claim_available"
	| "refund_available"
	| "receiving_funds"
	| "trade_settled";

export type TradeStatusHandler = (
	status: TradeStatusType,
	data?: any
) => void;

type Listener = (data: any) => void;

class OmnistonClient {
	private ws: WebSocket | null = null;
	private url: string;
	private rpcId = 0;
	private pendingRpcs = new Map<
		number,
		{ resolve: (v: any) => void; reject: (e: any) => void }
	>();
	private listeners = new Map<string, Set<Listener>>();
	private pingTimer: ReturnType<typeof setInterval> | null = null;
	private connectPromise: Promise<void> | null = null;
	private explicitlyClosed = false;

	constructor(url: string = OMNISTON_WS_URL) {
		this.url = url;
	}

	connect(): Promise<void> {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			return Promise.resolve();
		}
		if (this.connectPromise) {
			return this.connectPromise;
		}

		this.connectPromise = new Promise((resolve, reject) => {
			try {
				this.ws = new WebSocket(this.url);
			} catch (e) {
				this.connectPromise = null;
				reject(e);
				return;
			}

			this.ws.onopen = () => {
				this.startPing();
				this.connectPromise = null;
				resolve();
			};

			this.ws.onerror = (err) => {
				if (this.connectPromise) {
					this.connectPromise = null;
					reject(err);
				}
			};

			this.ws.onclose = () => {
				this.stopPing();
				this.listeners.clear();
				this.rejectAllPending(
					new Error("Omniston WebSocket closed")
				);
				if (!this.explicitlyClosed) {
					setTimeout(() => {
						this.connect().catch(() => undefined);
					}, 3000);
				}
			};

			this.ws.onmessage = (event) => {
				try {
					this.handleMessage(JSON.parse(event.data));
				} catch (e) {
					console.error("Failed to parse omniston message", e);
				}
			};
		});

		return this.connectPromise;
	}

	close() {
		this.explicitlyClosed = true;
		this.stopPing();
		this.listeners.clear();
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}
		this.rejectAllPending(new Error("Omniston client closed"));
	}

	private startPing() {
		this.stopPing();
		this.pingTimer = setInterval(() => {
			if (this.ws?.readyState === WebSocket.OPEN) {
				try {
					this.ws.send(
						JSON.stringify({
							jsonrpc: "2.0",
							id: 0,
							method: "ping",
						})
					);
				} catch {
					/* ignore */
				}
			}
		}, 25000);
	}

	private stopPing() {
		if (this.pingTimer) {
			clearInterval(this.pingTimer);
			this.pingTimer = null;
		}
	}

	private rejectAllPending(err: Error) {
		this.pendingRpcs.forEach(({ reject }) => reject(err));
		this.pendingRpcs.clear();
	}

	private handleMessage(msg: any) {
		if (
			typeof msg.id === "number" &&
			msg.id !== 0 &&
			this.pendingRpcs.has(msg.id)
		) {
			const { resolve, reject } = this.pendingRpcs.get(msg.id)!;
			this.pendingRpcs.delete(msg.id);
			if (msg.error) {
				reject(
					new Error(
						(typeof msg.error === "string"
							? msg.error
							: msg.error.message ||
							  JSON.stringify(msg.error)) as string
					)
				);
			} else {
				resolve(msg.result);
			}
			return;
		}

		if (msg.method === "event" || msg.method === "status") {
			const subId = String(msg.params?.subscription ?? "");
			const listeners = this.listeners.get(subId);
			if (listeners) {
				listeners.forEach((l) => {
					try {
						l(msg.params?.result);
					} catch (e) {
						console.error("Omniston listener error", e);
					}
				});
			}
		}
	}

	private sendRaw(payload: object) {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
			throw new Error("Omniston WebSocket is not open");
		}
		this.ws.send(JSON.stringify(payload));
	}

	async requestQuote(args: {
		bidAddress: string;
		askAddress: string;
		bidUnits: string;
		walletAddress: string;
		slippageBps?: number;
		timeoutMs?: number;
	}): Promise<Quote | null> {
		const timeoutMs = args.timeoutMs ?? 15000;
		await this.connect();

		const id = ++this.rpcId;
		const params = {
			bid_asset_address: {
				blockchain: TON_CHAIN_ID,
				address: args.bidAddress,
			},
			ask_asset_address: {
				blockchain: TON_CHAIN_ID,
				address: args.askAddress,
			},
			amount: {
				bid_units: args.bidUnits,
			},
			referrer_address: {
				blockchain: TON_CHAIN_ID,
				address: "",
			},
			referrer_fee_bps: 0,
			settlement_methods: [SETTLEMENT_METHOD_SWAP],
			settlement_params: {
				max_price_slippage_bps: args.slippageBps ?? 100,
				max_outgoing_messages: 4,
				gasless_settlement: GASLESS_SETTLEMENT_POSSIBLE,
				flexible_referrer_fee: false,
				wallet_address: {
					blockchain: TON_CHAIN_ID,
					address: args.walletAddress,
				},
			},
		};

		return new Promise<Quote | null>((resolve) => {
			let resolved = false;
			let lastDebug: any = null;
			let handler: ((event: MessageEvent) => void) | null = null;

			const finish = (q: Quote | null) => {
				if (resolved) return;
				resolved = true;
				clearTimeout(timer);
				const ws = this.ws;
				if (ws && handler) {
					ws.removeEventListener("message", handler);
				}
				if (!q) {
					console.warn(
						"[Omniston] no quote received",
						{
							id,
							lastDebug,
							wsState: this.ws?.readyState,
						}
					);
				}
				resolve(q);
			};

			handler = (event: MessageEvent) => {
				let data: any;
				try {
					data = JSON.parse(event.data);
				} catch {
					return;
				}

				if (data?.id === id) {
					lastDebug = { type: "rpc-response", data };
					if (data.error) {
						console.error("[Omniston] quote RPC error", data.error);
						finish(null);
						return;
					}
					const quote =
						extractQuote(data.result) || extractQuote(data);
					if (quote) {
						finish(quote);
					}
					return;
				}

				if (data?.method === "event" || data?.method === "status") {
					const quote =
						extractQuote(data?.params?.result) ||
						extractQuote(data);
					if (quote) {
						finish(quote);
					} else {
						lastDebug = { type: "event-no-quote", data };
					}
				}
			};

			const timer = setTimeout(() => {
				this.pendingRpcs.delete(id);
				finish(null);
			}, timeoutMs);

			if (this.ws) {
				this.ws.addEventListener("message", handler);
			}
			try {
				this.sendRaw({
					jsonrpc: "2.0",
					id,
					method: "v1beta7.quote",
					params,
				});
			} catch (e) {
				console.error("[Omniston] sendRaw failed", e);
				finish(null);
			}
		});
	}

	async buildTransfer(
		quote: Quote,
		walletAddress: string
	): Promise<TransferMessage[]> {
		const result = await this.rpc("v1beta7.transaction.build_transfer", {
			quote,
			source_address: {
				blockchain: TON_CHAIN_ID,
				address: walletAddress,
			},
			destination_address: {
				blockchain: TON_CHAIN_ID,
				address: walletAddress,
			},
			gas_excess_address: {
				blockchain: TON_CHAIN_ID,
				address: walletAddress,
			},
			refund_address: {
				blockchain: TON_CHAIN_ID,
				address: walletAddress,
			},
			use_recommended_slippage: true,
		});

		const messages = result?.ton?.messages;
		if (!Array.isArray(messages) || messages.length === 0) {
			throw new Error("Omniston did not return any transfer messages");
		}
		return messages as TransferMessage[];
	}

	async trackTrade(args: {
		quoteId: string;
		traderWalletAddress: string;
		outgoingTxHash: string;
		onStatus: TradeStatusHandler;
		onError?: (error: string) => void;
	}): Promise<() => void> {
		const result = await this.rpc("v1beta7.trade.track", {
			quote_id: args.quoteId,
			trader_wallet_address: {
				blockchain: TON_CHAIN_ID,
				address: args.traderWalletAddress,
			},
			outgoing_tx_hash: args.outgoingTxHash,
		});

		const subId = String(result?.subscription ?? "");
		if (!subId) {
			throw new Error("No subscription returned from trade.track");
		}

		const handler: Listener = (data) => {
			if (!data) return;

			if (data.error) {
				args.onError?.(
					typeof data.error === "string"
						? data.error
						: JSON.stringify(data.error)
				);
				return;
			}

			const tradeStatuses: TradeStatusType[] = [
				"awaiting_transfer",
				"transferring",
				"swapping",
				"awaiting_fill",
				"claim_available",
				"refund_available",
				"receiving_funds",
				"trade_settled",
			];

			for (const key of tradeStatuses) {
				if (key in data) {
					args.onStatus(key, data[key]);
					return;
				}
			}
		};

		if (!this.listeners.has(subId)) {
			this.listeners.set(subId, new Set());
		}
		this.listeners.get(subId)!.add(handler);

		return () => {
			this.listeners.get(subId)?.delete(handler);
		};
	}

	private rpc(method: string, params: any, timeoutMs = 30000): Promise<any> {
		return new Promise(async (resolve, reject) => {
			try {
				await this.connect();
			} catch (e) {
				reject(e);
				return;
			}

			const id = ++this.rpcId;
			this.pendingRpcs.set(id, { resolve, reject });
			try {
				this.sendRaw({ jsonrpc: "2.0", id, method, params });
			} catch (e) {
				this.pendingRpcs.delete(id);
				reject(e);
				return;
			}

			setTimeout(() => {
				if (this.pendingRpcs.has(id)) {
					this.pendingRpcs.delete(id);
					reject(new Error(`Omniston RPC ${method} timed out`));
				}
			}, timeoutMs);
		});
	}
}

function extractQuote(data: any): Quote | null {
	if (!data || typeof data !== "object") return null;

	if (
		data.quote_id &&
		data.bid_units &&
		data.ask_units &&
		data.params?.swap
	) {
		return data as Quote;
	}

	for (const key of Object.keys(data)) {
		const value = (data as any)[key];
		if (value && typeof value === "object") {
			const found = extractQuote(value);
			if (found) return found;
		}
	}

	return null;
}

export const omniston = new OmnistonClient();
