import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { UsernameRegistry } from "./blockchain";

let client: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
	if (client) return client;
	const url = import.meta.env.VITE_SUPABASE_URL;
	const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
	if (!url || !key) {
		console.warn("Supabase env vars missing — username features disabled");
		return null;
	}
	client = createClient(url, key);
	return client;
}

const TABLE = "username_registry";

export async function upsertUsername(
	username: string,
	addresses: UsernameRegistry
): Promise<boolean> {
	const sb = getSupabase();
	if (!sb) return false;

	const cleanUser = username.replace("@", "").trim().toLowerCase();
	if (!cleanUser || cleanUser.length < 3 || cleanUser.length > 32) {
		return false;
	}
	const { error } = await sb.from(TABLE).upsert(
		{
			username: cleanUser,
			ton_address: addresses.ton,
			eth_address: addresses.eth,
			sol_address: addresses.sol,
		},
		{ onConflict: "username" }
	);
	if (error) {
		if (import.meta.env.DEV) {
			console.error("Supabase upsert error:", error);
		} else {
			console.error("Supabase upsert failed");
		}
		return false;
	}
	return true;
}

export async function getUsernameRegistry(
	username: string
): Promise<UsernameRegistry | null> {
	const sb = getSupabase();
	if (!sb) return null;

	const cleanUser = username.replace("@", "").trim().toLowerCase();
	if (!cleanUser || cleanUser.length < 3 || cleanUser.length > 32) {
		return null;
	}
	const { data, error } = await sb
		.from(TABLE)
		.select("ton_address, eth_address, sol_address")
		.eq("username", cleanUser)
		.single();

	if (error || !data) {
		if (error?.code !== "PGRST116") {
			if (import.meta.env.DEV) {
				console.warn("Supabase query error:", error);
			} else {
				console.warn("Supabase query failed");
			}
		}
		return null;
	}

	return {
		ton: data.ton_address || "",
		eth: data.eth_address || "",
		sol: data.sol_address || "",
	};
}
