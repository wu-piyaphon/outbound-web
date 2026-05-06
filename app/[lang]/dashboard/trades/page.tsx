import { notFound } from "next/navigation";

import { TradeTable } from "@/components/dashboard/trade-table";
import { getDictionary } from "@/app/[lang]/dictionaries";
import { isLocale } from "@/lib/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Trade } from "@/lib/types/database";

export default async function TradesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, supabase] = await Promise.all([
    getDictionary(lang),
    createSupabaseServerClient(),
  ]);

  const { data: tradesRaw } = await supabase
    .from("trades")
    .select(
      "id, parent_id, symbol, side, quantity, price_per_unit, avg_fill_price, stop_loss, take_profit, commission_fee, fx_fee_amortized, status, filled_at, created_at",
    )
    .order("created_at", { ascending: false });

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

  const d = dict.dashboard.tradeHistory;

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{d.title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{d.subtitle}</p>
      </div>
      <TradeTable trades={trades} labels={d} />
    </div>
  );
}
