import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

const XROCKET_PAY_BASE = "https://pay.api.xrocket.exchange/api/v1";
const XROCKET_EXCHANGE_BASE = "https://api.xrocket.exchange/api/v1";
const API_KEY = Deno.env.get("XROCKET_API_KEY") ?? "";

serve(async (req) => {
	const cors = handleCors(req);
	if (cors) return cors;

	try {
		const { action, payload } = await req.json();

		if (!API_KEY) {
			return new Response(JSON.stringify({ error: "xRocket API key not configured" }), {
				status: 500,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		const endpointMap: Record<string, string> = {
			create_invoice: `${XROCKET_PAY_BASE}/invoices`,
			get_invoice: `${XROCKET_PAY_BASE}/invoices/${payload?.id || ""}`,
			create_withdrawal: `${XROCKET_PAY_BASE}/withdrawals`,
			create_transfer: `${XROCKET_PAY_BASE}/transfers`,
			get_rates: `${XROCKET_PAY_BASE}/rates`,
			get_currencies: `${XROCKET_PAY_BASE}/currencies`,
			get_balance: `${XROCKET_EXCHANGE_BASE}/account/balance`,
		};

		const endpoint = endpointMap[action];
		if (!endpoint) {
			return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
				status: 400,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		const isGet = action === "get_invoice" || action === "get_rates" || action === "get_currencies" || action === "get_balance";

		const response = await fetch(endpoint, {
			method: isGet ? "GET" : "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": API_KEY,
			},
			body: isGet ? undefined : JSON.stringify(payload),
		});

		const data = await response.json();

		return new Response(JSON.stringify(data), {
			status: response.status,
			headers: { ...corsHeaders, "Content-Type": "application/json" },
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: String(err) }), {
			status: 500,
			headers: { ...corsHeaders, "Content-Type": "application/json" },
		});
	}
});
