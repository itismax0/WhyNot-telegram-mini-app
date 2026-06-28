import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

const KRIPICARD_BASE = "https://home.kripicard.com/api/v1";
const API_KEY = Deno.env.get("KRIPICARD_API_KEY") ?? "";

serve(async (req) => {
	const cors = handleCors(req);
	if (cors) return cors;

	try {
		const { action, payload } = await req.json();

		if (!API_KEY) {
			return new Response(JSON.stringify({ error: "Kripicard API key not configured" }), {
				status: 500,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		const endpointMap: Record<string, string> = {
			create_card: `${KRIPICARD_BASE}/Create_card`,
			fund_card: `${KRIPICARD_BASE}/Fund_Card`,
			get_card: `${KRIPICARD_BASE}/Get_CardDetails`,
			freeze_unfreeze: `${KRIPICARD_BASE}/Freeze_Unfreeze`,
		};

		const endpoint = endpointMap[action];
		if (!endpoint) {
			return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
				status: 400,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		const response = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": API_KEY,
			},
			body: JSON.stringify(payload),
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
