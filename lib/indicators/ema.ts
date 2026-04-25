import type { Candle, IndicatorPoint } from "./sma";

/** Exponential Moving Average. Seeded with the first close. */
export function ema(candles: Candle[], period: number): IndicatorPoint[] {
  if (period <= 0 || candles.length === 0) return [];
  const k = 2 / (period + 1);
  const out: IndicatorPoint[] = [];
  let prev = candles[0].close;
  out.push({ time: candles[0].time, value: prev });
  for (let i = 1; i < candles.length; i++) {
    const value = candles[i].close * k + prev * (1 - k);
    out.push({ time: candles[i].time, value });
    prev = value;
  }
  // Trim warm-up period for cleaner display.
  return out.slice(period - 1);
}
