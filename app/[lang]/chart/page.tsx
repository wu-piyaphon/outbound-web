import { notFound } from "next/navigation";

import { SymbolPicker } from "@/components/chart/symbol-picker";
import { TradingChart } from "@/components/chart/trading-chart";
import { getDictionary } from "@/app/[lang]/dictionaries";
import { isLocale } from "@/lib/i18n/config";

const DEFAULT_SYMBOL = "AAPL";

export default async function ChartPage({
  params,
  searchParams,
}: PageProps<"/[lang]/chart">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const sp = await searchParams;
  const symbolParam = Array.isArray(sp.symbol) ? sp.symbol[0] : sp.symbol;
  const symbol = (symbolParam ?? DEFAULT_SYMBOL).toUpperCase();

  const dict = await getDictionary(lang);

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          {dict.chart.title}
        </h1>
        <p className="text-muted-foreground text-sm">{dict.chart.subtitle}</p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <SymbolPicker current={symbol} label={dict.chart.symbolLabel} />
      </div>

      <div className="mt-6">
        <TradingChart
          key={symbol}
          symbol={symbol}
          labels={{
            indicators: dict.chart.indicators.title,
            sma: dict.chart.indicators.sma,
            ema: dict.chart.indicators.ema,
            rsi: dict.chart.indicators.rsi,
            loading: dict.chart.loading,
            empty: dict.chart.empty,
          }}
        />
      </div>
    </div>
  );
}
