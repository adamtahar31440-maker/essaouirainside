import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildSubcategoryMap, subcategoryLabel } from "@/lib/labels";
import { getEstablishments, getSiteSectionBySlug, getContentPages, getCategoryBySlug, getSubcategories } from "@/lib/data";
import { EstablishmentCard } from "@/components/establishment-card";
import { Section } from "@/components/section";
import { ContentHub } from "@/components/content-hub";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale, category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) {
    const section = await getSiteSectionBySlug(category);
    if (!section) return {};
    const label = section.name[locale] ?? section.name.fr;
    return {
      title: label,
      alternates: { canonical: `https://essaouirainside.com/${locale}/${category}` },
    };
  }
  const label = cat.name[locale] ?? cat.name.fr;
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

  const cat = await getCategoryBySlug(category);
  if (!cat) {
    const section = await getSiteSectionBySlug(category);
    if (!section) notFound();
    const pages = await getContentPages(category);
    return (
      <ContentHub
        locale={locale}
        basePath={category}
        title={section.name[locale] ?? section.name.fr}
        pages={pages}
      />
    );
  }

  if (cat.status !== "active") notFound();

  const [t, establishments, subcategories] = await Promise.all([
    getTranslations("search"),
    getEstablishments({ type: cat.type, subcategory: sub }),
    getSubcategories(cat.id),
  ]);
  const subcategoryMap = buildSubcategoryMap(subcategories);

  return (
    <div>
      <div className="bg-sand/40 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="text-3xl font-semibold text-ocean-dark sm:text-4xl">
            {cat.name[locale] ?? cat.name.fr}
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
              key={s.slug}
              href={`/${locale}/${category}?sub=${s.slug}`}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium",
                sub === s.slug ? "border-ocean-dark bg-ocean-dark text-white" : "border-black/10 text-foreground/70"
              )}
            >
              {subcategoryLabel(subcategoryMap, s.slug, locale)}
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
                subcategory={subcategoryLabel(subcategoryMap, e.subcategory, locale)}
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
