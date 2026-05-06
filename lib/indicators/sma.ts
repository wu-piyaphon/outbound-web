export type IndicatorPoint = {
  time: number; // unix seconds
  value: number;
};

export type Candle = {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
};

/** Simple Moving Average over the last `period` closes. */
export function sma(candles: Candle[], period: number): IndicatorPoint[] {
  if (period <= 0 || candles.length < period) return [];
  const out: IndicatorPoint[] = [];
  let sum = 0;
  for (let i = 0; i < candles.length; i++) {
    sum += candles[i].close;
    if (i >= period) sum -= candles[i - period].close;
    if (i >= period - 1) {
      out.push({ time: candles[i].time, value: sum / period });
    }
  }
  return out;
}
