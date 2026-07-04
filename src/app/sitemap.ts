import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import {
  getAllEstablishments,
  getCategories,
  getArticles,
  getContentPages,
  getEvents,
} from "@/lib/data";

const BASE_URL = "https://essaouirainside.com";

const STATIC_PATHS = [
  "",
  "/decouvrir",
  "/vivre-a-essaouira",
  "/blog",
  "/agenda",
  "/recherche",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [establishments, categories, articles, decouvrir, vivre, events] = await Promise.all([
    getAllEstablishments(),
    getCategories(),
    getArticles(),
    getContentPages("decouvrir"),
    getContentPages("vivre"),
    getEvents(),
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
    for (const a of articles) {
      entries.push({ url: `${BASE_URL}/${locale}/blog/${a.slug}`, changeFrequency: "monthly" });
    }
    for (const p of decouvrir) {
      entries.push({ url: `${BASE_URL}/${locale}/decouvrir/${p.slug}`, changeFrequency: "yearly" });
    }
    for (const p of vivre) {
      entries.push({ url: `${BASE_URL}/${locale}/vivre-a-essaouira/${p.slug}`, changeFrequency: "yearly" });
    }
    for (const ev of events) {
      entries.push({ url: `${BASE_URL}/${locale}/agenda/${ev.slug}`, changeFrequency: "weekly" });
    }
  }

  return entries;
}
