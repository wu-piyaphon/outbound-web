"use client";

import { Search, TrendingDown, TrendingUp, X } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";

import { getLatestPrice } from "@/app/actions/market-data";
import { cn } from "@/lib/utils";

export const WATCHLIST_SYMBOLS = [
  "AAPL",
  "MSFT",
  "NVDA",
  "TSLA",
  "AMZN",
  "META",
] as const;

type WatchlistProps = {
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
  heading: string;
};

export function Watchlist({ selectedSymbol, onSelect, heading }: WatchlistProps) {
  const [query, setQuery] = useState("");

  const filtered = WATCHLIST_SYMBOLS.filter((s) =>
    s.includes(query.toUpperCase().trim()),
  );

  return (
    <div className="flex flex-col rounded-xl border overflow-hidden">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">{heading}</h2>
      </div>

      {/* Search input */}
      <div className="border-b px-3 py-2">
        <div className="relative flex items-center">
          <Search className="text-muted-foreground pointer-events-none absolute left-2.5 h-3.5 w-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className={cn(
              "w-full rounded-md bg-transparent py-1.5 pl-8 pr-7 text-sm",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus-visible:ring-1 focus-visible:ring-primary",
            )}
            spellCheck={false}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground absolute right-2 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Symbol rows */}
      {filtered.length > 0 ? (
        <ul className="flex flex-col divide-y">
          {filtered.map((symbol) => (
            <WatchlistRow
              key={symbol}
              symbol={symbol}
              isActive={symbol === selectedSymbol}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground px-4 py-6 text-center text-xs">
          No symbols match &ldquo;{query}&rdquo;
        </p>
      )}
    </div>
  );
}

type WatchlistRowProps = {
  symbol: string;
  isActive: boolean;
  onSelect: (symbol: string) => void;
};

function WatchlistRow({ symbol, isActive, onSelect }: WatchlistRowProps) {
  const { data, isLoading } = useSWR(
    ["latest-price", symbol],
    () => getLatestPrice(symbol),
    { revalidateOnFocus: false, dedupingInterval: 60_000 },
  );

  const isUp = (data?.change ?? 0) >= 0;

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(symbol)}
        className={cn(
          "flex w-full items-center justify-between px-4 py-3 text-left transition-colors",
          "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
          isActive && "border-l-2 border-l-primary bg-muted/30 pl-[14px]",
        )}
      >
        <span className="font-mono text-sm font-semibold">{symbol}</span>

        {isLoading ? (
          <div className="flex flex-col items-end gap-1">
            <div className="bg-muted h-3.5 w-14 animate-pulse rounded" />
            <div className="bg-muted h-3 w-10 animate-pulse rounded" />
          </div>
        ) : data ? (
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-mono text-sm font-medium tabular-nums">
              ${data.price.toFixed(2)}
            </span>
            <span
              className={cn(
                "flex items-center gap-0.5 text-xs font-medium tabular-nums",
                isUp ? "text-emerald-500" : "text-red-500",
              )}
            >
              {isUp ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {isUp ? "+" : ""}
              {data.changePct.toFixed(2)}%
            </span>
          </div>
        ) : null}
      </button>
    </li>
  );
}
