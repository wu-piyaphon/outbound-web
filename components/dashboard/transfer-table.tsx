"use client";

import { useState, useMemo } from "react";

import { cn } from "@/lib/utils";
import { formatUsdStr, formatThbStr, formatDateTime } from "@/lib/format";
import { sideBadgeClass } from "@/lib/dashboard/constants";
import type { AccountTransfer } from "@/lib/types/database";

type TransferTableLabels = {
  title: string;
  subtitle: string;
  type: string;
  amountUsd: string;
  amountThb: string;
  rate: string;
  feeTHB: string;
  feeUSD: string;
  tradesUsed: string;
  createdAt: string;
  filterType: string;
  depositOnly: string;
  withdrawalOnly: string;
  noResults: string;
  empty: string;
  deposit: string;
  withdrawal: string;
  stats: {
    totalDeposited: string;
    totalFees: string;
    slotsUsed: string;
    count: string;
  };
};

type TransferTableProps = {
  transfers: AccountTransfer[];
  labels: TransferTableLabels;
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card px-5 py-4">
      <p className="text-muted-foreground text-xs font-medium">{label}</p>
      <p className="mt-1 font-mono text-xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

export function TransferTable({ transfers, labels }: TransferTableProps) {
  const [typeFilter, setTypeFilter] = useState<"" | "deposit" | "withdrawal">("");

  const stats = useMemo(() => {
    const totalDepositedUsd = transfers
      .filter((t) => t.type === "deposit")
      .reduce((sum, t) => sum + parseFloat(t.amount_usd), 0);

    const totalFeeUsd = transfers.reduce((sum, t) => {
      const feeThbInUsd =
        parseFloat(t.exchange_rate) > 0
          ? parseFloat(t.fee_thb) / parseFloat(t.exchange_rate)
          : 0;
      const feeUsd = t.fee_usd ? parseFloat(t.fee_usd) : 0;
      return sum + feeThbInUsd + feeUsd;
    }, 0);

    const slotsUsed = transfers.reduce((sum, t) => {
      const remaining = t.remaining_trades ?? t.target_trades;
      return sum + (t.target_trades - remaining);
    }, 0);

    return { totalDepositedUsd, totalFeeUsd, slotsUsed, count: transfers.length };
  }, [transfers]);

  const filtered = useMemo(
    () =>
      typeFilter
        ? transfers.filter((t) => t.type === typeFilter)
        : transfers,
    [transfers, typeFilter],
  );

  if (!transfers.length) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">
        {labels.empty}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={labels.stats.totalDeposited}
          value={`$${stats.totalDepositedUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        <StatCard
          label={labels.stats.totalFees}
          value={`$${stats.totalFeeUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        <StatCard
          label={labels.stats.slotsUsed}
          value={stats.slotsUsed.toString()}
        />
        <StatCard
          label={labels.stats.count}
          value={stats.count.toString()}
        />
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value as "" | "deposit" | "withdrawal")
          }
          className="border-input bg-background h-9 rounded-md border px-3 text-sm shadow-xs"
        >
          <option value="">{labels.filterType}</option>
          <option value="deposit">{labels.depositOnly}</option>
          <option value="withdrawal">{labels.withdrawalOnly}</option>
        </select>
      </div>

      {!filtered.length ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          {labels.noResults}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs">
                <th className="px-4 py-3 text-left font-medium">{labels.type}</th>
                <th className="px-4 py-3 text-right font-medium">{labels.amountUsd}</th>
                <th className="px-4 py-3 text-right font-medium">{labels.amountThb}</th>
                <th className="px-4 py-3 text-right font-medium">{labels.rate}</th>
                <th className="px-4 py-3 text-right font-medium">{labels.feeTHB}</th>
                <th className="px-4 py-3 text-right font-medium">{labels.feeUSD}</th>
                <th className="px-4 py-3 text-center font-medium">{labels.tradesUsed}</th>
                <th className="px-4 py-3 text-right font-medium">{labels.createdAt}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((t) => {
                const remaining = t.remaining_trades ?? t.target_trades;
                const used = t.target_trades - remaining;
                const pct =
                  t.target_trades > 0
                    ? Math.min(100, (used / t.target_trades) * 100)
                    : 0;

                return (
                  <tr key={t.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded px-2 py-0.5 text-xs font-semibold capitalize",
                          sideBadgeClass(t.type === "deposit" ? "buy" : "sell"),
                        )}
                      >
                        {t.type === "deposit" ? labels.deposit : labels.withdrawal}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      {formatUsdStr(t.amount_usd)}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-right font-mono text-xs">
                      {formatThbStr(t.amount_thb)}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-right font-mono text-xs">
                      {parseFloat(t.exchange_rate).toFixed(4)}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-right font-mono text-xs">
                      {formatThbStr(t.fee_thb)}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-right font-mono text-xs">
                      {t.fee_usd ? formatUsdStr(t.fee_usd) : "—"}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-xs">
                          <span className="font-medium">{used}</span>
                          <span className="text-muted-foreground"> / {t.target_trades}</span>
                        </span>
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              pct >= 100
                                ? "bg-emerald-500"
                                : pct > 50
                                  ? "bg-blue-500"
                                  : "bg-zinc-400",
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-right text-xs">
                      {formatDateTime(t.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
