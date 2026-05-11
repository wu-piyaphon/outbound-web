"use server";

import { getAllAssets, type AlpacaAsset } from "@/lib/alpaca";
import type { Candle } from "@/lib/indicators/sma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const PAGE_SIZE = 25;

export type SymbolPage = {
  assets: AlpacaAsset[];
  hasMore: boolean;
};

export async function getWatchlist(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("watchlists")
    .select("symbol")
    .eq("is_active", true);
  return (data ?? []).map((row) => row.symbol as string);
}

export async function searchSymbols(
  query: string,
  page: number,
): Promise<SymbolPage> {
  const all = await getAllAssets();

  const q = query.trim().toUpperCase();
  const filtered = q
    ? all.filter(
        (a) => a.symbol.startsWith(q) || a.name.toUpperCase().includes(q),
      )
    : all;

  const start = page * PAGE_SIZE;
  const assets = filtered.slice(start, start + PAGE_SIZE);

  return { assets, hasMore: start + PAGE_SIZE < filtered.length };
}

export type LatestPrice = {
  symbol: string;
  price: number;
  prevClose: number;
  change: number;
  changePct: number;
};

export async function getLatestPrice(symbol: string): Promise<LatestPrice> {
  const candles = await getCandles(symbol, 2);
  const latest = candles[candles.length - 1];
  const prev = candles[candles.length - 2] ?? latest;
  const change = round(latest.close - prev.close);
  const changePct = round((change / prev.close) * 100);
  return {
    symbol,
    price: latest.close,
    prevClose: prev.close,
    change,
    changePct,
  };
}

/** Batch latest quotes in one server round-trip (parallel candle fetches). */
export async function getLatestPrices(
  symbols: string[],
): Promise<Record<string, LatestPrice>> {
  const unique = [...new Set(symbols.filter(Boolean))];
  if (unique.length === 0) return {};

  const entries = await Promise.all(
    unique.map(async (symbol) => {
      const latest = await getLatestPrice(symbol);
      return [symbol, latest] as const;
    }),
  );

  return Object.fromEntries(entries);
}

export async function resolveAssetsForSymbols(
  symbols: string[],
): Promise<AlpacaAsset[]> {
  if (symbols.length === 0) return [];
  const all = await getAllAssets();
  const bySymbol = new Map(all.map((a) => [a.symbol, a]));
  const out: AlpacaAsset[] = [];
  for (const s of symbols) {
    const a = bySymbol.get(s);
    if (a) out.push(a);
  }
  return out;
}

/**
 * Returns mock OHLC candles for v1. Swap with Alpaca historical data later.
 * Uses a deterministic seed per symbol so SSR + client renders stay consistent.
 */
export async function getCandles(
  symbol: string,
  count = 200,
): Promise<Candle[]> {
  const seed = hashString(symbol);
  const rng = mulberry32(seed);

  const candles: Candle[] = [];
  let price = 100 + (seed % 50);
  const now = Math.floor(Date.now() / 1000);
  const dayInSeconds = 24 * 60 * 60;

  for (let i = count - 1; i >= 0; i--) {
    const time = now - i * dayInSeconds;
    const open = price;
    const drift = (rng() - 0.5) * 2; // ±1
    const high = open + Math.abs(drift) + rng() * 1.5;
    const low = open - Math.abs(drift) - rng() * 1.5;
    const close = open + drift + (rng() - 0.5);
    candles.push({
      time,
      open: round(open),
      high: round(high),
      low: round(low),
      close: round(close),
    });
    price = close;
  }
  return candles;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
