import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getArticleBySlug } from "@/lib/data";
import { isModuleActive } from "@/lib/modules";
import { ContentDetail } from "@/components/content-detail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};
  const title = article.title[locale] ?? article.title.fr;
  return {
    title,
    description: article.excerpt[locale] ?? article.excerpt.fr,
    alternates: { canonical: `https://essaouirainside.com/${locale}/blog/${slug}` },
    openGraph: {
      title,
      description: article.excerpt[locale] ?? article.excerpt.fr,
      images: article.coverImage ? [article.coverImage] : undefined,
      type: "article",
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  if (!(await isModuleActive("blog"))) notFound();

  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const t = await getTranslations("common");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title[locale] ?? article.title.fr,
    description: article.excerpt[locale] ?? article.excerpt.fr,
    image: article.coverImage ? [article.coverImage] : undefined,
    datePublished: article.publishedAt,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContentDetail
        locale={locale}
        backHref={`/${locale}/blog`}
        backLabel={t("back")}
        title={article.title[locale] ?? article.title.fr}
        body={article.body[locale] ?? article.body.fr}
        coverImage={article.coverImage}
      />
    </>
  );
}
