import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getArticles } from "@/lib/data";
import { isModuleActive } from "@/lib/modules";
import { ArticleCard } from "@/components/article-card";
import { Section } from "@/components/section";
import { cn } from "@/lib/utils";

const CATEGORIES = ["guides", "actualites", "conseils", "interviews", "reportages"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return {
    title: t("title"),
    alternates: { canonical: `https://essaouirainside.com/${locale}/blog` },
  };
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ cat?: string }>;
}) {
  const { locale } = await params;
  const { cat } = await searchParams;
  setRequestLocale(locale);

  if (!(await isModuleActive("blog"))) notFound();

  const [t, articles] = await Promise.all([
    getTranslations("blog"),
    getArticles({ category: cat }),
  ]);

  return (
    <div>
      <div className="bg-sand/40 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="text-3xl font-semibold text-ocean-dark sm:text-4xl">{t("title")}</h1>
        </div>
      </div>

      <Section>
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href={`/${locale}/blog`}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium",
              !cat ? "border-ocean-dark bg-ocean-dark text-white" : "border-black/10 text-foreground/70"
            )}
          >
            {t("title")}
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/${locale}/blog?cat=${c}`}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium",
                cat === c ? "border-ocean-dark bg-ocean-dark text-white" : "border-black/10 text-foreground/70"
              )}
            >
              {t(`categories.${c}`)}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard
              key={a.id}
              href={`/${locale}/blog/${a.slug}`}
              title={a.title[locale] ?? a.title.fr}
              excerpt={a.excerpt[locale] ?? a.excerpt.fr}
              image={a.coverImage}
              category={t(`categories.${a.category as (typeof CATEGORIES)[number]}`)}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}
