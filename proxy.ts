import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  LOCALES,
  type Locale,
  isLocale,
} from "@/lib/i18n/config";
import { publicEnv } from "@/lib/env";

const PUBLIC_FILE = /\.(?:[\w]+)$/;

// Routes that don't depend on the authenticated user. We skip the Supabase
// session refresh on these to avoid an auth round-trip on every prefetch and
// navigation through marketing / pre-login pages.
const PUBLIC_PATH_SUFFIXES = new Set<string>(["", "/signin", "/signup"]);

function isPublicLocalePath(pathname: string, locale: Locale): boolean {
  const suffix = pathname.slice(`/${locale}`.length);
  return PUBLIC_PATH_SUFFIXES.has(suffix);
}

function detectLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isLocale(cookieLocale)) {
    return cookieLocale;
  }

  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const headers = { "accept-language": acceptLanguage };
  const languages = new Negotiator({ headers }).languages();

  try {
    const matched = match(
      languages,
      LOCALES as readonly string[],
      DEFAULT_LOCALE,
    );
    return isLocale(matched) ? matched : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

function persistLocaleCookie(
  request: NextRequest,
  response: NextResponse,
  locale: Locale,
): void {
  if (request.cookies.get(LOCALE_COOKIE)?.value === locale) return;
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
  });
}

async function refreshSupabaseSession(
  request: NextRequest,
  response: NextResponse,
): Promise<void> {
  const supabase = createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  await supabase.auth.getUser();
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Skip OAuth callback (must keep its full URL intact for Supabase code exchange).
  if (pathname.startsWith("/auth/")) {
    const passthrough = NextResponse.next();
    await refreshSupabaseSession(request, passthrough);
    return passthrough;
  }

  const pathLocale = LOCALES.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (!pathLocale) {
    const locale = detectLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    const redirect = NextResponse.redirect(url);
    persistLocaleCookie(request, redirect, locale);
    return redirect;
  }

  const response = NextResponse.next();
  // Keep the cookie in sync with whatever locale segment the user is visiting,
  // so a manual URL change (or LocaleSwitcher push) sticks for next time.
  persistLocaleCookie(request, response, pathLocale);

  // Only refresh the Supabase session for routes that actually need it.
  // Public marketing / auth-form pages avoid an auth round-trip on every
  // prefetch and navigation.
  if (!isPublicLocalePath(pathname, pathLocale)) {
    await refreshSupabaseSession(request, response);
  }

  return response;
}

export const config = {
  matcher: [
    // Skip Next internals, static files, and API routes.
    "/((?!_next/|api/|favicon\\.ico|.*\\..*).*)",
  ],
};

// Re-export so static asset detection above stays self-documenting.
export { PUBLIC_FILE };
