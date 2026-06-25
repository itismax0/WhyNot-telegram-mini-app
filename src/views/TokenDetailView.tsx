import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
	ChevronLeft, ChevronDown, Sparkles, ArrowUpRight,
	BarChart3, Clock, RefreshCw, Link, Infinity, Star,
	Globe, TrendingUp, Cpu, Activity, ExternalLink,
} from "lucide-react";
import { useWallet } from "../store/WalletContext";
import { cachedFetch } from "../utils/cache";
import { formatFiat } from "../utils/fiat";

// Binance spot symbol for each token
const BINANCE_SYMBOLS: Record<string, string> = {
	ton: "TONUSDT",
	eth: "ETHUSDT",
	sol: "SOLUSDT",
	btc: "BTCUSDT",
};

// CoinGecko IDs for market metadata (market cap, supply, rank — low-frequency call)
const COINGECKO_IDS: Record<string, string> = {
	ton: "the-open-network",
	eth: "ethereum",
	sol: "solana",
	usdt: "tether",
	btc: "bitcoin",
};

// Cointelegraph RSS feeds for per-coin news (via rss2json, no API key needed)
const NEWS_RSS: Record<string, string> = {
	ton: "https://cointelegraph.com/rss/tag/ton",
	eth: "https://cointelegraph.com/rss/tag/ethereum",
	sol: "https://cointelegraph.com/rss/tag/solana",
	usdt: "https://cointelegraph.com/rss",
	btc: "https://cointelegraph.com/rss/tag/bitcoin",
};

// AI Analysis scores (0-10) — internal mock or real AI data
const AI_SCORES: Record<string, number> = {
	whynot: 9.8, ton: 8.6, eth: 9.1, sol: 8.3, usdt: 7.2, btc: 9.4,
};

const AI_BULLETS: Record<string, { en: string[]; ru: string[] }> = {
	whynot: {
		en: ["Native ecosystem token for WhyNot? Wallet", "Deflationary model with 10% burn on fees", "Exclusive access to premium AI features", "Highest community engagement in TON"],
		ru: ["Нативный токен экосистемы WhyNot? Wallet", "Дефляционная модель: сжигание 10% комиссий", "Эксклюзивный доступ к премиум-функциям AI", "Высочайшая вовлеченность сообщества в TON"],
	},
	ton: {
		en: ["Strong ecosystem backed by TON Foundation", "Active wallets grew +28% in last 30 days", "High developer activity on GitHub", "Volatility below market average"],
		ru: ["Экосистема TON при поддержке TON Foundation", "Рост числа активных кошельков +28% за 30 дней", "Высокая активность разработчиков на GitHub", "Волатильность ниже среднего по рынку"],
	},
	eth: {
		en: ["Largest smart contract ecosystem globally", "ETF approval drives institutional demand", "Staking yield ~4% APR via validators", "Layer-2 adoption accelerating rapidly"],
		ru: ["Крупнейшая экосистема смарт-контрактов в мире", "Одобрение ETF стимулирует институциональный спрос", "Доходность стейкинга ~4% APR через валидаторов", "Ускорение принятия технологий Layer-2"],
	},
	sol: {
		en: ["Fastest layer-1: 65,000 TPS capability", "NFT and DeFi volumes surging in 2025", "Major CEX listings boosting liquidity", "Sub-cent fees attract retail users"],
		ru: ["Самый быстрый layer-1: 65 000 TPS", "Объём NFT и DeFi растёт в 2025 году", "Крупные листинги на биржах повышают ликвидность", "Комиссии менее $0.01 привлекают розничных пользователей"],
	},
	usdt: {
		en: ["Largest stablecoin by market cap globally", "Backed 1:1 by US dollar reserves", "Widely used for on-chain settlements", "Low volatility, ideal for transfers"],
		ru: ["Крупнейший стейблкоин по рыночной капитализации", "Обеспечен 1:1 долларовыми резервами США", "Широко используется для расчётов в сети", "Низкая волатильность, идеален для переводов"],
	},
	btc: {
		en: ["Digital gold: store of value consensus", "Halving cycle drives long-term appreciation", "ETF inflows exceeding $500M per week", "Lightning Network enabling instant payments"],
		ru: ["Цифровое золото: консенсус как средство сбережения", "Цикл халвинга стимулирует долгосрочный рост", "Приток в ETF превысил $500 млн в неделю", "Lightning Network обеспечивает мгновенные платежи"],
	},
};

const ABOUT: Record<string, { en: string; ru: string }> = {
	whynot: {
		en: "WhyNot? Token is the utility and governance token of the WhyNot? ecosystem. It powers the AI assistant features, cloud storage expansions, and rewards active community participants on the TON blockchain.",
		ru: "Токен WhyNot? — это утилитарный токен управления экосистемы WhyNot?. Он обеспечивает работу функций AI-ассистента, расширение облачного хранилища и вознаграждение активных участников сообщества в блокчейне TON.",
	},
	ton: {
		en: "Gram is the native cryptocurrency of the TON blockchain. Used to pay transaction fees, participate in staking and network governance. Fast transactions and high scalability.",
		ru: "Gram — нативная криптовалюта блокчейна TON. Используется для оплаты комиссий, стейкинга и участия в управлении сетью. Быстрые транзакции и высокая масштабируемость.",
	},
	eth: {
		en: "Ethereum is a decentralized, open-source blockchain with smart contract functionality. The native currency Ether fuels the world's largest DeFi and NFT ecosystem.",
		ru: "Ethereum — децентрализованный блокчейн с открытым исходным кодом и поддержкой смарт-контрактов. Нативная валюта Ether обеспечивает крупнейшую экосистему DeFi и NFT.",
	},
	sol: {
		en: "Solana is a high-performance blockchain supporting builders around the world. Known for ultra-fast transactions and near-zero fees, powering the next generation of DeFi.",
		ru: "Solana — высокопроизводительный блокчейн для разработчиков по всему миру. Известен сверхбыстрыми транзакциями и минимальными комиссиями.",
	},
	usdt: {
		en: "Tether (USDT) is the world's most popular stablecoin pegged 1:1 to the US Dollar. Widely used for trading, transfers, and liquidity across all major blockchains.",
		ru: "Tether (USDT) — наиболее популярный стейблкоин в мире, привязанный 1:1 к доллару США. Широко используется для торговли, переводов и ликвидности.",
	},
	btc: {
		en: "Bitcoin is the world's first decentralized cryptocurrency. Often referred to as digital gold, it is used as a store of value and medium of exchange globally.",
		ru: "Bitcoin — первая в мире децентрализованная криптовалюта. Часто называемое цифровым золотом, используется как средство сбережения и обмена.",
	},
};

const NETWORK_INFO: Record<string, { en: string; ru: string }> = {
	whynot: { en: "TON (Jetton)", ru: "TON (Jetton)" },
	ton: { en: "TON Blockchain", ru: "TON Blockchain" },
	eth: { en: "Ethereum", ru: "Ethereum" },
	sol: { en: "Solana", ru: "Solana" },
	usdt: { en: "TON (Jetton)", ru: "TON (Jetton)" },
	btc: { en: "Bitcoin", ru: "Bitcoin" },
};

const BULLET_ICONS = [
	<Globe size={14} className="text-[#007aff]" />,
	<TrendingUp size={14} className="text-[#30d158]" />,
	<Cpu size={14} className="text-[#ff9f0a]" />,
	<Activity size={14} className="text-[#ff453a]" />,
];

type Period = "1" | "7" | "30" | "90" | "365" | "max";
type Tab = "overview" | "news" | "analytics" | "holders" | "about";

interface NewsItem {
	id: string;
	title: string;
	body: string;
	url: string;
	source: string;
	imageUrl: string;
	publishedAt: number;
}

export function fmt(n: number) {
	if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
	if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
	return `$${n.toLocaleString()}`;
}

export function fmtNum(n: number) {
	if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
	if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
	return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function timeAgo(ts: number, isRu: boolean): string {
	const diff = Math.floor((Date.now() / 1000) - ts);
	if (diff < 3600) {
		const m = Math.floor(diff / 60);
		return isRu ? `${m} мин. назад` : `${m}m ago`;
	}
	if (diff < 86400) {
		const h = Math.floor(diff / 3600);
		return isRu ? `${h} ч. назад` : `${h}h ago`;
	}
	const d = Math.floor(diff / 86400);
	return isRu ? `${d} дн. назад` : `${d}d ago`;
}

// Binance interval + limit per period
export function binanceParams(period: Period): { interval: string; limit: number } {
	switch (period) {
		case "1":   return { interval: "1h",  limit: 24 };
		case "7":   return { interval: "4h",  limit: 42 };
		case "30":  return { interval: "1d",  limit: 30 };
		case "90":  return { interval: "1d",  limit: 90 };
		case "365": return { interval: "1d",  limit: 365 };
		case "max": return { interval: "1w",  limit: 200 };
	}
}

export function formatPointDate(timestamp: number, period: Period, isRu: boolean) {
	const date = new Date(timestamp);
	if (period === "1") {
		return date.toLocaleTimeString(isRu ? "ru-RU" : "en-US", { hour: "2-digit", minute: "2-digit" });
	}
	if (period === "7" || period === "30" || period === "90") {
		return date.toLocaleDateString(isRu ? "ru-RU" : "en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
	}
	return date.toLocaleDateString(isRu ? "ru-RU" : "en-US", { year: "numeric", month: "short", day: "numeric" });
}

function SparklineChart({
	data, positive, hoveredIndex, color,
}: {
	data: number[];
	positive: boolean;
	hoveredIndex: number | null;
	color: string;
}) {
	if (data.length < 2) return null;
	const min = Math.min(...data);
	const max = Math.max(...data);
	const W = 340;
	const H = 100;
	const range = max - min || 1;
	const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * (H - 4) - 2}`);
	const linePath = `M ${pts.join(" L ")}`;
	const fillPath = `${linePath} L ${W},${H} L 0,${H} Z`;

	let hoverX = 0;
	let hoverY = 0;
	if (hoveredIndex !== null && hoveredIndex >= 0 && hoveredIndex < data.length) {
		hoverX = (hoveredIndex / (data.length - 1)) * W;
		const hoverVal = data[hoveredIndex];
		hoverY = H - ((hoverVal - min) / range) * (H - 4) - 2;
	}

	return (
		<svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ height: 100 }} preserveAspectRatio="none">
			<defs>
				<linearGradient id={`cg-${positive}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor={color} stopOpacity="0.25" />
					<stop offset="100%" stopColor={color} stopOpacity="0" />
				</linearGradient>
			</defs>
			<path d={fillPath} fill={`url(#cg-${positive})`} />
			<path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			{hoveredIndex !== null && (
				<>
					<line x1={hoverX} y1={0} x2={hoverX} y2={H} stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="3,3" />
					<circle cx={hoverX} cy={hoverY} r="5" fill={color} stroke="#0d0d0f" strokeWidth="2" />
				</>
			)}
		</svg>
	);
}

export const TokenDetailView = () => {
	const { setView, selectedAsset, language, rates, balances, baseCurrency } = useWallet();
	const asset = selectedAsset;
	const isRu = language === "ru";

	const [activeTab, setActiveTab] = useState<Tab>("overview");
	const [period, setPeriod] = useState<Period>("1");
	const [chartPoints, setChartPoints] = useState<[number, number][]>([]);
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const [marketData, setMarketData] = useState<any>(null);
	const [tickerData, setTickerData] = useState<any>(null);
	const [loadingChart, setLoadingChart] = useState(true);
	const [aboutExpanded, setAboutExpanded] = useState(false);
	const [news, setNews] = useState<NewsItem[]>([]);
	const [loadingNews, setLoadingNews] = useState(false);
	const [holderAccounts, setHolderAccounts] = useState<{address: string; balance: number}[] | null>(null);
	const [loadingHolder, setLoadingHolder] = useState(false);

	const binanceSymbol = asset ? BINANCE_SYMBOLS[asset.id] : null;
	const cgId = asset ? COINGECKO_IDS[asset.id] : null;
	const newsRss = asset ? NEWS_RSS[asset.id] : null;
	const price = asset ? (rates[asset.id] || 0) : 0;
	const myBal = asset ? (balances[asset.id] || 0) : 0;

	// Fetch market metadata from CoinGecko (once per asset, low frequency)
	useEffect(() => {
		if (!cgId) return;
		let cancelled = false;
		cachedFetch(
			`cg_market_${cgId}`,
			() => fetch(`https://api.coingecko.com/api/v3/coins/${cgId}?localization=false&tickers=false&community_data=false&developer_data=false`)
				.then(r => r.json()),
			5 * 60 * 1000
		).then((data) => { if (!cancelled) setMarketData(data); }).catch(() => console.warn("TokenDetailView: failed to fetch market data"));
		return () => { cancelled = true; };
	}, [cgId]);

	// Fetch 24h ticker from Binance (change %, volume)
	useEffect(() => {
		if (!binanceSymbol) return;
		let cancelled = false;
		cachedFetch(
			`binance_ticker_${binanceSymbol}`,
			() => fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`)
				.then(r => r.json()),
			5 * 60 * 1000
		).then((data) => { if (!cancelled) setTickerData(data); }).catch(() => console.warn("TokenDetailView: failed to fetch ticker data"));
		return () => { cancelled = true; };
	}, [binanceSymbol]);

	// Fetch top SOL accounts for holder data
	useEffect(() => {
		if (!asset || asset.id !== "sol") return;
		if (activeTab !== "holders") return;
		setLoadingHolder(true);
		cachedFetch(
			"sol_top_accounts",
			() =>
				fetch("https://api.mainnet-beta.solana.com", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						jsonrpc: "2.0",
						id: 1,
						method: "getLargestAccounts",
						params: [{ commitment: "confirmed" }],
					}),
				})
					.then(r => r.json())
					.then(d => (d?.result?.value ?? []).map((a: any) => ({
						address: a.address,
						balance: a.lamports / 1e9,
					}))),
			30 * 60 * 1000,
		)
			.then(setHolderAccounts)
			.catch(() => setHolderAccounts([]))
			.finally(() => setLoadingHolder(false));
	}, [activeTab, asset]);

	// Fetch chart from Binance klines — real data, no rate limits
	useEffect(() => {
		if (!asset) return;
		setLoadingChart(true);
		setChartPoints([]);
		setHoveredIndex(null);

		if (!binanceSymbol) {
			const now = Date.now();
			let pts: [number, number][] = [];
			if (asset.id === "whynot") {
				let currentPrice = 0.065;
				pts = Array.from({ length: 80 }, (_, i) => {
					currentPrice += (Math.random() - 0.4) * 0.001;
					return [now - (80 - i) * 3600000, currentPrice];
				});
			} else {
				pts = Array.from({ length: 80 }, (_, i) => [
					now - (80 - i) * 3600000,
					1 + (Math.random() - 0.5) * 0.002,
				]);
			}
			setChartPoints(pts);
			setLoadingChart(false);
			return;
		}

		const { interval, limit } = binanceParams(period);
		fetch(`https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`)
			.then(r => r.json())
			.then((klines: any[]) => {
				if (Array.isArray(klines) && klines.length > 0) {
					const pts: [number, number][] = klines.map(k => [
						Number(k[0]),        // openTime ms
						parseFloat(k[4]),    // close price
					]);
					setChartPoints(pts);
				}
			})
			.catch(() => console.warn("TokenDetailView: failed to fetch chart data"))
			.finally(() => setLoadingChart(false));
	}, [binanceSymbol, period, asset]);

	const fetchNews = useCallback(() => {
		if (!newsRss) return;
		setLoadingNews(true);
		fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(newsRss)}`)
			.then(r => r.json())
			.then(d => {
				if (d?.status === "ok" && d?.items) {
					setNews(d.items.slice(0, 20).map((item: any) => ({
						id: item.guid,
						title: item.title,
						body: item.description?.replace(/<[^>]*>/g, "").slice(0, 120) + "…",
						url: item.link,
						source: item.author || "Cointelegraph",
						imageUrl: "",
						publishedAt: new Date(item.pubDate).getTime() / 1000,
					})));
				}
			})
			.catch(() => console.warn("TokenDetailView: failed to fetch news"))
			.finally(() => setLoadingNews(false));
	}, [newsRss]);

	useEffect(() => {
		if (activeTab === "news") fetchNews();
	}, [activeTab, fetchNews]);

	useEffect(() => {
		if (!asset) {
			setView("main");
		}
	}, [asset, setView]);

	if (!asset) {
		return null;
	}

	// Prefer Binance ticker for 24h change & volume, fallback to CoinGecko
	const change24h: number | null =
		tickerData?.priceChangePercent != null
			? parseFloat(tickerData.priceChangePercent)
			: marketData?.market_data?.price_change_percentage_24h ?? null;

	const vol24h: number | null =
		tickerData?.quoteVolume != null
			? parseFloat(tickerData.quoteVolume)
			: marketData?.market_data?.total_volume?.usd ?? null;

	const marketCap: number | null = marketData?.market_data?.market_cap?.usd ?? null;
	const circSupply: number | null = marketData?.market_data?.circulating_supply ?? null;
	const maxSupply: number | null = marketData?.market_data?.max_supply ?? null;
	const cmcRank: number | null = marketData?.market_cap_rank ?? null;
	const isPositive = change24h === null ? true : change24h >= 0;
	const trendColor = isPositive ? "#30d158" : "#ff453a";

	const circSupplyVal = circSupply ?? 0;
	const maxSupplyVal = maxSupply ?? 0;
	const supplyPct = maxSupplyVal > 0 ? (circSupplyVal / maxSupplyVal) * 100 : 0;

	const top10Bal = holderAccounts ? holderAccounts.slice(0, 10).reduce((s, a) => s + a.balance, 0) : 0;
	const concentrationPct = circSupplyVal > 0 ? (top10Bal / circSupplyVal) * 100 : null;

	const chartData = chartPoints.map(p => p[1]);

	const handlePointer = (e: React.PointerEvent<HTMLDivElement>) => {
		if (chartPoints.length < 2) return;
		const rect = e.currentTarget.getBoundingClientRect();
		const xPct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
		const idx = Math.round(xPct * (chartPoints.length - 1));
		if (idx >= 0 && idx < chartPoints.length) setHoveredIndex(idx);
	};

	const aiScore = AI_SCORES[asset.id] ?? 7.5;
	const aiColor = aiScore >= 8 ? "#30d158" : aiScore >= 6 ? "#ff9f0a" : "#ff453a";
	const aiLabel = isRu
		? (aiScore >= 8 ? "Высокий" : aiScore >= 6 ? "Средний" : "Низкий")
		: (aiScore >= 8 ? "High" : aiScore >= 6 ? "Medium" : "Low");
	const bullets = (AI_BULLETS[asset.id] ?? AI_BULLETS.ton)[isRu ? "ru" : "en"];
	const aboutText = (ABOUT[asset.id] ?? ABOUT.ton)[isRu ? "ru" : "en"];
	const networkName = (NETWORK_INFO[asset.id] ?? NETWORK_INFO.ton)[isRu ? "ru" : "en"];

	const gaugeR = 44;
	const gaugePerim = 2 * Math.PI * gaugeR;
	const gaugeArc = gaugePerim * 0.75;
	const gaugeFill = gaugeArc * (aiScore / 10);
	const gaugeOffset = -(gaugePerim * 0.25) / 2;

	const TABS = isRu
		? ["Обзор", "Новости", "Аналитика", "Держатели", "О монете"]
		: ["Overview", "News", "Analytics", "Holders", "About"];
	const TAB_KEYS: Tab[] = ["overview", "news", "analytics", "holders", "about"];

	const PERIODS: { label: string; val: Period }[] = [
		{ label: isRu ? "24ч" : "24h", val: "1" },
		{ label: isRu ? "7д" : "7d", val: "7" },
		{ label: isRu ? "30д" : "30d", val: "30" },
		{ label: isRu ? "90д" : "90d", val: "90" },
		{ label: isRu ? "1г" : "1y", val: "365" },
		{ label: isRu ? "Все" : "All", val: "max" },
	];

	const statsGrid = [
		{
			label: isRu ? "Рыночная капитализация" : "Market Cap",
			val: marketCap ? fmt(marketCap, baseCurrency) : "—",
			sub: change24h !== null ? `${isPositive ? "+" : ""}${change24h.toFixed(2)}%` : "",
			subColor: isPositive ? "#30d158" : "#ff453a",
			icon: <BarChart3 size={16} />,
		},
		{
			label: isRu ? "Объём (24ч)" : "Volume (24h)",
			val: vol24h ? fmt(vol24h, baseCurrency) : "—",
			sub: "",
			subColor: "",
			icon: <Clock size={16} />,
		},
		{
			label: isRu ? "Циркулирующее предложение" : "Circulating Supply",
			val: circSupply ? `${fmtNum(circSupply)} ${asset.symbol}` : "—",
			sub: maxSupply ? `${isRu ? "из" : "of"} ${fmtNum(maxSupply)}` : "",
			subColor: "#8e8e93",
			icon: <RefreshCw size={15} />,
		},
		{
			label: isRu ? "Тип сети" : "Network Type",
			val: networkName,
			sub: "",
			subColor: "",
			icon: <Link size={16} />,
		},
		{
			label: isRu ? "Макс. предложение" : "Max Supply",
			val: maxSupply ? fmtNum(maxSupply) : "∞",
			sub: "",
			subColor: "",
			icon: <Infinity size={16} />,
		},
		{
			label: isRu ? "Рейтинг" : "Rank",
			val: cmcRank ? `#${cmcRank}` : "—",
			sub: "",
			subColor: "",
			icon: <Star size={16} />,
		},
	];

	const activePrice = hoveredIndex !== null && chartPoints[hoveredIndex] ? chartPoints[hoveredIndex][1] : price;
	const activeSub = hoveredIndex !== null && chartPoints[hoveredIndex]
		? formatPointDate(chartPoints[hoveredIndex][0], period, isRu)
		: change24h !== null
			? `${isPositive ? "+" : ""}${change24h.toFixed(2)}% ${isRu ? "за 24ч" : "in 24h"}`
			: "";

	const activePriceFormatted = formatFiat(activePrice, baseCurrency, {
		minimumFractionDigits: activePrice >= 1 ? 2 : 6,
		maximumFractionDigits: activePrice >= 1 ? 2 : 6,
	});
	const activePriceSecFormatted = formatFiat(activePrice, baseCurrency, {
		minimumFractionDigits: activePrice >= 1 ? 2 : 6,
		maximumFractionDigits: activePrice >= 1 ? 2 : 6,
	});

	return (
		<motion.div
			initial={{ x: "100%" }}
			animate={{ x: 0 }}
			exit={{ x: "100%" }}
			transition={{ type: "spring", damping: 26, stiffness: 200 }}
			className="flex flex-col min-h-screen bg-black text-white overflow-y-auto"
		>
			{/* Header */}
			<div className="flex items-center justify-between px-4 pt-4 pb-3 sticky top-0 bg-black/95 backdrop-blur-sm z-20">
				<button
					onClick={() => setView("main")}
					className="p-2 bg-[#1c1c1e] rounded-full hover:bg-[#2c2c2e] active:scale-95 transition-all"
				>
					<ChevronLeft size={20} />
				</button>

				<div className="flex flex-col items-center">
					<div className="flex items-center gap-2">
						<img src={asset.icon} alt={asset.symbol} className="w-7 h-7 rounded-full object-contain" />
						<span className="font-semibold text-[17px] leading-tight">{asset.name}</span>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<circle cx="8" cy="8" r="8" fill="#007aff" />
							<path d="M4.5 8l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</div>
					<span className="text-[12px] text-gray-500 font-mono tracking-wider">{asset.symbol}</span>
				</div>

				<div className="w-9 h-9" />
			</div>

			{/* Tabs */}
			<div className="flex border-b border-[#1c1c1e] sticky top-[68px] bg-black z-10 overflow-x-auto no-scrollbar whitespace-nowrap">
				{TABS.map((label, i) => (
					<button
						key={label}
						onClick={() => setActiveTab(TAB_KEYS[i])}
						className={`flex-shrink-0 px-4 py-3 text-[12px] font-medium transition-colors relative ${activeTab === TAB_KEYS[i] ? "text-white" : "text-gray-500"}`}
					>
						{label}
						{activeTab === TAB_KEYS[i] && (
							<motion.div layoutId="tab-bar" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#007aff]" />
						)}
					</button>
				))}
			</div>

			{/* Content */}
			<div className="flex-1 px-4 pb-36">

				{/* OVERVIEW TAB */}
				{activeTab === "overview" && (
					<>
						{/* Price card + chart */}
						<div className="mt-4 bg-[#0d0d0f] rounded-2xl p-4 border border-[#1c1c1e]">
							<p className="text-[12px] text-gray-500 mb-1 uppercase tracking-wider">{isRu ? "Цена" : "Price"}</p>
							<div className="flex items-end justify-between mb-1">
								<h2 className="text-[34px] font-semibold tracking-tight leading-none">
									{activePriceFormatted}
								</h2>
								<span className="text-[12px] font-mono font-semibold bg-[#1c1c1e] px-2.5 py-1 rounded-xl text-gray-300">
									{activePriceSecFormatted}
								</span>
							</div>

							{activeSub && (
								<p className={`text-[14px] font-bold mb-3 ${hoveredIndex !== null ? "text-gray-400 font-normal" : isPositive ? "text-[#30d158]" : "text-[#ff453a]"}`}>
									{activeSub}
								</p>
							)}

							<div
								className="h-[100px] relative overflow-hidden touch-none"
								onPointerDown={handlePointer}
								onPointerMove={handlePointer}
								onPointerLeave={() => setHoveredIndex(null)}
								onPointerUp={() => setHoveredIndex(null)}
							>
								{loadingChart ? (
									<div className="absolute inset-0 flex items-center justify-center">
										<div className="w-5 h-5 border-2 border-[#007aff] border-t-transparent rounded-full animate-spin" />
									</div>
								) : chartData.length >= 2 ? (
									<SparklineChart data={chartData} positive={isPositive} hoveredIndex={hoveredIndex} color={trendColor} />
								) : (
									<div className="absolute inset-0 flex items-center justify-center text-gray-600 text-[12px]">
										{isRu ? "График недоступен" : "Chart unavailable"}
									</div>
								)}
							</div>

							{/* Period selector */}
							<div className="flex gap-1 mt-3">
								{PERIODS.map(p => (
									<button
										key={p.val}
										onClick={() => setPeriod(p.val)}
										className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${period === p.val ? "bg-[#007aff] text-white" : "text-gray-500 hover:text-white"}`}
									>
										{p.label}
									</button>
								))}
							</div>
						</div>

						{/* Stats grid 2×3 */}
						<div className="grid grid-cols-2 gap-3 mt-3">
							{statsGrid.map(item => (
								<div key={item.label} className="bg-[#0d0d0f] rounded-2xl p-3.5 border border-[#1c1c1e]">
									<p className="text-[10px] text-gray-500 mb-1 leading-tight">{item.label}</p>
									<p className="font-bold text-[15px] leading-snug text-white">{item.val}</p>
									{item.sub && (
										<p className="text-[11px] mt-0.5 font-medium" style={{ color: item.subColor || "#8e8e93" }}>
											{item.sub}
										</p>
									)}
									<div className="mt-2 text-[#007aff]">{item.icon}</div>
								</div>
							))}
						</div>

						{/* About (collapsed) */}
						<div className="mt-3 bg-[#0d0d0f] rounded-2xl p-4 border border-[#1c1c1e]">
							<h3 className="font-semibold text-[15px] mb-2">
								{isRu ? `О ${asset.name}` : `About ${asset.name}`}
							</h3>
							<p className={`text-[13px] text-gray-300 leading-relaxed transition-all ${aboutExpanded ? "" : "line-clamp-3"}`}>
								{aboutText}
							</p>
							<button
								onClick={() => setAboutExpanded(v => !v)}
								className="mt-2 flex items-center gap-1 text-gray-500 hover:text-white transition-colors"
							>
								<ChevronDown size={16} className={`transition-transform duration-200 ${aboutExpanded ? "rotate-180" : ""}`} />
							</button>
						</div>

						{/* AI Analysis */}
						<div className="mt-3 bg-[#0d0d0f] rounded-2xl p-4 border border-[#1c1c1e]">
							<div className="flex items-center justify-between mb-4">
								<h3 className="font-semibold text-[15px]">{isRu ? "AI Анализ" : "AI Analysis"}</h3>
								<div className="flex items-center gap-1 text-[11px] text-[#007aff]">
									<Sparkles size={11} />
									<span>{isRu ? "Оценено AI" : "AI Evaluated"}</span>
								</div>
							</div>

							<div className="flex items-start gap-4">
								{/* Gauge SVG */}
								<div className="flex flex-col items-center flex-shrink-0 w-24">
									<svg width="96" height="78" viewBox="0 0 96 78" className="overflow-visible">
										<circle cx="48" cy="48" r={gaugeR} fill="none" stroke="#1c1c1e" strokeWidth="8"
											strokeDasharray={`${gaugeArc} ${gaugePerim}`}
											strokeDashoffset={gaugeOffset}
											strokeLinecap="round"
										/>
										<circle cx="48" cy="48" r={gaugeR} fill="none" stroke={aiColor} strokeWidth="8"
											strokeDasharray={`${gaugeFill} ${gaugePerim}`}
											strokeDashoffset={gaugeOffset}
											strokeLinecap="round"
										/>
										<text x="48" y="44" textAnchor="middle" fill="white" fontSize="19" fontWeight="700" fontFamily="system-ui">{aiScore}</text>
										<text x="48" y="58" textAnchor="middle" fill="#8e8e93" fontSize="9" fontFamily="system-ui">/10</text>
									</svg>
									<p className="text-[10px] text-gray-500 mt-5">{isRu ? "Потенциал" : "Potential"}</p>
									<p className="text-[13px] font-bold mt-0.5" style={{ color: aiColor }}>{aiLabel}</p>
								</div>

								{/* Bullet points */}
								<div className="flex flex-col gap-2.5 flex-1 min-w-0">
									{bullets.map((b, i) => (
										<div key={i} className="flex items-start gap-2">
											<span className="flex-shrink-0 mt-0.5">{BULLET_ICONS[i]}</span>
											<p className="text-[12px] text-gray-300 leading-snug">{b}</p>
										</div>
									))}
								</div>
							</div>
						</div>
					</>
				)}

				{/* NEWS TAB */}
				{activeTab === "news" && (
					<div className="mt-4">
						{loadingNews ? (
							<div className="flex flex-col items-center justify-center py-24 gap-3">
								<div className="w-7 h-7 border-2 border-[#007aff] border-t-transparent rounded-full animate-spin" />
								<p className="text-[13px] text-gray-500">{isRu ? "Загрузка новостей…" : "Loading news…"}</p>
							</div>
						) : news.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-600">
								<Sparkles size={36} />
								<p className="text-[15px] font-semibold text-gray-500">{isRu ? "Новостей нет" : "No news found"}</p>
							</div>
						) : (
							<div className="flex flex-col gap-3">
								{news.map(item => (
									<a
										key={item.id}
										href={item.url}
										target="_blank"
										rel="noreferrer"
										className="bg-[#0d0d0f] rounded-2xl border border-[#1c1c1e] overflow-hidden active:scale-[0.98] transition-transform block"
									>
										{item.imageUrl && (
											<img
												src={item.imageUrl}
												alt={item.title}
												className="w-full h-36 object-cover"
												onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
											/>
										)}
										<div className="p-3.5">
											<div className="flex items-center justify-between mb-1.5">
												<span className="text-[10px] text-[#007aff] font-semibold uppercase tracking-wider">{item.source}</span>
												<span className="text-[10px] text-gray-600">{timeAgo(item.publishedAt, isRu)}</span>
											</div>
											<p className="text-[14px] font-semibold leading-snug text-white mb-1">{item.title}</p>
											<p className="text-[12px] text-gray-400 leading-relaxed line-clamp-2">{item.body}</p>
											<div className="flex items-center gap-1 mt-2 text-[11px] text-[#007aff]">
												<ExternalLink size={11} />
												<span>{isRu ? "Читать далее" : "Read more"}</span>
											</div>
										</div>
									</a>
								))}
							</div>
						)}
					</div>
				)}

				{/* ABOUT TAB */}
				{activeTab === "about" && (
					<div className="mt-4 space-y-3">
						<div className="bg-[#0d0d0f] rounded-2xl p-4 border border-[#1c1c1e]">
							<h3 className="font-semibold text-[15px] mb-3">{isRu ? `О ${asset.name}` : `About ${asset.name}`}</h3>
							<p className="text-[13px] text-gray-300 leading-relaxed">{aboutText}</p>
						</div>
						<div className="bg-[#0d0d0f] rounded-2xl p-4 border border-[#1c1c1e] space-y-3">
							{[
								{ label: isRu ? "Тикер" : "Ticker", val: asset.symbol },
								{ label: isRu ? "Сеть" : "Network", val: networkName },
								{ label: isRu ? "Рейтинг" : "Rank", val: cmcRank ? `#${cmcRank}` : "—" },
								{ label: isRu ? "Мой баланс" : "My Balance", val: `${myBal.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${asset.symbol}` },
								{ label: isRu ? "Стоимость" : "Value", val: formatFiat(myBal * price, baseCurrency) },
							].map(row => (
								<div key={row.label} className="flex justify-between items-center border-b border-[#1c1c1e] last:border-0 pb-2.5 last:pb-0">
									<span className="text-[13px] text-gray-500">{row.label}</span>
									<span className="text-[13px] font-semibold">{row.val}</span>
								</div>
							))}
						</div>
					</div>
				)}

				{/* PLACEHOLDER TABS */}
				{activeTab === "analytics" && (
					<div className="flex flex-col items-center justify-center py-28 gap-3 text-gray-600">
						<Sparkles size={36} />
						<p className="text-[16px] font-semibold text-gray-500">{isRu ? "Скоро" : "Coming soon"}</p>
						<p className="text-[13px] text-center px-10 text-gray-600">{isRu ? "Этот раздел находится в разработке" : "This section is under development"}</p>
					</div>
				)}

				{/* HOLDERS TAB */}
				{activeTab === "holders" && (
					<div className="mt-4 space-y-3">
						<div className="bg-[#0d0d0f] rounded-2xl p-4 border border-[#1c1c1e] space-y-3">
							<h3 className="font-semibold text-[15px]">{isRu ? "Предложение" : "Supply"}</h3>
							<div className="space-y-2">
								<div className="flex justify-between text-[13px]">
									<span className="text-gray-500">{isRu ? "В обращении" : "Circulating"}</span>
									<span className="font-semibold">{fmtNum(circSupplyVal)} {asset.symbol}</span>
								</div>
								{maxSupplyVal > 0 && (
									<>
										<div className="flex justify-between text-[13px]">
											<span className="text-gray-500">{isRu ? "Всего" : "Max Supply"}</span>
											<span className="font-semibold">{fmtNum(maxSupplyVal)} {asset.symbol}</span>
										</div>
										<div className="w-full h-2 bg-[#1c1c1e] rounded-full overflow-hidden">
											<div className="h-full bg-[#007aff] rounded-full transition-all" style={{ width: `${Math.min(supplyPct, 100)}%` }} />
										</div>
										<div className="flex justify-between text-[12px]">
											<span className="text-gray-600">{supplyPct.toFixed(1)}% {isRu ? "в обращении" : "circulating"}</span>
											<span className="text-gray-600">{fmtNum(maxSupplyVal - circSupplyVal)} {isRu ? "не выпущено" : "unissued"}</span>
										</div>
									</>
								)}
							</div>
							<div className="pt-1 space-y-2">
								<div className="flex justify-between text-[13px]">
									<span className="text-gray-500">{isRu ? "Капитализация" : "Market Cap"}</span>
			<span className="font-semibold">{marketCap ? fmt(marketCap, baseCurrency) : "—"}</span>
								</div>
								<div className="flex justify-between text-[13px]">
									<span className="text-gray-500">{isRu ? "Рейтинг" : "Rank"}</span>
									<span className="font-semibold">{cmcRank ? `#${cmcRank}` : "—"}</span>
								</div>
							</div>
						</div>

						<div className="bg-[#0d0d0f] rounded-2xl p-4 border border-[#1c1c1e] space-y-3">
							<h3 className="font-semibold text-[15px]">{isRu ? "Киты" : "Whales"}</h3>
							{asset.id === "sol" ? (
								loadingHolder ? (
									<div className="flex items-center justify-center py-8">
										<div className="w-6 h-6 border-2 border-[#007aff] border-t-transparent rounded-full animate-spin" />
									</div>
								) : holderAccounts && holderAccounts.length > 0 ? (
									<>
										<div className="flex justify-between text-[13px]">
											<span className="text-gray-500">{isRu ? "Концентрация топ-10" : "Top-10 Concentration"}</span>
											<span className="font-semibold text-[#ff9f0a]">{concentrationPct !== null ? `${concentrationPct.toFixed(1)}%` : "—"}</span>
										</div>
										<div className="flex justify-between text-[13px]">
											<span className="text-gray-500">{isRu ? "Баланс топ-10" : "Top-10 Balance"}</span>
											<span className="font-semibold">{fmtNum(top10Bal)} SOL</span>
										</div>
										<div className="pt-2 space-y-1.5">
											{holderAccounts.slice(0, 10).map((acc, i) => {
												const pct = circSupplyVal > 0 ? (acc.balance / circSupplyVal) * 100 : 0;
												return (
													<div key={acc.address} className="flex items-center gap-2 text-[12px]">
														<span className="w-4 text-gray-500 text-right">{i + 1}</span>
														<span className="text-gray-400 font-mono truncate flex-1">{acc.address.slice(0, 8)}...{acc.address.slice(-6)}</span>
														<span className="font-semibold">{fmtNum(acc.balance)}</span>
														<span className="text-gray-500 w-10 text-right">{pct.toFixed(1)}%</span>
														<div className="w-16 h-1.5 bg-[#1c1c1e] rounded-full overflow-hidden">
															<div className="h-full bg-[#ff9f0a] rounded-full" style={{ width: `${Math.min(pct * 5, 100)}%` }} />
														</div>
													</div>
												);
											})}
										</div>
									</>
								) : (
									<p className="text-[13px] text-gray-500 text-center py-4">{isRu ? "Данные временно недоступны" : "Data temporarily unavailable"}</p>
								)
							) : (
								<p className="text-[13px] text-gray-500 text-center py-4">
									{isRu
										? "Данные о держателях пока недоступны для этого актива"
										: "Holder data is not yet available for this asset"}
								</p>
							)}
						</div>
					</div>
				)}
			</div>

			{/* Bottom CTA */}
			<div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-6 pt-4 bg-gradient-to-t from-black via-black/95 to-transparent z-20">
				<div className="flex gap-3">
					<button
						onClick={() => setView("send")}
						className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#1c1c1e] hover:bg-[#2c2c2e] active:scale-95 transition-all rounded-2xl font-semibold text-[15px]"
					>
						<ArrowUpRight size={18} />
						{isRu ? "Отправить" : "Send"}
					</button>
					<button className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#007aff] hover:bg-[#0a84ff] active:scale-95 transition-all rounded-2xl font-semibold text-[15px]">
						<span className="text-[18px] leading-none">+</span>
						{isRu ? `Купить ${asset.symbol}` : `Buy ${asset.symbol}`}
					</button>
				</div>
			</div>
		</motion.div>
	);
};
