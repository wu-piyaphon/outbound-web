import { cookies } from "next/headers";

import { isTheme, THEME_COOKIE_NAME, type Theme } from "@/lib/theme/shared";

/**
 * Reads the theme preference from the request cookies on the server.
 * Returns `null` when the cookie is not present so callers can decide whether
 * to render the page without committing to a theme class.
 */
export async function getServerTheme(): Promise<Theme | null> {
  const store = await cookies();
  const value = store.get(THEME_COOKIE_NAME)?.value;
  return isTheme(value) ? value : null;
}
