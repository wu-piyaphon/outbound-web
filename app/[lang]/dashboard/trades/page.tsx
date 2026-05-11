import { notFound } from "next/navigation";
import { Suspense } from "react";

import { TradeTable } from "@/components/dashboard/trade-table";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { getDictionary } from "@/app/[lang]/dictionaries";
import { isLocale } from "@/lib/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Trade } from "@/lib/types/database";

import { TableSkeleton } from "../_skeletons";

export default async function TradesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const d = dict.dashboard.tradeHistory;

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{d.title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{d.subtitle}</p>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <TradesTable labels={d} />
      </Suspense>
    </div>
  );
}

async function TradesTable({
  labels,
}: {
  labels: Dictionary["dashboard"]["tradeHistory"];
}) {
  const supabase = await createSupabaseServerClient();

  const { data: tradesRaw, error } = await supabase
    .from("trades")
    .select(
      "id, parent_id, symbol, side, quantity, price_per_unit, avg_fill_price, stop_loss, take_profit, commission_fee, fx_fee_amortized, status, filled_at, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) console.error("trades:", error);

  const trades = (tradesRaw ?? []) as Pick<
    Trade,
    | "id"
    | "parent_id"
    | "symbol"
    | "side"
    | "quantity"
    | "price_per_unit"
    | "avg_fill_price"
    | "stop_loss"
    | "take_profit"
    | "commission_fee"
    | "fx_fee_amortized"
    | "status"
    | "filled_at"
    | "created_at"
  >[];

  return <TradeTable trades={trades} labels={labels} />;
}
