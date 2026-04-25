export const THEME_COOKIE_NAME = "outbound-theme";
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export function isTheme(value: string | null | undefined): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}
