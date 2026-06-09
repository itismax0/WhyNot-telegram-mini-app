const CACHE_PREFIX = "w_cache_";
const inflight = new Map<string, Promise<any>>();

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
	} catch {
		/* localStorage quota / disabled */
	}
}

export async function cachedFetch<T>(
	key: string,
	fetcher: () => Promise<T>,
	ttlMs: number = 5 * 60 * 1000
): Promise<T> {
	const cached = getCache<T>(key);
	if (cached !== null) return cached;
	const existing = inflight.get(key);
	if (existing) return existing as Promise<T>;
	const promise = fetcher().then((data) => {
		setCache(key, data, ttlMs);
		inflight.delete(key);
		return data;
	}).catch((err) => {
		inflight.delete(key);
		throw err;
	});
	inflight.set(key, promise);
	return promise;
}

export function removeCache(key: string): void {
	try {
		localStorage.removeItem(CACHE_PREFIX + key);
	} catch {
		/* localStorage quota / disabled */
	}
}
