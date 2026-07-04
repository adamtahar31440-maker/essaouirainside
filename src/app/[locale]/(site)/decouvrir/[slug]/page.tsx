import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getContentPageBySlug } from "@/lib/data";
import { ContentDetail } from "@/components/content-detail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getContentPageBySlug("decouvrir", slug);
  if (!page) return {};
  const title = page.title[locale] ?? page.title.fr;
  return {
    title,
    description: (page.body[locale] ?? page.body.fr).slice(0, 155),
    alternates: { canonical: `https://essaouirainside.com/${locale}/decouvrir/${slug}` },
  };
}

export default async function DecouvrirDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const page = await getContentPageBySlug("decouvrir", slug);
  if (!page) notFound();

  const t = await getTranslations("common");

  const priceGroups = (page.prices ?? []).reduce<{ category: string | null; items: { name: string; price: number | null }[] }[]>(
    (groups, p) => {
      const categoryLabel = p.category ? p.category[locale] ?? p.category.fr : null;
      const item = { name: p.name[locale] ?? p.name.fr, price: p.price };
      const existing = groups.find((g) => g.category === categoryLabel);
      if (existing) existing.items.push(item);
      else groups.push({ category: categoryLabel, items: [item] });
      return groups;
    },
    []
  );

  return (
    <ContentDetail
      locale={locale}
      backHref={`/${locale}/decouvrir`}
      backLabel={t("back")}
      title={page.title[locale] ?? page.title.fr}
      body={page.body[locale] ?? page.body.fr}
      coverImage={page.coverImage}
      priceGroups={priceGroups}
      pricesTitle={t("pricesTitle")}
      mapPoints={page.mapEnabled ? page.mapPoints ?? [] : []}
      mapTitle={t("mapTitle")}
    />
  );
}
