import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MapPinned } from "lucide-react";
import {
  getCategories,
  getEstablishments,
  getAllSubcategories,
} from "@/lib/data";
import { buildSubcategoryMap, subcategoryLabel } from "@/lib/labels";
import { getActiveModuleKeys } from "@/lib/modules";
import { getSiteSettings } from "@/lib/admin-data";
import { EstablishmentCard } from "@/components/establishment-card";
import { Section } from "@/components/section";
import { SearchBar } from "@/components/search-bar";
import { NewsletterForm } from "@/components/newsletter-form";
import { MapSection } from "@/components/map-section";
import { HeroCarousel } from "@/components/hero-carousel";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, categoriesAll, establishmentsAll, activeModules, allSubcategories, siteSettings] = await Promise.all([
    getTranslations("home"),
    getCategories(),
    getEstablishments({ limit: 12 }),
    getActiveModuleKeys(),
    getAllSubcategories(),
    getSiteSettings(),
  ]);
  const heroImages = siteSettings?.heroImages ?? [];
  const subcategoryMap = buildSubcategoryMap(allSubcategories);

  const categoryById = new Map(categoriesAll.map((c) => [c.id, c]));
  const establishments = establishmentsAll
    .filter((e) => {
      const cat = categoryById.get(e.categoryId);
      return cat && cat.status === "active";
    })
    .slice(0, 6);
  const mapPoints = establishments
    .filter((e) => e.lat && e.lng)
    .map((e) => {
      const cat = categoryById.get(e.categoryId);
      const path = cat ? cat.slug : "";
      return {
        lat: e.lat as number,
        lng: e.lng as number,
        label: e.name[locale] ?? e.name.fr,
        href: `/${locale}/${path}/${e.slug}`,
      };
    });
  const newsletterActive = activeModules.has("newsletter");

  return (
    <div>
      <section className="relative overflow-hidden bg-ocean-dark text-white">
        {heroImages.length > 0 && <HeroCarousel images={heroImages} />}
        <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-24 sm:px-6 lg:py-32">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
            {t("heroTitle")}
          </h1>
          <p className="max-w-xl text-lg text-white/80">{t("heroSubtitle")}</p>
          <SearchBar />
        </div>
      </section>

      <Section
        title={t("latestEstablishments")}
        action={
          <Link href={`/${locale}/recherche`} className="text-sm font-semibold text-azur hover:underline">
            {t("viewAll")}
          </Link>
        }
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {establishments.map((e) => {
            const cat = categoryById.get(e.categoryId);
            const path = cat ? cat.slug : "";
            return (
              <EstablishmentCard
                key={e.id}
                href={`/${locale}/${path}/${e.slug}`}
                name={e.name[locale] ?? e.name.fr}
                image={e.images?.[0]}
                subcategory={subcategoryLabel(subcategoryMap, e.subcategory, locale)}
                address={e.address}
                priceLevel={e.priceLevel}
                badge={e.badge}
                wifi={e.wifi}
                parking={e.parking}
              />
            );
          })}
        </div>
      </Section>

      <Section className="bg-sand/40 max-w-none px-0 py-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6">
          <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <MapPinned size={32} className="text-ocean-dark" />
              <div>
                <h2 className="text-2xl font-semibold text-ocean-dark">{t("mapTitle")}</h2>
                <p className="text-sm text-foreground/60">{t("mapSubtitle")}</p>
              </div>
            </div>
            <Link
              href={`/${locale}/recherche`}
              className="rounded-full bg-ocean-dark px-6 py-3 text-sm font-semibold text-white transition hover:bg-ocean"
            >
              {t("mapCta")}
            </Link>
          </div>
          {mapPoints.length > 0 && (
            <div className="h-72 overflow-hidden rounded-2xl border border-black/5 shadow-sm sm:h-96">
              <MapSection points={mapPoints} zoom={13} />
            </div>
          )}
        </div>
      </Section>

      {newsletterActive && (
        <section className="bg-ocean-dark py-16 text-white">
          <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">{t("newsletterTitle")}</h2>
              <p className="mt-2 text-white/70">{t("newsletterSubtitle")}</p>
            </div>
            <NewsletterForm />
          </div>
        </section>
      )}
    </div>
  );
}
