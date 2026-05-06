import type { TradeStatus } from "@/lib/types/database";

/** Maps trade status → Tailwind badge classes. */
export const TRADE_STATUS_CLASSES: Record<TradeStatus, string> = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  filled:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  cancelled: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

/** Tailwind classes for a buy-side badge. */
export const BUY_BADGE_CLASS =
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";

/** Tailwind classes for a sell-side badge. */
export const SELL_BADGE_CLASS =
  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";

/** Returns the badge class for a given trade side. */
export function sideBadgeClass(side: string): string {
  return side === "buy" ? BUY_BADGE_CLASS : SELL_BADGE_CLASS;
}

/** Tailwind classes for a "true/executed" boolean badge. */
export const BOOL_TRUE_BADGE_CLASS =
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";

/** Tailwind classes for a "false/not executed" boolean badge. */
export const BOOL_FALSE_BADGE_CLASS =
  "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
