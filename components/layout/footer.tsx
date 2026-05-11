import Link from "next/link";
import { LineChart } from "lucide-react";

import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type FooterProps = {
  lang: Locale;
  dict: Dictionary;
};

// Evaluated once at module load so the Server Component render itself doesn't
// touch the clock (which cacheComponents treats as dynamic data).
const CURRENT_YEAR = new Date().getFullYear();

export function Footer({ lang, dict }: FooterProps) {
  const copyright = dict.footer.copyright.replace("{year}", String(CURRENT_YEAR));

  const columns = [
    {
      title: dict.footer.product,
      links: [
        { href: `/${lang}#features`, label: dict.footer.links.features },
        { href: `/${lang}#reliability`, label: dict.footer.links.reliability },
        { href: `/${lang}/chart`, label: dict.footer.links.chart },
      ],
    },
    {
      title: dict.footer.company,
      links: [
        { href: `/${lang}/about`, label: dict.footer.links.about },
        { href: `/${lang}/contact`, label: dict.footer.links.contact },
      ],
    },
    {
      title: dict.footer.legal,
      links: [
        { href: `/${lang}/terms`, label: dict.footer.links.terms },
        { href: `/${lang}/privacy`, label: dict.footer.links.privacy },
        { href: `/${lang}/risk`, label: dict.footer.links.risk },
      ],
    },
  ];

  return (
    <footer className="bg-muted/30 border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link
              href={`/${lang}`}
              className="flex items-center gap-2 font-semibold"
            >
              <LineChart className="text-primary h-5 w-5" />
              <span>Outbound</span>
            </Link>
            <p className="text-muted-foreground mt-3 text-sm">
              {dict.footer.tagline}
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-4 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t pt-6">
          <p className="text-muted-foreground text-xs leading-relaxed">
            {dict.footer.disclaimer}
          </p>
          <p className="text-muted-foreground mt-3 text-xs">{copyright}</p>
        </div>
      </div>
    </footer>
  );
}
