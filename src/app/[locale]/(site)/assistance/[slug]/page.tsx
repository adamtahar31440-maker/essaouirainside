import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getContentPageBySlug } from "@/lib/data";
import { isModuleActive } from "@/lib/modules";
import { ContentDetail } from "@/components/content-detail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getContentPageBySlug("assistance-guides", slug);
  if (!page) return {};
  const title = page.title[locale] ?? page.title.fr;
  return {
    title,
    description: (page.body[locale] ?? page.body.fr).slice(0, 155),
    alternates: { canonical: `https://essaouirainside.com/${locale}/assistance/${slug}` },
  };
}

export default async function AssistanceGuidePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  if (!(await isModuleActive("assistance"))) notFound();

  const page = await getContentPageBySlug("assistance-guides", slug);
  if (!page) notFound();

  const t = await getTranslations("common");

  return (
    <ContentDetail
      locale={locale}
      backHref={`/${locale}/assistance`}
      backLabel={t("back")}
      title={page.title[locale] ?? page.title.fr}
      body={page.body[locale] ?? page.body.fr}
      coverImage={page.coverImage}
    />
  );
}
