const USD_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const USD_PRICE_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

const THB_FORMATTER = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
});

const PERCENT_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});

/** Formats a numeric USD amount (e.g. a computed total). */
export function formatUsd(value: number): string {
  return USD_FORMATTER.format(value);
}

/**
 * Formats a USD price string from the database (2–4 decimal places).
 * Returns "—" for null/undefined/empty values.
 */
export function formatUsdStr(value: string | null | undefined): string {
  if (!value) return "—";
  return USD_PRICE_FORMATTER.format(parseFloat(value));
}

/** Formats a THB amount string from the database. */
export function formatThbStr(value: string): string {
  return THB_FORMATTER.format(parseFloat(value));
}

/** Formats a ratio (e.g. 0.0234 → "+2.34%"). */
export function formatPercent(ratio: number): string {
  return PERCENT_FORMATTER.format(ratio);
}

/**
 * Formats a quantity string (up to 6 decimal places, no trailing zeros).
 */
export function formatQty(value: string): string {
  return parseFloat(value).toLocaleString("en-US", { maximumFractionDigits: 6 });
}

/**
 * Formats a numeric indicator string (e.g. EMA/RSI/ATR) to 4 decimal places.
 * Returns "—" for null/undefined/empty values.
 */
export function formatIndicator(value: string | null | undefined): string {
  if (!value) return "—";
  return parseFloat(value).toFixed(4);
}

/**
 * Full date-time: "Jan 5, 2026, 09:30 AM" — used in tables where year context matters.
 * Returns "—" for null/undefined values.
 */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Compact date-time without year: "Jan 5, 09:30 AM" — used where rows are
 * always recent and vertical space is limited (e.g. trade history).
 * Returns "—" for null/undefined values.
 */
export function formatDateTimeCompact(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function pnlColorClass(value: number): string {
  if (value > 0) return "text-emerald-600 dark:text-emerald-400";
  if (value < 0) return "text-red-600 dark:text-red-400";
  return "text-zinc-500 dark:text-zinc-400";
}
