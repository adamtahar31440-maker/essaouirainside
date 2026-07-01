import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getContentPages } from "@/lib/data";
import { ContentHub } from "@/components/content-hub";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "living" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: { canonical: `https://essaouirainside.com/${locale}/vivre-a-essaouira` },
  };
}

export default async function VivrePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, pages] = await Promise.all([
    getTranslations("living"),
    getContentPages("vivre"),
  ]);

  return (
    <ContentHub
      locale={locale}
      basePath="vivre-a-essaouira"
      title={t("title")}
      subtitle={t("subtitle")}
      pages={pages}
    />
  );
}
