export type FiatCurrency = "usd" | "eur" | "rub";

const currencySymbols: Record<FiatCurrency, string> = {
	usd: "$",
	eur: "€",
	rub: "₽",
};

const localeMap: Record<FiatCurrency, string> = {
	usd: "en-US",
	eur: "de-DE",
	rub: "ru-RU",
};

export function formatFiat(
	value: number,
	currency: FiatCurrency,
	options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
) {
	const symbol = currencySymbols[currency] ?? "$";
	const locale = localeMap[currency] ?? "en-US";
	return `${symbol}${value.toLocaleString(locale, {
		minimumFractionDigits: options?.minimumFractionDigits ?? 2,
		maximumFractionDigits: options?.maximumFractionDigits ?? 2,
	})}`;
}
