import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildSubcategoryMap } from "@/lib/labels";
import { getEstablishments, getSiteSectionBySlug, getContentPages, getCategoryBySlug, getSubcategories } from "@/lib/data";
import { Section } from "@/components/section";
import { ContentHub } from "@/components/content-hub";
import { CategoryEstablishments } from "@/components/category-establishments";

// Cached and reused for every visitor for up to 1h instead of hitting the DB on
// every request — admin saves still show up immediately via revalidatePath.
// The subcategory filter (`?sub=`) is handled client-side (see
// CategoryEstablishments) specifically so this page never has to read
// searchParams, which would otherwise force it out of ISR entirely.
export const revalidate = 3600;

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
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;
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
    getEstablishments({ type: cat.type }),
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
        <Suspense>
          <CategoryEstablishments
            locale={locale}
            category={category}
            establishments={establishments}
            subcategories={subcategories}
            subcategoryMap={subcategoryMap}
            allLabel={t("all")}
            noResultsLabel={t("noResults")}
          />
        </Suspense>
      </Section>
    </div>
  );
}
