import { Children, useEffect, useRef, useState } from "react";

function useInView(options) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05, ...options }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView];
}

function formatUsd(n) {
  if (n == null || Number.isNaN(n)) return null;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${Math.round(n)}`;
}

// Polls Dexscreener for a live market cap once a real contract is configured.
// Pre-launch (contract === "TBA") it does nothing and the placeholder is shown.
function useLiveMarketCap(refreshMs = 30000) {
  const [data, setData] = useState(null);
  useEffect(() => {
    const contract = token.contract;
    const isAddress =
      contract && contract !== "TBA" && /^(0x)?[a-zA-Z0-9]{25,}$/.test(contract);
    if (!isAddress) return;

    let active = true;
    const controller = new AbortController();

    const load = async () => {
      try {
        const url =
          token.pairAddress && token.chainId
            ? `https://api.dexscreener.com/latest/dex/pairs/${token.chainId}/${token.pairAddress}`
            : `https://api.dexscreener.com/latest/dex/tokens/${contract}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) return;
        const json = await res.json();
        const pairs = json?.pairs || (json?.pair ? [json.pair] : []);
        if (!pairs.length) return;
        const best = pairs.reduce((a, b) =>
          (b?.liquidity?.usd || 0) > (a?.liquidity?.usd || 0) ? b : a
        );
        const marketCap = best.marketCap ?? best.fdv ?? null;
        const change24h = best.priceChange?.h24 ?? null;
        if (active && marketCap != null) setData({ marketCap, change24h });
      } catch {
        /* network/abort errors ignored; keep last known value */
      }
    };

    load();
    const id = window.setInterval(load, refreshMs);
    return () => {
      active = false;
      controller.abort();
      window.clearInterval(id);
    };
  }, [refreshMs]);
  return data;
}

/* ------------------------------------------------------------------ *
 * Data
 * ------------------------------------------------------------------ */
const token = {
  ticker: "$ROTH",
  chain: "Robinhood Chain",
  contract: "TBA",
  buyUrl: "#",
  chartUrl: "#",
  swapUrl: "#",
  bridgeUrl: "#",
  supply: "1B",
  // Live market data (Dexscreener). On launch, set `contract` to the real token
  // address. Optionally pin an exact market by also setting both `chainId`
  // (Dexscreener chain slug, e.g. "arbitrum") and `pairAddress`.
  chainId: "",
  pairAddress: "",
};

const socials = {
  x: { label: "X", href: "https://x.com/roth6900", note: "Follow @Roth6900" },
  dexscreener: { label: "Dexscreener", href: "#", note: "TODO: chart link" },
};

const navLinks = [
  { label: "Manifesto", href: "#manifesto" },
  { label: "Buy", href: "#buy" },
  { label: "Tokenomics", href: "#tokenomics" },
  { label: "Community", href: "#community" },
];

const marqueeItems = [
  "ROTH6900",
  "FIRST ROTH IRA MEMECOIN",
  "ON ROBINHOOD CHAIN",
  "NUMBER GO UP UNTIL AGE 59.5",
  "TAX ADVANTAGE? NO. MEME ADVANTAGE? YES.",
  "CONTRACT TBA",
  "BELIEVE IN THE CANDLE",
];

const manifesto = [
  {
    n: "01",
    title: "You were sold a lie.",
    body: "They told you to dollar-cost average, wait forty years, and be grateful for retirement. Roth6900 is the complete opposite. Buy. Get rich quick. Retire.",
  },
  {
    n: "02",
    title: "A Roth IRA is not Roth6900.",
    body: "A Roth IRA locks your money up until 59½, caps what you can put in, and pays you back with a slow, modest tax break. Roth6900 is the opposite: no age gate, no contribution limit, no forty-year wait, just belief, green candles, and a meme that compounds.",
  },
  {
    n: "03",
    title: "This is not financial advice.",
    body: "Roth6900 is not a retirement product and gives you no IRA benefits.",
  },
];

const checklist = [
  {
    n: "01",
    title: "Set up your wallet",
    body: "Grab a self-custody wallet that connects to Robinhood Chain.",
    href: "#",
  },
  {
    n: "02",
    title: "Fund it",
    body: "Bridge or move funds onto Robinhood Chain once liquidity is live.",
    href: token.bridgeUrl,
  },
  {
    n: "03",
    title: "Buy $ROTH",
    body: "Swap into Roth6900 through the official link once the contract is live.",
    href: token.swapUrl,
  },
  {
    n: "04",
    title: "Retire",
    body: "Copy the contract, verify the chart, and let Roth6900 handle the retiring.",
    href: token.chartUrl,
  },
];

const tokenomicsRows = [
  { label: "Ticker", value: token.ticker, note: "The official Roth6900 ticker" },
  { label: "Supply", value: token.supply, note: "Fixed supply — no minting, ever" },
  { label: "Tax", value: "0%", note: "Zero buy and sell tax" },
  { label: "LP", value: "Locked", note: "Liquidity locked at launch" },
];

function makeSpark(seed, bias) {
  return Array.from({ length: 26 }, (_, r) => {
    const wave = Math.sin((r + seed) * 0.65) * 9 + Math.cos((r + seed) * 0.31) * 5;
    return Math.max(4, 48 + wave + (bias * r) / 25);
  });
}

const ledger = [
  { label: "Meme cap", value: "$690K", change: "+69.00%", up: true, spark: makeSpark(3, 24) },
  { label: "Retirement age", value: "NOW", change: "vesting in belief", up: true, spark: makeSpark(9, 10) },
  { label: "Tax benefit", value: "0", change: "not a real IRA", up: false, spark: makeSpark(14, -8) },
  { label: "Chain status", value: "LIVE", change: "mainnet", up: true, spark: makeSpark(21, 18) },
];

const distribution = [
  socials.x,
  socials.dexscreener,
  { label: "Buy", href: token.buyUrl, note: "TODO: buy link" },
  { label: "Swap", href: token.swapUrl, note: "TODO: swap link" },
  { label: "Bridge", href: token.bridgeUrl, note: "TODO: bridge link" },
];

const disclaimer =
  "Roth6900 is an independent community meme token concept. It is not affiliated with Robinhood, the IRS, or any retirement, brokerage, securities, or tax authority. Roth6900 is not a Roth IRA, does not provide tax benefits, and is not financial, investment, legal, or tax advice. Crypto assets are volatile. Verify the contract before interacting with any token or link.";

/* ------------------------------------------------------------------ *
 * Reusable pieces
 * ------------------------------------------------------------------ */
function Reveal({ children, delay = 0, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "reveal-in" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}

function StaggerReveal({ children, step = 0.06, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={className}>
      {Children.map(children, (child, i) => (
        <div
          className={`reveal ${inView ? "reveal-in" : ""}`}
          style={{ transitionDelay: `${i * step}s` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

function Sparkline({ data, up, className = "" }) {
  const min = Math.min(...data);
  const range = Math.max(...data) - min || 1;
  const line = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const yy = 30 - ((d - min) / range) * 26 - 2;
      return [x, yy];
    })
    .map(([x, yy], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${yy.toFixed(1)}`)
    .join(" ");
  const area = `${line} L100 30 L0 30 Z`;
  const color = up ? "#96D002" : "#FF4D4D";
  const id = `sp-${up ? "u" : "d"}-${data[0].toFixed(0)}-${data.length}`;
  return (
    <svg viewBox="0 0 100 30" className={className} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function ContractCopy({ value, label = "CONTRACT", className = "" }) {
  const [copied, setCopied] = useState(false);
  const shortValue =
    value.length > 18 ? `${value.slice(0, 8)}...${value.slice(-6)}` : value;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <button
      onClick={copy}
      className={`btn-print group inline-flex max-w-full items-center gap-2 bg-paper px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-ink hover:bg-cream ${className}`}
      aria-label={`Copy ${label}`}
    >
      <span className="text-ink/55">{label}</span>
      <span className="break-all font-bold text-ink">{shortValue}</span>
      <span className={`text-[10px] ${copied ? "text-rh" : "text-red"}`}>
        {copied ? "COPIED" : "COPY"}
      </span>
    </button>
  );
}

function FormField({ n, label, value }) {
  return (
    <div className="border-b border-ink pb-2">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
        <span className="mr-2 text-ink/35">{n}</span>
        {label}
      </div>
      <div className="mt-1 break-words font-serif text-2xl font-black leading-none">{value}</div>
    </div>
  );
}

function CheckLine({ text }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-4 w-4 place-items-center border border-ink bg-rh text-[9px] text-ink">
        ✓
      </span>
      <span>{text}</span>
    </div>
  );
}

function ApprovedStamp({ className = "" }) {
  return (
    <svg viewBox="0 0 120 120" className={`stamp-ink ${className}`} aria-label="Approved, not real">
      <defs>
        <path id="stamp-arc-top" d="M 60 60 m -44 0 a 44 44 0 1 1 88 0" fill="none" />
        <path id="stamp-arc-bot" d="M 60 60 m -44 0 a 44 44 0 1 0 88 0" fill="none" />
      </defs>
      <g stroke="#96D002" fill="none">
        <circle cx="60" cy="60" r="56" strokeWidth="3" strokeDasharray="3 2" />
        <circle cx="60" cy="60" r="50" strokeWidth="1.5" />
        <circle cx="60" cy="60" r="32" strokeWidth="1.5" />
      </g>
      <text
        fontFamily="IBM Plex Mono, monospace"
        fontSize="10.5"
        fontWeight="700"
        fill="#96D002"
        letterSpacing="2.5"
      >
        <textPath href="#stamp-arc-top" startOffset="50%" textAnchor="middle">
          ★ APPROVED ★
        </textPath>
      </text>
      <text
        fontFamily="IBM Plex Mono, monospace"
        fontSize="10.5"
        fontWeight="700"
        fill="#96D002"
        letterSpacing="2.5"
      >
        <textPath href="#stamp-arc-bot" startOffset="50%" textAnchor="middle">
          NOT REAL · NOT ADVICE
        </textPath>
      </text>
      <text x="60" y="57" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="17" fontWeight="900" fill="#96D002">
        6900-R
      </text>
      <text x="60" y="72" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="8" fill="#96D002">
        JUL 2026
      </text>
    </svg>
  );
}

function Barcode({ className = "" }) {
  const widths = [3, 1, 2, 1, 4, 1, 1, 2, 3, 1, 2, 4, 1, 1, 3, 2, 1, 1, 2, 1, 3, 1, 4, 2, 1, 3, 1, 2];
  let x = 0;
  return (
    <svg viewBox="0 0 100 24" className={className} preserveAspectRatio="none" aria-hidden="true">
      {widths.map((w, i) => {
        const rect = (
          <rect key={i} x={x} y={0} width={w} height={i % 7 === 0 ? 24 : 20} fill="#11120f" />
        );
        x += w + 1.4;
        return rect;
      })}
      <text x={0} y={23.5} fontFamily="IBM Plex Mono, monospace" fontSize="4.5" fill="#11120f">
        R O T H 6 9 0 0
      </text>
    </svg>
  );
}

function Certificate() {
  return (
    <svg
      viewBox="0 0 360 430"
      className="h-full min-h-[24rem] w-full border border-ink bg-paper"
      aria-label="Roth6900 prospectus certificate"
    >
      <rect width="360" height="430" fill="#fffdf4" />
      <path d="M26 28H334V402H26Z" fill="none" stroke="#11120f" strokeWidth="3" />
      <path d="M32 34H328V396H32Z" fill="none" stroke="#11120f" strokeWidth="1" />
      <path d="M48 62H312M48 100H220M48 346H312M48 370H260" stroke="#11120f" strokeWidth="1.5" />
      <text x="48" y="146" fontFamily="Fraunces, serif" fontSize="58" fontWeight="900" fill="#11120f">
        ROTH
      </text>
      <text x="48" y="202" fontFamily="Fraunces, serif" fontSize="58" fontWeight="900" fill="#96D002">
        6900
      </text>
      <path
        className="draw-path"
        pathLength="1"
        d="M48 290 C83 278 81 244 116 239 C151 234 145 205 183 198 C221 191 218 151 254 143 C286 136 299 105 318 91"
        fill="none"
        stroke="#96D002"
        strokeWidth="7"
        strokeLinecap="square"
      />
      <circle cx="250" cy="272" r="50" fill="none" stroke="#96D002" strokeWidth="2" strokeDasharray="3 2" />
      <circle cx="250" cy="272" r="44" fill="none" stroke="#96D002" strokeWidth="1.5" />
      <text x="250" y="266" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="13" fontWeight="700" fill="#96D002">
        FILED
      </text>
      <text x="250" y="284" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="9" fill="#96D002">
        BY MEMES
      </text>
    </svg>
  );
}

function TokenomicsChart() {
  const bars = [110, 82, 144, 56, 94, 120];
  return (
    <svg viewBox="0 0 520 220" className="h-56 w-full" aria-label="Roth6900 tokenomics sheet chart">
      <rect width="520" height="220" fill="#fff8e7" />
      <path
        d="M32 34H488M32 74H488M32 114H488M32 154H488M32 194H488"
        stroke="#11120f"
        strokeOpacity="0.16"
      />
      {[72, 148, 224, 300, 376, 452].map((cx, i) => (
        <rect key={cx} x={cx - 18} y={188 - bars[i]} width="36" height={bars[i]} fill="#96D002" />
      ))}
      <path
        d="M54 170 C120 150 151 92 224 78 C302 63 340 119 452 64"
        fill="none"
        stroke="#11120f"
        strokeWidth="4"
      />
      <text x="32" y="24" fontFamily="IBM Plex Mono, monospace" fontSize="12" fontWeight="700" fill="#11120f">
        IMAGINARY SUPPLY LEDGER / FIXED PLACEHOLDER
      </text>
      <text x="32" y="214" fontFamily="IBM Plex Mono, monospace" fontSize="10" fill="#11120f">
        1,000,000,000 SUPPLY · 0% TAX PLACEHOLDER · LP PROOF TODO
      </text>
    </svg>
  );
}

function Section({ id, eyebrow, page, title, children }) {
  return (
    <section id={id} className="relative border-b-2 border-ink px-4 py-16 sm:py-20">
      <div className="relative mx-auto max-w-page">
        <Reveal className="mb-10">
          <div className="flex items-baseline justify-between gap-4 border-b border-ink pb-2 font-mono text-[11px] font-bold uppercase tracking-[0.3em]">
            <span className="text-rh">{eyebrow}</span>
            <span className="tabular-nums text-ink/40">Page {page} of 6</span>
          </div>
          <h2 className="mt-6 max-w-5xl font-serif text-5xl font-black leading-[0.92] sm:text-7xl">
            {title}
          </h2>
        </Reveal>
        {children}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Sections
 * ------------------------------------------------------------------ */
function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-[60] bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-page items-center justify-between gap-4 px-4 py-3">
        <a href="#top" className="flex items-center" aria-label="Roth6900 home">
          <img src="/roth6900-logo.png" alt="Roth6900" className="h-9 w-auto shrink-0" />
        </a>
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink/60 underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={token.chartUrl}
            className="btn-print hidden bg-paper px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] hover:bg-ink hover:text-paper sm:inline-flex"
          >
            Chart
          </a>
          <a
            href={token.buyUrl}
            className="btn-print bg-rh px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-ink hover:bg-ink hover:text-paper"
          >
            Buy {token.ticker}
          </a>
        </div>
      </div>
      <div className="border-b-2 border-ink" />
      <div className="mt-[2px] border-b border-ink" />
    </header>
  );
}

function HeroForm() {
  return (
    <div className="relative mx-auto max-w-xl">
      <div className="absolute -right-3 top-6 hidden h-full w-full rotate-2 border border-ink/60 bg-greenpaper sm:block" />
      <div className="absolute -left-3 top-3 hidden h-full w-full -rotate-1 border border-ink/60 bg-cream sm:block" />
      <div className="relative border-2 border-ink bg-paper shadow-sheet">
        <div className="grid grid-cols-[2rem_1fr]">
          <div className="perf border-r border-dashed border-ink/40" aria-hidden="true" />
          <div className="p-5">
            <div className="flex items-start justify-between gap-4 border-b-2 border-ink pb-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
                  Individual Meme Retirement Arrangement
                </div>
                <div className="mt-1 font-serif text-4xl font-black leading-none">Form 6900-R</div>
                <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-ink/45">
                  Rev. July 2026 · OMB No. 6900-0069
                </div>
              </div>
              <ApprovedStamp className="thunk h-24 w-24 shrink-0" />
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_0.92fr]">
              <div className="space-y-3">
                <FormField n="1" label="Ticker requested" value={token.ticker} />
                <FormField n="2" label="Chain" value={token.chain} />
                <FormField n="3" label="Contribution" value="$6,900 vibes" />
                <div className="border border-ink bg-cream p-3">
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
                    Part II — Risk acknowledgement
                  </div>
                  <div className="space-y-2 font-mono text-[11px] uppercase">
                    <CheckLine text="Not a Roth IRA" />
                    <CheckLine text="No tax advantage" />
                    <CheckLine text="Verify contract" />
                  </div>
                </div>
              </div>
              <Certificate />
            </div>
            <div className="mt-6">
              <div className="h-9 border-b-2 border-ink font-mono text-sm leading-9 tabular-nums">
                07 / 07 / 2026
              </div>
              <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-ink/45">
                Date filed
              </div>
            </div>
            <div className="mt-5 flex items-end justify-between gap-4 border-t border-ink pt-3">
              <Barcode className="h-8 w-40" />
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink/45">
                Do not detach
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <main id="top" className="relative border-b-2 border-ink px-4 pt-28">
      <div className="relative mx-auto grid max-w-page items-center gap-12 pb-16 lg:min-h-[86svh] lg:grid-cols-[1.02fr_0.98fr]">
        <section>
          <div className="rise inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/70">
            <span className="h-2 w-2 bg-rh" />
            First Roth IRA on {token.chain}
          </div>
          <h1 className="rise mt-6 font-serif text-[clamp(4.2rem,11vw,11rem)] font-black leading-[0.8] [animation-delay:90ms]">
            Roth<span className="block text-rh">6900</span>
          </h1>
          <p className="rise mt-7 max-w-2xl font-serif text-3xl font-bold leading-[1.05] sm:text-[2.6rem] [animation-delay:180ms]">
            Don't buy a Roth IRA. Buy <em className="text-rh">Roth6900</em> and retire.
          </p>
          <div className="rise mt-8 flex flex-col gap-3 sm:flex-row [animation-delay:340ms]">
            <a
              href={token.buyUrl}
              className="btn-print bg-rh px-6 py-4 text-center font-mono text-xs font-bold uppercase tracking-[0.16em] text-ink hover:bg-ink hover:text-paper"
            >
              File contribution
            </a>
            <a
              href={token.chartUrl}
              className="btn-print bg-paper px-6 py-4 text-center font-mono text-xs font-bold uppercase tracking-[0.16em] hover:bg-ink hover:text-paper"
            >
              View price form
            </a>
          </div>
          <div className="rise mt-6 [animation-delay:420ms]">
            <ContractCopy value={token.contract} label="CONTRACT TODO" />
          </div>
        </section>
        <Reveal className="relative">
          <HeroForm />
        </Reveal>
      </div>
    </main>
  );
}

function Marquee() {
  const items = [...marqueeItems, ...marqueeItems];
  return (
    <section className="overflow-hidden border-b-2 border-ink bg-ink py-3 text-paper">
      <div className="animate-drift flex w-max whitespace-nowrap font-mono text-sm font-bold uppercase tracking-[0.16em]">
        {items.map((e, i) => (
          <span key={`${e}-${i}`} className="flex items-center gap-4 px-4">
            <span className="text-rh2">◆</span>
            {e}
          </span>
        ))}
      </div>
    </section>
  );
}

function Manifesto() {
  return (
    <Section id="manifesto" eyebrow="Part I" page="2" title="Statement of meme purpose.">
      <div className="margin-line border-2 border-ink bg-paper">
        {manifesto.map((item, i) => (
          <Reveal key={item.n} delay={i * 0.05}>
            <article className="grid gap-4 border-b border-ink px-6 py-7 pl-14 last:border-b-0 lg:grid-cols-[8rem_1fr_10rem]">
              <div className="font-mono text-sm font-bold tabular-nums text-rh">§ 1.0{i + 1}</div>
              <div>
                <h3 className="font-serif text-3xl font-black leading-none">{item.title}</h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/70">{item.body}</p>
              </div>
              <div className="hidden self-end lg:block">
                <div className="h-7 border-b border-ink" />
                <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-ink/40">
                  Initial here
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function Ledger() {
  const live = useLiveMarketCap();
  const isLive = live?.marketCap != null;

  const rows = ledger.map((row) => {
    if (row.label === "Meme cap" && isLive) {
      const change =
        live.change24h != null
          ? `${live.change24h >= 0 ? "+" : ""}${live.change24h.toFixed(2)}%`
          : row.change;
      return {
        ...row,
        value: formatUsd(live.marketCap) ?? row.value,
        change,
        up: live.change24h != null ? live.change24h >= 0 : row.up,
        live: true,
      };
    }
    return row;
  });

  return (
    <section className="border-b-2 border-ink bg-cream px-4 py-10">
      <div className="mx-auto max-w-page">
        <div className="mb-3 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50">
          <span>Ledger of imaginary performance</span>
          <span>{isLive ? "Live · Dexscreener" : "Unaudited · obviously"}</span>
        </div>
        <div className="border-2 border-ink bg-paper">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-ink px-5 py-4 last:border-b-0 sm:grid-cols-[1.2fr_1fr_auto_auto]"
            >
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink/60">
                <span className="mr-2 tabular-nums text-ink/35">{String(i + 1).padStart(2, "0")}</span>
                {row.label}
                {row.live && (
                  <span className="ml-2 inline-flex items-center gap-1 align-middle text-rh">
                    <span className="h-1.5 w-1.5 rounded-full bg-rh" />
                    Live
                  </span>
                )}
              </div>
              <Sparkline data={row.spark} up={row.up} className="hidden h-8 w-32 sm:block" />
              <div className="text-right font-serif text-3xl font-black tabular-nums leading-none">
                {row.value}
              </div>
              <div
                className={`w-24 text-right font-mono text-xs font-bold tabular-nums ${
                  row.up ? "text-rh" : "text-red"
                }`}
              >
                {row.change}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Checklist() {
  return (
    <Section id="buy" eyebrow="Part II" page="4" title="Application checklist.">
      <div className="border-2 border-ink bg-paper">
        <div className="flex items-center justify-between border-b-2 border-ink px-6 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/55">
          <span>Complete boxes 1 through 4 in order</span>
          <span className="hidden sm:inline">For office use only ▸ none</span>
        </div>
        {checklist.map((item, i) => (
          <Reveal key={item.n} delay={i * 0.04}>
            <a
              href={item.href}
              className="group flex items-baseline gap-4 border-b border-ink px-6 py-6 transition-colors last:border-b-0 hover:bg-greenpaper/60"
            >
              <span className="grid h-6 w-6 shrink-0 translate-y-0.5 place-items-center border-2 border-ink font-mono text-[10px] font-bold text-ink/30 transition-colors group-hover:bg-rh group-hover:text-ink">
                {i + 1}
              </span>
              <div className="min-w-0">
                <h3 className="font-serif text-2xl font-black leading-none sm:text-3xl">
                  <span className="mr-2 font-mono text-sm font-bold text-rh">Box {item.n}</span>
                  {item.title}
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-ink/70">{item.body}</p>
              </div>
              <span className="leaders hidden sm:block" />
              <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-ink/45 sm:inline">
                Pending
              </span>
            </a>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function Tokenomics() {
  const chartUrl =
    token.chartUrl && token.chartUrl !== "#"
      ? token.chartUrl
      : token.contract && token.contract !== "TBA"
      ? `https://dexscreener.com/search?q=${encodeURIComponent(token.contract)}`
      : null;
  return (
    <Section id="tokenomics" eyebrow="Part III" page="5" title="Cap table, before the contract exists.">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.25fr]">
        <Reveal>
          <div className="border-2 border-ink bg-paper p-5">
            <div className="flex items-start justify-between gap-4 border-b-2 border-ink pb-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
                  Contract
                </div>
                <div className="mt-2">
                  <ContractCopy value={token.contract} label="CONTRACT TODO" />
                </div>
              </div>
              <span className="border border-red px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-red">
                Awaiting filing
              </span>
            </div>
            <p className="mt-5 text-sm leading-7 text-ink/[0.72]">
              Contract, buy, swap, bridge, chart, socials, and liquidity proof are intentionally
              marked TODO until cracka sends the real launch values.
            </p>
            {chartUrl ? (
              <a
                href={chartUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-6 block border border-ink bg-cream p-4 transition-colors hover:border-rh"
              >
                <TokenomicsChart />
                <div className="mt-2 flex items-center justify-end font-mono text-[9px] uppercase tracking-[0.16em] text-ink/50 group-hover:text-rh">
                  View live chart ↗
                </div>
              </a>
            ) : (
              <div className="mt-6 border border-ink bg-cream p-4">
                <TokenomicsChart />
              </div>
            )}
          </div>
        </Reveal>
        <div className="flex flex-col justify-center border-2 border-ink bg-paper">
          {tokenomicsRows.map((row, i) => (
            <Reveal key={row.label} delay={i * 0.04}>
              <article className="grid gap-3 border-b border-ink p-5 last:border-b-0 sm:grid-cols-[0.6fr_0.8fr_1fr]">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
                  <span className="mr-2 text-ink/35">{String(i + 1).padStart(2, "0")}</span>
                  {row.label}
                </div>
                <div className="break-words font-serif text-3xl font-black tabular-nums leading-none">
                  {row.value}
                </div>
                <p className="text-sm leading-6 text-ink/70">{row.note}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

function Community() {
  return (
    <Section id="community" eyebrow="Part IV" page="6" title="Distribution labels.">
      <StaggerReveal className="border-2 border-ink bg-paper">
        {distribution.map((item, i) => {
          const external = /^https?:\/\//.test(item.href);
          return (
          <a
            key={`${item.label}-${i}`}
            href={item.href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="group flex items-baseline gap-4 px-6 py-5 transition-colors hover:bg-greenpaper/60"
          >
            <span className="font-mono text-xs tabular-nums text-ink/40">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="font-serif text-3xl font-black leading-none sm:text-4xl">
              {item.label}
            </span>
            <span className="leaders" />
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/50 group-hover:text-rh">
              {item.note} ↗
            </span>
          </a>
          );
        })}
      </StaggerReveal>
    </Section>
  );
}

function Footer() {
  return (
    <footer className="border-t-2 border-ink bg-ink px-4 py-12 text-paper">
      <div className="mx-auto max-w-page">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.4fr]">
          <div>
            <div className="font-serif text-6xl font-black leading-none sm:text-8xl">
              Roth
              <br />
              <span className="text-rh2">6900</span>
            </div>
            <div className="mt-4 font-mono text-xs uppercase tracking-[0.18em] text-paper/60">
              Independent meme filing
            </div>
            <Barcode className="mt-6 h-8 w-44 invert" />
          </div>
          <div className="self-end">
            <p className="max-w-3xl text-sm leading-7 text-paper/75">{disclaimer}</p>
            <div className="mt-6 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-[0.14em]">
              <span className="border border-paper/60 px-3 py-2">Not Robinhood</span>
              <span className="border border-paper/60 px-3 py-2">Not an IRA</span>
              <span className="border border-paper/60 px-3 py-2">Verify contract</span>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-paper/25 pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-paper/45">
          <span>Cat. No. 69420R</span>
          <span>Page 6 of 6</span>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="min-h-screen overflow-hidden bg-paper text-ink">
      <Header />
      <Hero />
      <Marquee />
      <Manifesto />
      <Ledger />
      <Checklist />
      <Tokenomics />
      <Community />
      <Footer />
    </div>
  );
}
