export function buildSubcategoryMap(rows: { slug: string; name: Record<string, string> }[]) {
  return Object.fromEntries(rows.map((r) => [r.slug, r.name]));
}

export function subcategoryLabel(map: Record<string, Record<string, string>>, slug: string, locale: string) {
  return map[slug]?.[locale] ?? map[slug]?.fr ?? slug;
}

// priceLevel is stored internally as "€"/"€€"/"€€€" tier keys (legacy), but the
// site's currency is the Moroccan dirham, so we always display it as Dh tiers.
export const PRICE_LEVELS = ["€", "€€", "€€€"] as const;

const PRICE_LEVEL_LABELS: Record<string, string> = {
  "€": "Dh",
  "€€": "Dh Dh",
  "€€€": "Dh Dh Dh",
};

export function priceLevelLabel(level?: string | null) {
  if (!level) return "";
  return PRICE_LEVEL_LABELS[level] ?? level;
}
