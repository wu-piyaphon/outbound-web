import { notFound } from "next/navigation";
import { Suspense } from "react";

import { SignalTable } from "@/components/dashboard/signal-table";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { getDictionary } from "@/app/[lang]/dictionaries";
import { isLocale } from "@/lib/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Signal } from "@/lib/types/database";

import { TableSkeleton } from "../_skeletons";

export default async function SignalsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const d = dict.dashboard.signalLog;

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{d.title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{d.subtitle}</p>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <SignalsTable labels={d} />
      </Suspense>
    </div>
  );
}

async function SignalsTable({
  labels,
}: {
  labels: Dictionary["dashboard"]["signalLog"];
}) {
  const supabase = await createSupabaseServerClient();

  const { data: signalsRaw, error } = await supabase
    .from("signals")
    .select(
      "id, symbol, side, price_at_signal, indicators, is_executed, reasoning, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) console.error("signals:", error);

  const signals = (signalsRaw ?? []) as Pick<
    Signal,
    | "id"
    | "symbol"
    | "side"
    | "price_at_signal"
    | "indicators"
    | "is_executed"
    | "reasoning"
    | "created_at"
  >[];

  return <SignalTable signals={signals} labels={labels} />;
}
