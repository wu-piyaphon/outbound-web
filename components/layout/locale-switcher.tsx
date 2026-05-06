"use client";

import { Languages } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";

type LocaleSwitcherProps = {
  current: Locale;
  label: string;
};

export function LocaleSwitcher({ current, label }: LocaleSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === current) return;
    const segments = pathname.split("/");
    // segments[0] is empty (leading "/"), segments[1] is the current locale.
    segments[1] = next;
    const nextPath = segments.join("/") || `/${next}`;
    startTransition(() => router.push(nextPath));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={label}
          disabled={isPending}
          className="gap-2"
        >
          <Languages className="h-4 w-4" />
          <span className="text-xs uppercase">{current}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onSelect={() => switchTo(locale)}
            className={locale === current ? "font-semibold" : undefined}
          >
            {LOCALE_LABELS[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
