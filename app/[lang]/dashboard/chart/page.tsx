import { notFound } from "next/navigation";
import { Suspense } from "react";

import { SymbolPicker } from "@/components/chart/symbol-picker";
import { TradingChart } from "@/components/chart/trading-chart";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { getDictionary } from "@/app/[lang]/dictionaries";
import { isLocale } from "@/lib/i18n/config";

const DEFAULT_SYMBOL = "AAPL";

export default async function DashboardChartPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ symbol?: string | string[] }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {dict.chart.title}
        </h1>
        <p className="text-muted-foreground text-sm">{dict.chart.subtitle}</p>
      </div>

      <Suspense fallback={<ChartSkeleton symbolLabel={dict.chart.symbolLabel} />}>
        <ChartSection searchParams={searchParams} chart={dict.chart} />
      </Suspense>
    </div>
  );
}

async function ChartSection({
  searchParams,
  chart,
}: {
  searchParams: Promise<{ symbol?: string | string[] }>;
  chart: Dictionary["chart"];
}) {
  const sp = await searchParams;
  const symbolParam = Array.isArray(sp.symbol) ? sp.symbol[0] : sp.symbol;
  const symbol = (symbolParam ?? DEFAULT_SYMBOL).toUpperCase();

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <SymbolPicker current={symbol} label={chart.symbolLabel} />
      </div>

      <div className="mt-6">
        <TradingChart
          key={symbol}
          symbol={symbol}
          labels={{
            indicators: chart.indicators.title,
            sma: chart.indicators.sma,
            ema: chart.indicators.ema,
            rsi: chart.indicators.rsi,
            loading: chart.loading,
            empty: chart.empty,
          }}
        />
      </div>
    </>
  );
}

function ChartSkeleton({ symbolLabel }: { symbolLabel: string }) {
  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">{symbolLabel}</span>
          <div className="bg-muted h-9 w-32 animate-pulse rounded-md" />
        </div>
      </div>
      <div className="mt-6 bg-muted h-[400px] w-full animate-pulse rounded-xl border" />
    </>
  );
}
