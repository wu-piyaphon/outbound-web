"use server";

import type { Candle } from "@/lib/indicators/sma";

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
  return { symbol, price: latest.close, prevClose: prev.close, change, changePct };
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
