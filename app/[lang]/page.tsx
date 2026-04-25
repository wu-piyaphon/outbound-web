import { notFound } from "next/navigation";

import { Cta } from "@/components/sections/cta";
import { FeatureGrid } from "@/components/sections/feature-grid";
import { Hero } from "@/components/sections/hero";
import { Reliability } from "@/components/sections/reliability";
import { isLocale } from "@/lib/i18n/config";

import { getDictionary } from "./dictionaries";

export default async function LandingPage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <>
      <Hero lang={lang} dict={dict} />
      <FeatureGrid dict={dict} />
      <Reliability dict={dict} />
      <Cta lang={lang} dict={dict} />
    </>
  );
}
