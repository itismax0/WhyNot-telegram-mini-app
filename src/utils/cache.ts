const CACHE_PREFIX = "w_cache_";

export function getCache<T>(key: string): T | null {
	try {
		const raw = localStorage.getItem(CACHE_PREFIX + key);
		if (!raw) return null;
		const { data, ts, ttl } = JSON.parse(raw);
		if (Date.now() - ts > ttl) {
			localStorage.removeItem(CACHE_PREFIX + key);
			return null;
		}
		return data as T;
	} catch {
		return null;
	}
}

export function setCache<T>(key: string, data: T, ttlMs: number): void {
	try {
		const entry = { data, ts: Date.now(), ttl: ttlMs };
		localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
	} catch {}
}

export async function cachedFetch<T>(
	key: string,
	fetcher: () => Promise<T>,
	ttlMs: number = 5 * 60 * 1000
): Promise<T> {
	const cached = getCache<T>(key);
	if (cached !== null) return cached;
	const data = await fetcher();
	setCache(key, data, ttlMs);
	return data;
}
