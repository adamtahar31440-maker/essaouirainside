import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getAllEstablishments, getCategories } from "@/lib/data";

const BASE_URL = "https://essaouirainside.com";

const STATIC_PATHS = [
  "",
  "/recherche",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [establishments, categories] = await Promise.all([
    getAllEstablishments(),
    getCategories(),
  ]);

  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of STATIC_PATHS) {
      entries.push({ url: `${BASE_URL}/${locale}${path}`, changeFrequency: "weekly" });
    }
    for (const c of categories) {
      entries.push({ url: `${BASE_URL}/${locale}/${c.slug}`, changeFrequency: "weekly" });
    }
    for (const e of establishments) {
      const cat = categoryById.get(e.categoryId);
      const path = cat ? cat.slug : null;
      if (!path) continue;
      entries.push({ url: `${BASE_URL}/${locale}/${path}/${e.slug}`, changeFrequency: "monthly" });
    }
  }

  return entries;
}
