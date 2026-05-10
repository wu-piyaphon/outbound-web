import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "@/components/ui/sonner";
import { LOCALES, isLocale } from "@/lib/i18n/config";
import { getServerTheme } from "@/lib/theme/server";
import { getDictionary } from "./dictionaries";
import "../globals.css";

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

  const [dict, serverTheme] = await Promise.all([
    getDictionary(lang),
    getServerTheme(),
  ]);

  // Apply explicit light/dark class on <html> when we know the user's choice;
  // for "system" or first visits, the async theme-init.js script sets it
  // before paint based on prefers-color-scheme.
  const themeClass =
    serverTheme === "dark" ? "dark" : serverTheme === "light" ? "" : "";

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${themeClass} h-full antialiased`}
      style={
        serverTheme === "dark" || serverTheme === "light"
          ? { colorScheme: serverTheme }
          : undefined
      }
    >
      <body className="bg-background text-foreground flex min-h-full flex-col font-sans">
        <Navbar lang={lang} dict={dict} />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer lang={lang} dict={dict} />
        <Toaster />
      </body>
    </html>
  );
}
