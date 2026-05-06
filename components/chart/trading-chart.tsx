"use client";

import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type Time,
  createChart,
} from "lightweight-charts";
import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme/client";
import { getCandles } from "@/app/actions/market-data";
import { ema } from "@/lib/indicators/ema";
import { rsi } from "@/lib/indicators/rsi";
import { sma } from "@/lib/indicators/sma";
import type { Candle } from "@/lib/indicators/sma";
import { cn } from "@/lib/utils";

type TradingChartProps = {
  symbol: string;
  labels: {
    indicators: string;
    sma: string;
    ema: string;
    rsi: string;
    loading: string;
    empty: string;
  };
};

type IndicatorState = {
  sma: boolean;
  ema: boolean;
  rsi: boolean;
};

const INITIAL_INDICATORS: IndicatorState = { sma: true, ema: true, rsi: false };

export function TradingChart({ symbol, labels }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [indicators, setIndicators] =
    useState<IndicatorState>(INITIAL_INDICATORS);

  const { data: candles, isLoading } = useSWR<Candle[]>(
    ["candles", symbol],
    () => getCandles(symbol),
    { revalidateOnFocus: false },
  );

  const indicatorData = useMemo(() => {
    if (!candles) return null;
    return {
      sma: sma(candles, 20),
      ema: ema(candles, 50),
      rsi: rsi(candles, 14),
    };
  }, [candles]);

  // Initialize chart once per mount.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: isDark ? "#a1a1aa" : "#52525b",
      },
      grid: {
        vertLines: { color: isDark ? "#27272a" : "#e4e4e7" },
        horzLines: { color: isDark ? "#27272a" : "#e4e4e7" },
      },
      rightPriceScale: { borderColor: isDark ? "#27272a" : "#e4e4e7" },
      timeScale: {
        borderColor: isDark ? "#27272a" : "#e4e4e7",
        timeVisible: true,
      },
      crosshair: { mode: CrosshairMode.Normal },
    });

    candleSeriesRef.current = chart.addSeries(CandlestickSeries, {
      upColor: "#10b981",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });

    chartRef.current = chart;
    return () => {
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      smaSeriesRef.current = null;
      emaSeriesRef.current = null;
      rsiSeriesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply theme changes without re-mounting.
  useEffect(() => {
    chartRef.current?.applyOptions({
      layout: { textColor: isDark ? "#a1a1aa" : "#52525b" },
      grid: {
        vertLines: { color: isDark ? "#27272a" : "#e4e4e7" },
        horzLines: { color: isDark ? "#27272a" : "#e4e4e7" },
      },
      rightPriceScale: { borderColor: isDark ? "#27272a" : "#e4e4e7" },
      timeScale: { borderColor: isDark ? "#27272a" : "#e4e4e7" },
    });
  }, [isDark]);

  // Push candle data when available.
  useEffect(() => {
    if (!candles || !candleSeriesRef.current) return;
    candleSeriesRef.current.setData(
      candles.map((c) => ({
        time: c.time as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })),
    );
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  // SMA toggle.
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !indicatorData) return;

    if (indicators.sma) {
      if (!smaSeriesRef.current) {
        smaSeriesRef.current = chart.addSeries(LineSeries, {
          color: "#3b82f6",
          lineWidth: 2,
          priceLineVisible: false,
        });
      }
      smaSeriesRef.current.setData(
        indicatorData.sma.map((p) => ({
          time: p.time as Time,
          value: p.value,
        })),
      );
    } else if (smaSeriesRef.current) {
      chart.removeSeries(smaSeriesRef.current);
      smaSeriesRef.current = null;
    }
  }, [indicators.sma, indicatorData]);

  // EMA toggle.
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !indicatorData) return;

    if (indicators.ema) {
      if (!emaSeriesRef.current) {
        emaSeriesRef.current = chart.addSeries(LineSeries, {
          color: "#a855f7",
          lineWidth: 2,
          priceLineVisible: false,
        });
      }
      emaSeriesRef.current.setData(
        indicatorData.ema.map((p) => ({
          time: p.time as Time,
          value: p.value,
        })),
      );
    } else if (emaSeriesRef.current) {
      chart.removeSeries(emaSeriesRef.current);
      emaSeriesRef.current = null;
    }
  }, [indicators.ema, indicatorData]);

  // RSI in a separate pane.
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !indicatorData) return;

    if (indicators.rsi) {
      if (!rsiSeriesRef.current) {
        rsiSeriesRef.current = chart.addSeries(
          LineSeries,
          { color: "#f59e0b", lineWidth: 2, priceLineVisible: false },
          1,
        );
      }
      rsiSeriesRef.current.setData(
        indicatorData.rsi.map((p) => ({
          time: p.time as Time,
          value: p.value,
        })),
      );
    } else if (rsiSeriesRef.current) {
      chart.removeSeries(rsiSeriesRef.current);
      rsiSeriesRef.current = null;
    }
  }, [indicators.rsi, indicatorData]);

  function toggle(key: keyof IndicatorState) {
    setIndicators((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground mr-2 text-xs tracking-wide uppercase">
          {labels.indicators}
        </span>
        <IndicatorToggle
          active={indicators.sma}
          color="#3b82f6"
          onClick={() => toggle("sma")}
        >
          {labels.sma}
        </IndicatorToggle>
        <IndicatorToggle
          active={indicators.ema}
          color="#a855f7"
          onClick={() => toggle("ema")}
        >
          {labels.ema}
        </IndicatorToggle>
        <IndicatorToggle
          active={indicators.rsi}
          color="#f59e0b"
          onClick={() => toggle("rsi")}
        >
          {labels.rsi}
        </IndicatorToggle>
      </div>

      <div className="bg-card relative h-130 w-full overflow-hidden rounded-lg border">
        <div ref={containerRef} className="h-full w-full" />
        {isLoading && (
          <div className="bg-background/60 text-muted-foreground absolute inset-0 flex items-center justify-center text-sm">
            {labels.loading}
          </div>
        )}
        {!isLoading && candles && candles.length === 0 && (
          <div className="text-muted-foreground absolute inset-0 flex items-center justify-center text-sm">
            {labels.empty}
          </div>
        )}
      </div>
    </div>
  );
}

type IndicatorToggleProps = {
  active: boolean;
  color: string;
  onClick: () => void;
  children: React.ReactNode;
};

function IndicatorToggle({
  active,
  color,
  onClick,
  children,
}: IndicatorToggleProps) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "outline"}
      size="sm"
      onClick={onClick}
      className={cn("gap-2", !active && "text-muted-foreground")}
      aria-pressed={active}
    >
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{
          backgroundColor: active ? color : "transparent",
          border: `1px solid ${color}`,
        }}
      />
      {children}
    </Button>
  );
}
