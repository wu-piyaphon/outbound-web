import type React from "react";
import { notFound, redirect } from "next/navigation";

import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { getDictionary } from "@/app/[lang]/dictionaries";
import { isLocale } from "@/lib/i18n/config";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [user, dict] = await Promise.all([getCurrentUser(), getDictionary(lang)]);

  if (!user) redirect(`/${lang}/signin`);

  return (
    <div className="flex flex-1 flex-col">
      <DashboardNav
        lang={lang}
        labels={{
          overview: dict.dashboard.overview,
          trades: dict.dashboard.trades,
          signals: dict.dashboard.signals,
        }}
      />
      <div className="flex-1">{children}</div>
    </div>
  );
}
