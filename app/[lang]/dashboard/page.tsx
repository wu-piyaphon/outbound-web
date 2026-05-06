import Link from "next/link";
import { notFound } from "next/navigation";

import { BalanceCards } from "@/components/dashboard/balance-cards";
import { getDictionary } from "@/app/[lang]/dictionaries";
import { isLocale } from "@/lib/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  formatUsdStr,
  formatThbStr,
  formatDateTime,
} from "@/lib/format";
import {
  TRADE_STATUS_CLASSES,
  sideBadgeClass,
  BOOL_TRUE_BADGE_CLASS,
  BOOL_FALSE_BADGE_CLASS,
} from "@/lib/dashboard/constants";
import type { AccountTransfer, Signal, Trade } from "@/lib/types/database";

export default async function DashboardPage({
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

  const [
    { data: transfers },
    { data: allTradesRaw },
    { data: recentSignalsRaw },
    { data: recentTradesRaw },
  ] = await Promise.all([
    supabase
      .from("account_transfers")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("trades").select("id, parent_id, side, status"),
    supabase
      .from("signals")
      .select("id, symbol, side, price_at_signal, is_executed, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("trades")
      .select("id, symbol, side, status, avg_fill_price, price_per_unit, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const allTrades = (allTradesRaw ?? []) as Pick<
    Trade,
    "id" | "parent_id" | "side" | "status"
  >[];
  const recentSignals = (recentSignalsRaw ?? []) as Pick<
    Signal,
    "id" | "symbol" | "side" | "price_at_signal" | "is_executed" | "created_at"
  >[];
  const recentTrades = (recentTradesRaw ?? []) as Pick<
    Trade,
    | "id"
    | "symbol"
    | "side"
    | "status"
    | "avg_fill_price"
    | "price_per_unit"
    | "created_at"
  >[];

  const d = dict.dashboard;

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{d.title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{d.subtitle}</p>
      </div>

      <BalanceCards
        transfers={(transfers ?? []) as AccountTransfer[]}
        trades={allTrades}
        labels={d.stats}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent Trades */}
        <div className="rounded-xl border">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="text-sm font-semibold">{d.recentTrades}</h2>
            <Link
              href={`/${lang}/dashboard/trades`}
              className="text-primary hover:text-primary/80 text-xs font-medium transition-colors"
            >
              {d.viewAll} →
            </Link>
          </div>
          {!recentTrades.length ? (
            <p className="text-muted-foreground px-5 py-6 text-sm">{d.noTrades}</p>
          ) : (
            <ul className="divide-y">
              {recentTrades.map((trade) => (
                <li
                  key={trade.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold uppercase ${sideBadgeClass(trade.side)}`}
                    >
                      {trade.side === "buy" ? d.buy : d.sell}
                    </span>
                    <span className="font-mono text-sm font-medium">
                      {trade.symbol}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className="text-muted-foreground text-xs">
                      {formatUsdStr(trade.avg_fill_price ?? trade.price_per_unit)}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${TRADE_STATUS_CLASSES[trade.status] ?? ""}`}
                    >
                      {trade.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Signals */}
        <div className="rounded-xl border">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="text-sm font-semibold">{d.recentSignals}</h2>
            <Link
              href={`/${lang}/dashboard/signals`}
              className="text-primary hover:text-primary/80 text-xs font-medium transition-colors"
            >
              {d.viewAll} →
            </Link>
          </div>
          {!recentSignals.length ? (
            <p className="text-muted-foreground px-5 py-6 text-sm">{d.noSignals}</p>
          ) : (
            <ul className="divide-y">
              {recentSignals.map((signal) => (
                <li
                  key={signal.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold uppercase ${sideBadgeClass(signal.side)}`}
                    >
                      {signal.side === "buy" ? d.buy : d.sell}
                    </span>
                    <span className="font-mono text-sm font-medium">
                      {signal.symbol}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className="text-muted-foreground text-xs">
                      {formatUsdStr(signal.price_at_signal)}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        signal.is_executed
                          ? BOOL_TRUE_BADGE_CLASS
                          : BOOL_FALSE_BADGE_CLASS
                      }`}
                    >
                      {signal.is_executed
                        ? d.signalLog.yes
                        : d.signalLog.no}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Account Transfers */}
      {transfers && transfers.length > 0 && (
        <div className="mt-8 rounded-xl border">
          <div className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold">Account Transfers</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b text-xs">
                  <th className="px-5 py-3 text-left font-medium">Type</th>
                  <th className="px-5 py-3 text-right font-medium">USD Amount</th>
                  <th className="px-5 py-3 text-right font-medium">THB Amount</th>
                  <th className="px-5 py-3 text-right font-medium">Exchange Rate</th>
                  <th className="px-5 py-3 text-right font-medium">Target / Remaining</th>
                  <th className="px-5 py-3 text-right font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(transfers as AccountTransfer[]).map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30">
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold capitalize ${sideBadgeClass(t.type === "deposit" ? "buy" : "sell")}`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono">
                      {formatUsdStr(t.amount_usd)}
                    </td>
                    <td className="text-muted-foreground px-5 py-3 text-right font-mono">
                      {formatThbStr(t.amount_thb)}
                    </td>
                    <td className="text-muted-foreground px-5 py-3 text-right font-mono">
                      {parseFloat(t.exchange_rate).toFixed(4)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="font-medium">{t.remaining_trades ?? 0}</span>
                      <span className="text-muted-foreground"> / {t.target_trades}</span>
                    </td>
                    <td className="text-muted-foreground px-5 py-3 text-right text-xs">
                      {formatDateTime(t.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
