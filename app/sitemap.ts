import type { MetadataRoute } from "next";

import { LOCALES } from "@/lib/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const routes = ["", "/chart", "/signin", "/signup"];

  return LOCALES.flatMap((lang) =>
    routes.map((route) => ({
      url: `${base}/${lang}${route}`,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7,
    })),
  );
}
