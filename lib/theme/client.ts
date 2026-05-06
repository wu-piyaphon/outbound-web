"use client";

import { useSyncExternalStore } from "react";

import {
  THEME_COOKIE_MAX_AGE,
  THEME_COOKIE_NAME,
  isTheme,
  type ResolvedTheme,
  type Theme,
} from "@/lib/theme/shared";

export {
  THEME_COOKIE_NAME,
  isTheme,
  type ResolvedTheme,
  type Theme,
} from "@/lib/theme/shared";

function readCookieTheme(): Theme {
  if (typeof document === "undefined") return "system";
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${THEME_COOKIE_NAME}=([^;]*)`),
  );
  const value = match ? decodeURIComponent(match[1]) : null;
  return isTheme(value) ? value : "system";
}

function writeCookieTheme(theme: Theme): void {
  document.cookie = `${THEME_COOKIE_NAME}=${theme}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; samesite=lax`;
}

function applyTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
}

const SERVER_SNAPSHOT = null;

function subscribeTheme(callback: () => void): () => void {
  window.addEventListener("outbound:theme-change", callback);
  return () => {
    window.removeEventListener("outbound:theme-change", callback);
  };
}

function getThemeSnapshot(): Theme {
  return readCookieTheme();
}

let cachedSystem: ResolvedTheme | null = null;

function subscribeSystem(callback: () => void): () => void {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  cachedSystem = media.matches ? "dark" : "light";
  const onChange = (e: MediaQueryListEvent) => {
    cachedSystem = e.matches ? "dark" : "light";
    callback();
  };
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getSystemSnapshot(): ResolvedTheme {
  if (cachedSystem) return cachedSystem;
  cachedSystem = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  return cachedSystem;
}

export type UseThemeResult = {
  /** User preference: "light" | "dark" | "system". `null` until mounted. */
  theme: Theme | null;
  /** Effective theme actually applied. `null` until mounted. */
  resolvedTheme: ResolvedTheme | null;
  setTheme: (next: Theme) => void;
};

export function useTheme(): UseThemeResult {
  const theme = useSyncExternalStore<Theme | null>(
    subscribeTheme,
    getThemeSnapshot,
    () => SERVER_SNAPSHOT,
  );
  const systemTheme = useSyncExternalStore<ResolvedTheme | null>(
    subscribeSystem,
    getSystemSnapshot,
    () => SERVER_SNAPSHOT,
  );

  const resolvedTheme: ResolvedTheme | null =
    theme === null || systemTheme === null
      ? null
      : theme === "system"
        ? systemTheme
        : theme;

  function setTheme(next: Theme): void {
    writeCookieTheme(next);
    const system = getSystemSnapshot();
    applyTheme(next === "system" ? system : next);
    window.dispatchEvent(new Event("outbound:theme-change"));
  }

  return { theme, resolvedTheme, setTheme };
}
