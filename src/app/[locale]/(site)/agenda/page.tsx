import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getEvents } from "@/lib/data";
import { Section } from "@/components/section";
import { cn } from "@/lib/utils";

const CATEGORIES = ["festivals", "concerts", "marches", "expositions"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "agenda" });
  return {
    title: t("title"),
    alternates: { canonical: `https://essaouirainside.com/${locale}/agenda` },
  };
}

export default async function AgendaPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ cat?: string }>;
}) {
  const { locale } = await params;
  const { cat } = await searchParams;
  setRequestLocale(locale);

  const [t, events] = await Promise.all([
    getTranslations("agenda"),
    getEvents({ category: cat }),
  ]);

  const dateFmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" });

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
            href={`/${locale}/agenda`}
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
              href={`/${locale}/agenda?cat=${c}`}
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
          {events.map((ev) => (
            <Link
              key={ev.id}
              href={`/${locale}/agenda/${ev.slug}`}
              className="group block overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-sand">
                {ev.image && (
                  <Image
                    src={ev.image}
                    alt={ev.title[locale] ?? ev.title.fr}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                )}
              </div>
              <div className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-azur">
                  {t(`categories.${ev.category as (typeof CATEGORIES)[number]}`)}
                </p>
                <h3 className="mt-1 text-base font-semibold text-ocean-dark">
                  {ev.title[locale] ?? ev.title.fr}
                </h3>
                <p className="mt-1 text-sm text-foreground/60">
                  {dateFmt.format(new Date(ev.startDate))}
                  {ev.endDate && ev.endDate !== ev.startDate
                    ? ` ${t("to")} ${dateFmt.format(new Date(ev.endDate))}`
                    : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
