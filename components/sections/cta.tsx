import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/app/[lang]/dictionaries";

interface CtaProps {
  lang: Locale;
  dict: Dictionary;
}

export function Cta({ lang, dict }: CtaProps) {
  return (
    <section id="pricing" className="border-t">
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {dict.cta.title}
        </h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base">
          {dict.cta.subtitle}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href={`/${lang}/signup`}>{dict.cta.primary}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={`/${lang}/chart`}>{dict.cta.secondary}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
