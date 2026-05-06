"use client";

import { useState, useMemo } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  formatUsdStr,
  formatQty,
  formatDateTimeCompact,
  pnlColorClass,
} from "@/lib/format";
import {
  TRADE_STATUS_CLASSES,
  sideBadgeClass,
} from "@/lib/dashboard/constants";
import type { Trade } from "@/lib/types/database";

type TradeRow = Pick<
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
>;

interface TradeTableProps {
  trades: TradeRow[];
  labels: {
    symbol: string;
    side: string;
    qty: string;
    entry: string;
    fill: string;
    stopLoss: string;
    takeProfit: string;
    status: string;
    fee: string;
    pnl: string;
    filledAt: string;
    createdAt: string;
    filterSymbol: string;
    filterSide: string;
    filterStatus: string;
    noResults: string;
    empty: string;
  };
}

function computePnL(
  trade: TradeRow,
  buyMap: Map<string, TradeRow>,
): { colorClass: string; display: string } {
  if (trade.side !== "sell" || !trade.parent_id) return { colorClass: "", display: "—" };
  const parent = buyMap.get(trade.parent_id);
  if (!parent?.avg_fill_price || !trade.avg_fill_price)
    return { colorClass: "", display: "—" };

  const pnl =
    (parseFloat(trade.avg_fill_price) - parseFloat(parent.avg_fill_price)) *
    parseFloat(trade.quantity);
  const sign = pnl > 0 ? "+" : "";
  return {
    colorClass: pnlColorClass(pnl),
    display: `${sign}${formatUsdStr(pnl.toString())}`,
  };
}

export function TradeTable({ trades, labels }: TradeTableProps) {
  const [symbolFilter, setSymbolFilter] = useState("");
  const [sideFilter, setSideFilter] = useState<"" | "buy" | "sell">("");
  const [statusFilter, setStatusFilter] = useState<"" | Trade["status"]>("");

  const buyMap = useMemo(
    () => new Map(trades.filter((t) => t.side === "buy").map((t) => [t.id, t])),
    [trades],
  );

  const filtered = useMemo(
    () =>
      trades.filter((t) => {
        if (
          symbolFilter &&
          !t.symbol.toLowerCase().includes(symbolFilter.toLowerCase())
        )
          return false;
        if (sideFilter && t.side !== sideFilter) return false;
        if (statusFilter && t.status !== statusFilter) return false;
        return true;
      }),
    [trades, symbolFilter, sideFilter, statusFilter],
  );

  const statuses = [
    "pending",
    "open",
    "filled",
    "cancelled",
    "rejected",
  ] as const;

  if (!trades.length) {
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
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "" | Trade["status"])
          }
          className="border-input bg-background h-9 rounded-md border px-3 text-sm shadow-xs"
        >
          <option value="">{labels.filterStatus}</option>
          {statuses.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
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
                <th className="px-4 py-3 text-right font-medium">{labels.qty}</th>
                <th className="px-4 py-3 text-right font-medium">{labels.entry}</th>
                <th className="px-4 py-3 text-right font-medium">{labels.fill}</th>
                <th className="px-4 py-3 text-right font-medium">{labels.stopLoss}</th>
                <th className="px-4 py-3 text-right font-medium">{labels.takeProfit}</th>
                <th className="px-4 py-3 text-center font-medium">{labels.status}</th>
                <th className="px-4 py-3 text-right font-medium">{labels.fee}</th>
                <th className="px-4 py-3 text-right font-medium">{labels.pnl}</th>
                <th className="px-4 py-3 text-right font-medium">{labels.filledAt}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((trade) => {
                const pnl = computePnL(trade, buyMap);
                const totalFee =
                  trade.commission_fee || trade.fx_fee_amortized
                    ? (
                        parseFloat(trade.commission_fee ?? "0") +
                        parseFloat(trade.fx_fee_amortized ?? "0")
                      ).toString()
                    : null;

                return (
                  <tr key={trade.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono font-medium">
                      {trade.symbol}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded px-2 py-0.5 text-xs font-semibold uppercase",
                          sideBadgeClass(trade.side),
                        )}
                      >
                        {trade.side}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      {formatQty(trade.quantity)}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-right font-mono text-xs">
                      {formatUsdStr(trade.price_per_unit)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      {formatUsdStr(trade.avg_fill_price)}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-right font-mono text-xs">
                      {formatUsdStr(trade.stop_loss)}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-right font-mono text-xs">
                      {formatUsdStr(trade.take_profit)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 text-xs font-medium capitalize",
                          TRADE_STATUS_CLASSES[trade.status] ?? "",
                        )}
                      >
                        {trade.status}
                      </span>
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-right font-mono text-xs">
                      {formatUsdStr(totalFee)}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right font-mono text-xs",
                        pnl.colorClass,
                      )}
                    >
                      {pnl.display}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-right text-xs">
                      {formatDateTimeCompact(trade.filled_at ?? trade.created_at)}
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
