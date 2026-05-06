import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type HeroProps = {
  lang: Locale;
  dict: Dictionary;
};

export function Hero({ lang, dict }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent"
        aria-hidden
      />
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            {dict.hero.eyebrow}
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {dict.hero.title}
          </h1>
          <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-relaxed">
            {dict.hero.subtitle}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href={`/${lang}/signup`}>
                {dict.hero.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={`/${lang}#reliability`}>
                {dict.hero.secondaryCta}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
