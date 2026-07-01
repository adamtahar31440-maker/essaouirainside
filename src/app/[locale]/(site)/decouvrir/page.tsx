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
  const t = await getTranslations({ locale, namespace: "discover" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: { canonical: `https://essaouirainside.com/${locale}/decouvrir` },
  };
}

export default async function DecouvrirPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, pages] = await Promise.all([
    getTranslations("discover"),
    getContentPages("decouvrir"),
  ]);

  return (
    <ContentHub
      locale={locale}
      basePath="decouvrir"
      title={t("title")}
      subtitle={t("subtitle")}
      pages={pages}
    />
  );
}
