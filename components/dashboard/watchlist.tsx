"use client";

import { Search, Star, TrendingDown, TrendingUp, X } from "lucide-react";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";

import {
  getLatestPrices,
  getWatchlist,
  resolveAssetsForSymbols,
  searchSymbols,
} from "@/app/actions/market-data";
import type { LatestPrice, SymbolPage } from "@/app/actions/market-data";
import type { AlpacaAsset } from "@/lib/alpaca";
import { cn } from "@/lib/utils";

const EMPTY_STARRED: string[] = [];

export function useWatchlist() {
  const { data, isLoading } = useSWR("watchlist", getWatchlist, {
    revalidateOnFocus: false,
  });
  return { starred: data ?? EMPTY_STARRED, isLoading };
}

type WatchlistProps = {
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
  heading: string;
  starredSectionHeading: string;
  browseSectionHeading: string;
};

export function Watchlist({
  selectedSymbol,
  onSelect,
  heading,
  starredSectionHeading,
  browseSectionHeading,
}: WatchlistProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const { starred, isLoading: watchlistLoading } = useWatchlist();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const starredSet = new Set(starred);

  const pinnedKey =
    starred.length > 0 && !deferredQuery.trim()
      ? (["watchlist-pinned", ...[...starred].sort()] as const)
      : null;

  const { data: pinnedAssets } = useSWR(
    pinnedKey,
    () => resolveAssetsForSymbols(starred),
    { revalidateOnFocus: false },
  );

  const { data, setSize, size, isLoading, isValidating } = useSWRInfinite(
    (pageIndex, prev: SymbolPage | null) => {
      if (prev && !prev.hasMore) return null;
      return [deferredQuery, pageIndex] as const;
    },
    ([q, page]) => searchSymbols(q, page),
    { revalidateFirstPage: false, revalidateOnFocus: false },
  );

  const infiniteAssets: AlpacaAsset[] = data
    ? data.flatMap((p) => p.assets)
    : [];

  const mainListAssets = !deferredQuery.trim()
    ? infiniteAssets.filter((a) => !starredSet.has(a.symbol))
    : infiniteAssets;

  const symbolsForPrices = (() => {
    const u = new Set<string>();
    if (!deferredQuery.trim() && pinnedAssets?.length) {
      for (const a of pinnedAssets) u.add(a.symbol);
    }
    for (const a of mainListAssets) u.add(a.symbol);
    return [...u];
  })();

  const priceCacheKey =
    symbolsForPrices.length > 0
      ? [...symbolsForPrices].sort().join("\0")
      : null;

  const { data: priceMap, isLoading: pricesLoading } = useSWR(
    priceCacheKey ? ["latest-prices", priceCacheKey] : null,
    () => getLatestPrices(symbolsForPrices),
    { revalidateOnFocus: false, dedupingInterval: 60_000 },
  );

  const hasMore = data ? (data[data.length - 1]?.hasMore ?? true) : true;
  const showLoadingMore = isValidating && (data?.length ?? 0) > 0;

  const showPinnedSection =
    !deferredQuery.trim() && (pinnedAssets?.length ?? 0) > 0;

  const pinnedLoading =
    starred.length > 0 &&
    !deferredQuery.trim() &&
    pinnedAssets === undefined &&
    !watchlistLoading;

  const hasMainRows = mainListAssets.length > 0;
  const needsMainInfinite =
    !deferredQuery.trim() &&
    hasMore &&
    (hasMainRows || (data?.length ?? 0) > 0);
  const showMainUl =
    !!deferredQuery.trim() && (hasMainRows || showLoadingMore)
      ? true
      : hasMainRows || showLoadingMore || needsMainInfinite;
  const hasAnyRows = hasMainRows || showPinnedSection;
  const showInitialSkeleton =
    (isLoading && !hasAnyRows && infiniteAssets.length === 0) || pinnedLoading;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const pagesReady = data?.length === size;
        if (
          entry.isIntersecting &&
          pagesReady &&
          !isValidating &&
          hasMore
        ) {
          setSize((s) => s + 1);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [data?.length, hasMore, isValidating, setSize, size]);

  useEffect(() => {
    setSize(1);
  }, [deferredQuery, setSize]);

  const idleList = !isLoading && !isValidating && !pinnedLoading;

  const emptyMessage = (() => {
    if (!idleList || hasAnyRows || showInitialSkeleton) return null;
    if (deferredQuery.trim()) {
      return `No symbols match \u201c${deferredQuery}\u201d`;
    }
    if (!deferredQuery.trim() && infiniteAssets.length === 0) {
      return "No symbols available. Check your Alpaca API keys.";
    }
    return null;
  })();

  const headingId = "watchlist-panel-title";
  const searchId = "watchlist-search";

  return (
    <div className="flex max-h-[80vh] min-h-0 flex-col overflow-hidden rounded-xl border lg:h-[42rem]">
      <div className="shrink-0 border-b px-4 py-3">
        <h2 id={headingId} className="text-sm font-semibold">
          {heading}
        </h2>
      </div>

      <div className="shrink-0 border-b px-3 py-2">
        <div className="relative flex items-center">
          <Search
            className="text-muted-foreground pointer-events-none absolute left-2.5 h-3.5 w-3.5"
            aria-hidden
          />
          <input
            id={searchId}
            type="search"
            role="searchbox"
            aria-labelledby={headingId}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbol or company…"
            className={cn(
              "w-full rounded-md bg-transparent py-1.5 pr-7 pl-8 text-sm",
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

      <div className="min-h-0 flex-1 overflow-y-auto">
        {showInitialSkeleton ? (
          <ul className="flex flex-col divide-y">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonRow key={`skel-initial-${i}`} />
            ))}
          </ul>
        ) : hasAnyRows || showLoadingMore || showMainUl ? (
          <>
            {showPinnedSection ? (
              <>
                <div className="bg-muted/30 text-muted-foreground border-b px-4 py-2 text-xs font-medium">
                  {starredSectionHeading}
                </div>
                <ul className="flex flex-col divide-y">
                  {pinnedAssets!.map((asset) => (
                    <WatchlistRow
                      key={`pinned-${asset.symbol}`}
                      asset={asset}
                      isActive={asset.symbol === selectedSymbol}
                      isStarred
                      onSelect={onSelect}
                      price={priceMap?.[asset.symbol]}
                      priceLoading={pricesLoading && !priceMap?.[asset.symbol]}
                    />
                  ))}
                </ul>
                {!deferredQuery.trim() && showMainUl ? (
                  <div className="bg-muted/30 text-muted-foreground border-b border-t px-4 py-2 text-xs font-medium">
                    {browseSectionHeading}
                  </div>
                ) : null}
              </>
            ) : null}

            {showMainUl ? (
              <ul className="flex flex-col divide-y">
                {mainListAssets.map((asset) => (
                  <WatchlistRow
                    key={asset.symbol}
                    asset={asset}
                    isActive={asset.symbol === selectedSymbol}
                    isStarred={starredSet.has(asset.symbol)}
                    onSelect={onSelect}
                    price={priceMap?.[asset.symbol]}
                    priceLoading={pricesLoading && !priceMap?.[asset.symbol]}
                  />
                ))}

                {showLoadingMore &&
                  Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonRow key={`skel-more-${i}`} />
                  ))}

                <li className="list-none p-0" role="presentation">
                  <div ref={sentinelRef} className="h-1" aria-hidden />
                </li>
              </ul>
            ) : null}
          </>
        ) : emptyMessage ? (
          <p className="text-muted-foreground px-4 py-8 text-center text-xs">
            {emptyMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}

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

type WatchlistRowProps = {
  asset: AlpacaAsset;
  isActive: boolean;
  isStarred: boolean;
  onSelect: (symbol: string) => void;
  price: LatestPrice | undefined;
  priceLoading: boolean;
};

function WatchlistRow({
  asset,
  isActive,
  isStarred,
  onSelect,
  price,
  priceLoading,
}: WatchlistRowProps) {
  const isUp = (price?.change ?? 0) >= 0;

  return (
    <li
      className={cn(
        "flex items-center transition-colors",
        isActive && "border-l-primary bg-muted/30 border-l-2",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "text-muted-foreground/35 flex shrink-0 items-center px-3 py-3",
          isStarred && "text-muted-foreground/70",
        )}
      >
        <Star
          className="h-3.5 w-3.5"
          fill={isStarred ? "currentColor" : "none"}
          strokeWidth={isStarred ? 0 : 1.25}
        />
      </span>

      <button
        type="button"
        onClick={() => onSelect(asset.symbol)}
        className={cn(
          "flex min-w-0 flex-1 items-center justify-between gap-3 py-3 pr-4 text-left transition-colors",
          "hover:bg-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
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
        ) : price ? (
          <div className="flex shrink-0 flex-col items-end gap-0.5">
            <span className="font-mono text-sm font-medium tabular-nums">
              ${price.price.toFixed(2)}
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
              {price.changePct.toFixed(2)}%
            </span>
          </div>
        ) : null}
      </button>
    </li>
  );
}
