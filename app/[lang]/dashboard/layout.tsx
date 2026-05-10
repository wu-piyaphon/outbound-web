import type React from "react";
import { notFound } from "next/navigation";

import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { getDictionary } from "@/app/[lang]/dictionaries";
import { isLocale } from "@/lib/i18n/config";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <div className="flex flex-1 flex-col">
      <DashboardNav
        lang={lang}
        labels={{
          overview: dict.dashboard.overview,
          trades: dict.dashboard.trades,
          signals: dict.dashboard.signals,
          transfers: dict.dashboard.transfers,
          chart: dict.chart.title,
        }}
      />
      <div className="flex-1">{children}</div>
    </div>
  );
}
