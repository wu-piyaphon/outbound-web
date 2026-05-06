"use client";

import { useState, useMemo } from "react";

import { Input } from "@/components/ui/input";
import {
  formatUsdStr,
  formatIndicator,
  formatDateTime,
} from "@/lib/format";
import {
  sideBadgeClass,
  BOOL_TRUE_BADGE_CLASS,
  BOOL_FALSE_BADGE_CLASS,
} from "@/lib/dashboard/constants";
import type { Signal } from "@/lib/types/database";

type SignalRow = Pick<
  Signal,
  | "id"
  | "symbol"
  | "side"
  | "price_at_signal"
  | "indicators"
  | "is_executed"
  | "reasoning"
  | "created_at"
>;

interface SignalTableProps {
  signals: SignalRow[];
  labels: {
    symbol: string;
    side: string;
    price: string;
    ema: string;
    rsi: string;
    atr: string;
    executed: string;
    reasoning: string;
    createdAt: string;
    filterSymbol: string;
    filterSide: string;
    filterExecuted: string;
    executedOnly: string;
    unexecutedOnly: string;
    noResults: string;
    empty: string;
    yes: string;
    no: string;
  };
}

export function SignalTable({ signals, labels }: SignalTableProps) {
  const [symbolFilter, setSymbolFilter] = useState("");
  const [sideFilter, setSideFilter] = useState<"" | "buy" | "sell">("");
  const [executedFilter, setExecutedFilter] = useState<"" | "true" | "false">("");

  const filtered = useMemo(
    () =>
      signals.filter((s) => {
        if (
          symbolFilter &&
          !s.symbol.toLowerCase().includes(symbolFilter.toLowerCase())
        )
          return false;
        if (sideFilter && s.side !== sideFilter) return false;
        if (
          executedFilter !== "" &&
          String(s.is_executed) !== executedFilter
        )
          return false;
        return true;
      }),
    [signals, symbolFilter, sideFilter, executedFilter],
  );

  if (!signals.length) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">
        {labels.empty}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder={labels.filterSymbol}
          value={symbolFilter}
          onChange={(e) => setSymbolFilter(e.target.value)}
          className="w-48"
        />
        <select
          value={sideFilter}
          onChange={(e) => setSideFilter(e.target.value as "" | "buy" | "sell")}
          className="border-input bg-background h-9 rounded-md border px-3 text-sm shadow-xs"
        >
          <option value="">{labels.filterSide}</option>
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
        <select
          value={executedFilter}
          onChange={(e) =>
            setExecutedFilter(e.target.value as "" | "true" | "false")
          }
          className="border-input bg-background h-9 rounded-md border px-3 text-sm shadow-xs"
        >
          <option value="">{labels.filterExecuted}</option>
          <option value="true">{labels.executedOnly}</option>
          <option value="false">{labels.unexecutedOnly}</option>
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
                <th className="px-4 py-3 text-left font-medium">{labels.symbol}</th>
                <th className="px-4 py-3 text-left font-medium">{labels.side}</th>
                <th className="px-4 py-3 text-right font-medium">{labels.price}</th>
                <th className="px-4 py-3 text-right font-medium">{labels.ema}</th>
                <th className="px-4 py-3 text-right font-medium">{labels.rsi}</th>
                <th className="px-4 py-3 text-right font-medium">{labels.atr}</th>
                <th className="px-4 py-3 text-center font-medium">{labels.executed}</th>
                <th className="px-4 py-3 text-left font-medium">{labels.reasoning}</th>
                <th className="px-4 py-3 text-right font-medium">{labels.createdAt}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((signal) => (
                <tr key={signal.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono font-medium">
                    {signal.symbol}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold uppercase ${sideBadgeClass(signal.side)}`}
                    >
                      {signal.side}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs">
                    {formatUsdStr(signal.price_at_signal)}
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-right font-mono text-xs">
                    {formatIndicator(signal.indicators?.ema)}
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-right font-mono text-xs">
                    {formatIndicator(signal.indicators?.rsi)}
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-right font-mono text-xs">
                    {formatIndicator(signal.indicators?.atr)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        signal.is_executed
                          ? BOOL_TRUE_BADGE_CLASS
                          : BOOL_FALSE_BADGE_CLASS
                      }`}
                    >
                      {signal.is_executed ? labels.yes : labels.no}
                    </span>
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-left text-xs">
                    {signal.reasoning ?? "—"}
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-right text-xs">
                    {formatDateTime(signal.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
