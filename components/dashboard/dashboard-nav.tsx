"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ArrowLeftRight, BarChart2, LayoutDashboard } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

type DashboardNavProps = {
  lang: Locale;
  labels: {
    overview: string;
    trades: string;
    signals: string;
    transfers: string;
  };
};

export function DashboardNav({ lang, labels }: DashboardNavProps) {
  const pathname = usePathname();

  const links = [
    {
      href: `/${lang}/dashboard`,
      label: labels.overview,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: `/${lang}/dashboard/trades`,
      label: labels.trades,
      icon: BarChart2,
      exact: false,
    },
    {
      href: `/${lang}/dashboard/signals`,
      label: labels.signals,
      icon: Activity,
      exact: false,
    },
    {
      href: `/${lang}/dashboard/transfers`,
      label: labels.transfers,
      icon: ArrowLeftRight,
      exact: false,
    },
  ] as const;

  return (
    <nav className="border-b">
      <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 sm:px-6 lg:px-8">
        {links.map(({ href, label, icon: IconComp, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
              )}
            >
              <IconComp className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
