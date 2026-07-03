import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Bed, Utensils, Waves, ShoppingBag, MapPinned } from "lucide-react";
import {
  getCategories,
  getEstablishments,
  getArticles,
  getEvents,
} from "@/lib/data";
import { CATEGORY_TYPE_TO_PATH } from "@/lib/categories";
import { subcategoryLabel } from "@/lib/labels";
import { getActiveModuleKeys, CATEGORY_MODULE_KEY } from "@/lib/modules";
import { EstablishmentCard } from "@/components/establishment-card";
import { ArticleCard } from "@/components/article-card";
import { Section } from "@/components/section";
import { SearchBar } from "@/components/search-bar";
import { NewsletterForm } from "@/components/newsletter-form";
import { MapSection } from "@/components/map-section";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  hebergement: <Bed size={26} />,
  restaurant: <Utensils size={26} />,
  activite: <Waves size={26} />,
  shopping: <ShoppingBag size={26} />,
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tCat, categoriesAll, establishmentsAll, articles, events, activeModules] = await Promise.all([
    getTranslations("home"),
    getTranslations("categories"),
    getCategories(),
    getEstablishments({ limit: 12 }),
    getArticles({ limit: 3 }),
    getEvents({ limit: 3 }),
    getActiveModuleKeys(),
  ]);

  const categoryActive = (type: string) => {
    const key = CATEGORY_MODULE_KEY[type];
    return !key || activeModules.has(key);
  };

  const categories = categoriesAll.filter((c) => categoryActive(c.type));
  const categoryById = new Map(categoriesAll.map((c) => [c.id, c]));
  const establishments = establishmentsAll
    .filter((e) => {
      const cat = categoryById.get(e.categoryId);
      return cat && categoryActive(cat.type);
    })
    .slice(0, 6);
  const mapPoints = establishments
    .filter((e) => e.lat && e.lng)
    .map((e) => {
      const cat = categoryById.get(e.categoryId);
      const path = cat ? CATEGORY_TYPE_TO_PATH[cat.type] : "";
      return {
        lat: e.lat as number,
        lng: e.lng as number,
        label: e.name[locale] ?? e.name.fr,
        href: `/${locale}/${path}/${e.slug}`,
      };
    });
  const blogActive = activeModules.has("blog");
  const newsletterActive = activeModules.has("newsletter");

  return (
    <div>
      <section className="bg-ocean-dark text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-24 sm:px-6 lg:py-32">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
            {t("heroTitle")}
          </h1>
          <p className="max-w-xl text-lg text-white/80">{t("heroSubtitle")}</p>
          <SearchBar />
        </div>
      </section>

      <Section title={t("categories")}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/${locale}/${CATEGORY_TYPE_TO_PATH[c.type]}`}
              className="flex flex-col items-center gap-3 rounded-2xl border border-black/10 bg-white p-6 text-center sm:transition-colors sm:hover:border-ocean-dark/30"
            >
              <span className="text-ocean-dark">{CATEGORY_ICONS[c.type]}</span>
              <span className="text-sm font-semibold text-ocean-dark">
                {tCat(c.type as "hebergement" | "restaurant" | "activite" | "shopping")}
              </span>
            </Link>
          ))}
        </div>
      </Section>

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
            const path = cat ? CATEGORY_TYPE_TO_PATH[cat.type] : "";
            return (
              <EstablishmentCard
                key={e.id}
                href={`/${locale}/${path}/${e.slug}`}
                name={e.name[locale] ?? e.name.fr}
                image={e.images?.[0]}
                subcategory={subcategoryLabel(e.subcategory, locale)}
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

      {blogActive && (
        <Section
          title={t("latestArticles")}
          action={
            <Link href={`/${locale}/blog`} className="text-sm font-semibold text-azur hover:underline">
              {t("viewAll")}
            </Link>
          }
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard
                key={a.id}
                href={`/${locale}/blog/${a.slug}`}
                title={a.title[locale] ?? a.title.fr}
                excerpt={a.excerpt[locale] ?? a.excerpt.fr}
                image={a.coverImage}
                category={a.category}
              />
            ))}
          </div>
        </Section>
      )}

      {events.length > 0 && (
        <Section
          title={t("upcomingEvents")}
          action={
            <Link href={`/${locale}/agenda`} className="text-sm font-semibold text-azur hover:underline">
              {t("viewAll")}
            </Link>
          }
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((ev) => (
              <ArticleCard
                key={ev.id}
                href={`/${locale}/agenda/${ev.slug}`}
                title={ev.title[locale] ?? ev.title.fr}
                excerpt={ev.description[locale] ?? ev.description.fr}
                image={ev.image}
                category={ev.category}
              />
            ))}
          </div>
        </Section>
      )}

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
