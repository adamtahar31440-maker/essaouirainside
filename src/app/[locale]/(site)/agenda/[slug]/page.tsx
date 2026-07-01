import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getEventBySlug } from "@/lib/data";
import { ContentDetail } from "@/components/content-detail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const ev = await getEventBySlug(slug);
  if (!ev) return {};
  const title = ev.title[locale] ?? ev.title.fr;
  return {
    title,
    description: ev.description[locale] ?? ev.description.fr,
    alternates: { canonical: `https://essaouirainside.com/${locale}/agenda/${slug}` },
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const ev = await getEventBySlug(slug);
  if (!ev) notFound();

  const t = await getTranslations("common");
  const dateFmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: ev.title[locale] ?? ev.title.fr,
    description: ev.description[locale] ?? ev.description.fr,
    startDate: ev.startDate,
    endDate: ev.endDate ?? undefined,
    location: ev.location ? { "@type": "Place", name: ev.location } : undefined,
    image: ev.image ? [ev.image] : undefined,
  };

  const body = `${dateFmt.format(new Date(ev.startDate))}${ev.location ? ` — ${ev.location}` : ""}\n\n${
    ev.description[locale] ?? ev.description.fr
  }`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContentDetail
        locale={locale}
        backHref={`/${locale}/agenda`}
        backLabel={t("back")}
        title={ev.title[locale] ?? ev.title.fr}
        body={body}
        coverImage={ev.image}
      />
    </>
  );
}
