import { DollarSign, TrendingUp, Wallet, Activity } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatUsd } from "@/lib/format";
import type { AccountTransfer, Trade } from "@/lib/types/database";

interface BalanceCardsProps {
  transfers: AccountTransfer[];
  trades: Pick<Trade, "id" | "parent_id" | "side" | "status">[];
  labels: {
    totalDeposited: string;
    totalFees: string;
    availableSlots: string;
    openPositions: string;
  };
}

export function BalanceCards({ transfers, trades, labels }: BalanceCardsProps) {
  const deposits = transfers.filter((t) => t.type === "deposit");

  const totalDeposited = deposits.reduce(
    (sum, t) => sum + parseFloat(t.amount_usd),
    0,
  );

  const totalFees = deposits.reduce((sum, t) => {
    return sum + (t.fee_usd ? parseFloat(t.fee_usd) : 0);
  }, 0);

  const availableSlots = transfers.reduce(
    (sum, t) => sum + (t.remaining_trades ?? 0),
    0,
  );

  // Open positions: filled/open buy trades with no paired sell child
  const soldParentIds = new Set(
    trades
      .filter((t) => t.side === "sell")
      .map((t) => t.parent_id)
      .filter(Boolean),
  );
  const openPositions = trades.filter(
    (t) =>
      t.side === "buy" &&
      (t.status === "filled" || t.status === "open") &&
      !soldParentIds.has(t.id),
  ).length;

  const stats = [
    {
      label: labels.totalDeposited,
      value: formatUsd(totalDeposited),
      icon: DollarSign,
      description: `${deposits.length} deposit${deposits.length !== 1 ? "s" : ""}`,
    },
    {
      label: labels.totalFees,
      value: formatUsd(totalFees),
      icon: Wallet,
      description: "FX + wire fees",
    },
    {
      label: labels.availableSlots,
      value: String(availableSlots),
      icon: TrendingUp,
      description: "trade slots remaining",
    },
    {
      label: labels.openPositions,
      value: String(openPositions),
      icon: Activity,
      description: "active bot positions",
    },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, description }) => (
        <Card key={label} className="gap-2 py-5">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                {label}
              </CardTitle>
              <Icon className="text-muted-foreground h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
