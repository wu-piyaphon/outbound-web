"use client";

import { useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import useSWR from "swr";

import { TradingChart } from "@/components/chart/trading-chart";
import { useWatchlist, Watchlist } from "@/components/dashboard/watchlist";
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
  watchlistStarredHeading: string;
  watchlistBrowseHeading: string;
};

export function ChartWithWatchlist({
  chartLabels,
  watchlistHeading,
  watchlistStarredHeading,
  watchlistBrowseHeading,
}: ChartWithWatchlistProps) {
  const { starred, isLoading: watchlistLoading } = useWatchlist();
  const [pickedSymbol, setPickedSymbol] = useState<string | null>(null);

  const selectedSymbol =
    pickedSymbol ?? (!watchlistLoading ? (starred[0] ?? "AAPL") : null);

  const { data: price, isLoading: priceLoading } = useSWR(
    selectedSymbol ? ["latest-price", selectedSymbol] : null,
    () => getLatestPrice(selectedSymbol!),
    { revalidateOnFocus: false, dedupingInterval: 60_000 },
  );

  const isUp = (price?.change ?? 0) >= 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_17rem]">
      <div className="flex flex-col gap-4 rounded-xl border p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            {selectedSymbol ? (
              <>
                <span className="font-mono text-xl font-bold tracking-tight">
                  {selectedSymbol}
                </span>
                {price && !priceLoading ? (
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
                ) : (
                  <div className="bg-muted h-8 w-40 animate-pulse rounded" />
                )}
              </>
            ) : (
              <>
                <div className="bg-muted h-7 w-24 animate-pulse rounded" />
                <div className="bg-muted mt-2 h-9 w-40 animate-pulse rounded" />
              </>
            )}
          </div>
        </div>

        {selectedSymbol ? (
          <TradingChart
            key={selectedSymbol}
            symbol={selectedSymbol}
            labels={chartLabels}
          />
        ) : (
          <div className="bg-muted h-full animate-pulse rounded-lg" />
        )}
      </div>

      <Watchlist
        selectedSymbol={selectedSymbol ?? ""}
        onSelect={setPickedSymbol}
        heading={watchlistHeading}
        starredSectionHeading={watchlistStarredHeading}
        browseSectionHeading={watchlistBrowseHeading}
      />
    </div>
  );
}
