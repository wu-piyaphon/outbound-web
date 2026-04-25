import "server-only";

import type { Locale } from "@/lib/i18n/config";

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  th: () => import("./dictionaries/th.json").then((m) => m.default),
} as const;

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["en"]>>;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
