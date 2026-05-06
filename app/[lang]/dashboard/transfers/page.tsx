import { notFound } from "next/navigation";

import { TransferTable } from "@/components/dashboard/transfer-table";
import { getDictionary } from "@/app/[lang]/dictionaries";
import { isLocale } from "@/lib/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AccountTransfer } from "@/lib/types/database";

export default async function TransfersPage({
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

  const { data: transfersRaw } = await supabase
    .from("account_transfers")
    .select(
      "id, type, amount_thb, amount_usd, fee_thb, fee_usd, exchange_rate, target_trades, remaining_trades, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  const transfers = (transfersRaw ?? []) as AccountTransfer[];

  const d = dict.dashboard.transferLog;

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{d.title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{d.subtitle}</p>
      </div>
      <TransferTable transfers={transfers} labels={d} />
    </div>
  );
}
