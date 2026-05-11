"use client";

import { Search, Star, TrendingDown, TrendingUp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";

import {
  getLatestPrice,
  getWatchlist,
  searchSymbols,
} from "@/app/actions/market-data";
import type { AlpacaAsset } from "@/lib/alpaca";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Debounce hook
// ---------------------------------------------------------------------------
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ---------------------------------------------------------------------------
// Watchlist source — pulled from Supabase `watchlists` (is_active = true).
// ---------------------------------------------------------------------------
export function useWatchlist() {
  const { data } = useSWR("watchlist", getWatchlist, {
    revalidateOnFocus: false,
  });
  return { starred: data ?? [] };
}

// ---------------------------------------------------------------------------
// Watchlist component
// ---------------------------------------------------------------------------
type WatchlistProps = {
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
  heading: string;
};

export function Watchlist({
  selectedSymbol,
  onSelect,
  heading,
}: WatchlistProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const { starred } = useWatchlist();
  const sentinelRef = useRef<HTMLDivElement>(null);

  // useSWRInfinite — one page = 25 assets
  const { data, setSize, size, isLoading, isValidating } = useSWRInfinite(
    (pageIndex, prev: Awaited<ReturnType<typeof searchSymbols>> | null) => {
      if (prev && !prev.hasMore) return null;
      return [debouncedQuery, pageIndex] as const;
    },
    ([q, page]) => searchSymbols(q, page),
    { revalidateFirstPage: false, revalidateOnFocus: false },
  );

  const allAssets: AlpacaAsset[] = data ? data.flatMap((p) => p.assets) : [];
  const hasMore = data ? (data[data.length - 1]?.hasMore ?? true) : true;
  const showLoadingMore = isValidating && (data?.length ?? 0) > 0;

  // Starred assets always float to the top within current page results.
  const sorted = [...allAssets].sort((a, b) => {
    const aS = starred.includes(a.symbol);
    const bS = starred.includes(b.symbol);
    if (aS !== bS) return aS ? -1 : 1;
    return 0;
  });

  // IntersectionObserver — load next page when sentinel enters viewport.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isValidating && hasMore) {
          setSize((s) => s + 1);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isValidating, hasMore, setSize]);

  // Reset to page 1 when the debounced query changes.
  useEffect(() => {
    setSize(1);
  }, [debouncedQuery, setSize]);

  return (
    <div className="flex h-170 flex-col overflow-hidden rounded-xl border">
      {/* Header */}
      <div className="shrink-0 border-b px-4 py-3">
        <h2 className="text-sm font-semibold">{heading}</h2>
      </div>

      {/* Search */}
      <div className="shrink-0 border-b px-3 py-2">
        <div className="relative flex items-center">
          <Search className="text-muted-foreground pointer-events-none absolute left-2.5 h-3.5 w-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbol or company…"
            className={cn(
              "w-full rounded-md bg-transparent py-1.5 pr-7 pl-8 text-sm",
              "placeholder:text-muted-foreground",
              "focus-visible:ring-primary focus:outline-none focus-visible:ring-1",
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

      {/* List */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading && allAssets.length === 0 ? (
          // Initial load skeletons
          <ul className="flex flex-col divide-y">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </ul>
        ) : sorted.length > 0 ? (
          <ul className="flex flex-col divide-y">
            {sorted.map((asset) => (
              <WatchlistRow
                key={asset.symbol}
                asset={asset}
                isActive={asset.symbol === selectedSymbol}
                isStarred={starred.includes(asset.symbol)}
                onSelect={onSelect}
              />
            ))}

            {/* Loading-more skeletons */}
            {showLoadingMore &&
              Array.from({ length: 3 }).map((_, i) => (
                <SkeletonRow key={`loading-${i}`} />
              ))}

            {/* Sentinel — triggers next page load */}
            <div ref={sentinelRef} className="h-1" aria-hidden />
          </ul>
        ) : (
          <p className="text-muted-foreground px-4 py-8 text-center text-xs">
            {size > 0
              ? `No symbols match \u201c${debouncedQuery}\u201d`
              : "No symbols available. Check your Alpaca API keys."}
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton row
// ---------------------------------------------------------------------------
function SkeletonRow() {
  return (
    <li className="flex items-center gap-2 px-4 py-3">
      <div className="bg-muted h-3.5 w-3.5 animate-pulse rounded" />
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="bg-muted h-3.5 w-12 animate-pulse rounded" />
        <div className="bg-muted h-2.5 w-24 animate-pulse rounded" />
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <div className="bg-muted h-3.5 w-14 animate-pulse rounded" />
        <div className="bg-muted h-2.5 w-10 animate-pulse rounded" />
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Row
// ---------------------------------------------------------------------------
type WatchlistRowProps = {
  asset: AlpacaAsset;
  isActive: boolean;
  isStarred: boolean;
  onSelect: (symbol: string) => void;
};

function WatchlistRow({
  asset,
  isActive,
  isStarred,
  onSelect,
}: WatchlistRowProps) {
  const { data, isLoading: priceLoading } = useSWR(
    ["latest-price", asset.symbol],
    () => getLatestPrice(asset.symbol),
    { revalidateOnFocus: false, dedupingInterval: 60_000 },
  );

  const isUp = (data?.change ?? 0) >= 0;

  return (
    <li
      className={cn(
        "flex items-center transition-colors",
        isActive && "border-l-primary bg-muted/30 border-l-2",
      )}
    >
      {/* Star indicator — read-only; sourced from Supabase `watchlists` */}
      <span
        aria-hidden="true"
        className={cn(
          "flex shrink-0 items-center px-3 py-3",
          isStarred ? "text-amber-400" : "text-muted-foreground/40",
        )}
      >
        <Star
          className="h-3.5 w-3.5"
          fill={isStarred ? "currentColor" : "none"}
          strokeWidth={isStarred ? 0 : 1.5}
        />
      </span>

      {/* Symbol + company name — selects chart */}
      <button
        type="button"
        onClick={() => onSelect(asset.symbol)}
        className={cn(
          "flex min-w-0 flex-1 items-center justify-between gap-3 py-3 pr-4 text-left transition-colors",
          "hover:bg-muted/40 focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset",
          isActive ? "pl-0" : "pl-1",
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-mono text-sm leading-none font-semibold">
            {asset.symbol}
          </span>
          <span className="text-muted-foreground truncate text-xs leading-none">
            {asset.name}
          </span>
        </div>

        {priceLoading ? (
          <div className="flex shrink-0 flex-col items-end gap-1">
            <div className="bg-muted h-3.5 w-14 animate-pulse rounded" />
            <div className="bg-muted h-2.5 w-10 animate-pulse rounded" />
          </div>
        ) : data ? (
          <div className="flex shrink-0 flex-col items-end gap-0.5">
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
