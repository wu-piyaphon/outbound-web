import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "@/components/ui/sonner";
import { LOCALES, isLocale } from "@/lib/i18n/config";
import { THEME_COOKIE_NAME } from "@/lib/theme/shared";
import { getDictionary } from "./dictionaries";
import "../globals.css";

// Runs synchronously before paint: reads the theme cookie (or
// prefers-color-scheme for "system"/first visit) and applies the class +
// color-scheme to <html>. Inlined here so the layout stays fully static —
// reading cookies() in the layout would force the whole route dynamic under
// cacheComponents.
const themeInitScript = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE_NAME}=([^;]*)/);var p=m?decodeURIComponent(m[1]):'system';var r=p==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):p;var e=document.documentElement;if(r==='dark')e.classList.add('dark');e.style.colorScheme=r;}catch(_){}})();`;

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: {
      default: "Outbound — Automated stock trading",
      template: "%s · Outbound",
    },
    description: dict.hero.subtitle,
    metadataBase: process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
      : undefined,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-background text-foreground flex min-h-full flex-col font-sans">
        <Navbar lang={lang} dict={dict} />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer lang={lang} dict={dict} />
        <Toaster />
      </body>
    </html>
  );
}
