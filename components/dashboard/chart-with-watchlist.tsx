"use client";

import { useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import useSWR from "swr";

import { TradingChart } from "@/components/chart/trading-chart";
import { Watchlist, WATCHLIST_SYMBOLS } from "@/components/dashboard/watchlist";
import { getLatestPrice } from "@/app/actions/market-data";
import { cn } from "@/lib/utils";

type ChartWithWatchlistProps = {
  chartLabels: {
    indicators: string;
    sma: string;
    ema: string;
    rsi: string;
    loading: string;
    empty: string;
  };
  watchlistHeading: string;
};

export function ChartWithWatchlist({
  chartLabels,
  watchlistHeading,
}: ChartWithWatchlistProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(
    WATCHLIST_SYMBOLS[0],
  );

  const { data: price } = useSWR(
    ["latest-price", selectedSymbol],
    () => getLatestPrice(selectedSymbol),
    { revalidateOnFocus: false, dedupingInterval: 60_000 },
  );

  const isUp = (price?.change ?? 0) >= 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_17rem]">
      {/* Chart panel */}
      <div className="flex flex-col gap-4 rounded-xl border p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-xl font-bold tracking-tight">
              {selectedSymbol}
            </span>
            {price && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-2xl font-semibold tabular-nums">
                  ${price.price.toFixed(2)}
                </span>
                <span
                  className={cn(
                    "flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                    isUp
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-red-500/10 text-red-500",
                  )}
                >
                  {isUp ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {isUp ? "+" : ""}
                  {price.change.toFixed(2)} ({isUp ? "+" : ""}
                  {price.changePct.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>
        </div>

        <TradingChart key={selectedSymbol} symbol={selectedSymbol} labels={chartLabels} />
      </div>

      {/* Watchlist panel */}
      <Watchlist
        selectedSymbol={selectedSymbol}
        onSelect={setSelectedSymbol}
        heading={watchlistHeading}
      />
    </div>
  );
}
