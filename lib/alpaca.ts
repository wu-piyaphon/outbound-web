"use cache";

import { cacheLife } from "next/cache";

import { serverEnv } from "@/lib/env";

export type AlpacaAsset = {
  symbol: string;
  name: string;
};

type AlpacaAssetRaw = {
  symbol: string;
  name: string;
  status: string;
  tradable: boolean;
};

/**
 * Fetches all active, tradable US equity assets from Alpaca.
 * Cached for 24 hours — the asset list changes very rarely.
 * Returns an empty array when API keys are not configured.
 */
export async function getAllAssets(): Promise<AlpacaAsset[]> {
  cacheLife("days");

  const { ALPACA_API_KEY, ALPACA_API_SECRET } = serverEnv;

  if (!ALPACA_API_KEY || !ALPACA_API_SECRET) {
    return [];
  }

  const res = await fetch(
    "https://paper-api.alpaca.markets/v2/assets?status=active&asset_class=us_equity&tradable=true",
    {
      headers: {
        "APCA-API-KEY-ID": ALPACA_API_KEY,
        "APCA-API-SECRET-KEY": ALPACA_API_SECRET,
      },
    },
  );

  if (!res.ok) {
    console.error(`Alpaca assets fetch failed: ${res.status} ${res.statusText}`);
    return [];
  }

  const raw = (await res.json()) as AlpacaAssetRaw[];

  return raw
    .filter((a) => a.tradable && a.name)
    .map(({ symbol, name }) => ({ symbol, name }))
    .sort((a, b) => a.symbol.localeCompare(b.symbol));
}
