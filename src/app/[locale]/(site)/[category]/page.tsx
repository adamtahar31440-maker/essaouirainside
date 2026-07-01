import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CATEGORY_PATH_TO_TYPE, CATEGORY_SUBCATEGORIES } from "@/lib/categories";
import { subcategoryLabel } from "@/lib/labels";
import { getEstablishments } from "@/lib/data";
import { EstablishmentCard } from "@/components/establishment-card";
import { Section } from "@/components/section";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale, category } = await params;
  const type = CATEGORY_PATH_TO_TYPE[category];
  if (!type) return {};
  const tCat = await getTranslations({ locale, namespace: "categories" });
  const label = tCat(type as "hebergement" | "restaurant" | "activite" | "shopping");
  return {
    title: label,
    description: `${label} à Essaouira — Essaouira Inside`,
    alternates: { canonical: `https://essaouirainside.com/${locale}/${category}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; category: string }>;
  searchParams: Promise<{ sub?: string }>;
}) {
  const { locale, category } = await params;
  const { sub } = await searchParams;
  setRequestLocale(locale);

  const type = CATEGORY_PATH_TO_TYPE[category];
  if (!type) notFound();

  const [t, tCat, establishments] = await Promise.all([
    getTranslations("search"),
    getTranslations("categories"),
    getEstablishments({ type, subcategory: sub }),
  ]);

  const subcategories = CATEGORY_SUBCATEGORIES[type] ?? [];

  return (
    <div>
      <div className="bg-sand/40 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="text-3xl font-semibold text-ocean-dark sm:text-4xl">
            {tCat(type as "hebergement" | "restaurant" | "activite" | "shopping")}
          </h1>
        </div>
      </div>

      <Section>
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href={`/${locale}/${category}`}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium",
              !sub ? "border-ocean-dark bg-ocean-dark text-white" : "border-black/10 text-foreground/70"
            )}
          >
            {t("all")}
          </Link>
          {subcategories.map((s) => (
            <Link
              key={s}
              href={`/${locale}/${category}?sub=${s}`}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium",
                sub === s ? "border-ocean-dark bg-ocean-dark text-white" : "border-black/10 text-foreground/70"
              )}
            >
              {subcategoryLabel(s, locale)}
            </Link>
          ))}
        </div>

        {establishments.length === 0 ? (
          <p className="text-foreground/60">{t("noResults")}</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {establishments.map((e) => (
              <EstablishmentCard
                key={e.id}
                href={`/${locale}/${category}/${e.slug}`}
                name={e.name[locale] ?? e.name.fr}
                image={e.images?.[0]}
                subcategory={subcategoryLabel(e.subcategory, locale)}
                address={e.address}
                priceLevel={e.priceLevel}
                badge={e.badge}
                wifi={e.wifi}
                parking={e.parking}
              />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
