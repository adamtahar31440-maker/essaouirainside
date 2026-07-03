import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Phone,
  MessageCircle,
  Globe,
  MapPin,
  Wifi,
  Car,
  Accessibility,
  Star,
  ChevronRight,
  Link2,
  ExternalLink,
} from "lucide-react";
import { CATEGORY_PATH_TO_TYPE } from "@/lib/categories";
import { subcategoryLabel, priceLevelLabel } from "@/lib/labels";
import { getEstablishmentBySlug, getSimilarEstablishments } from "@/lib/data";
import { getLabelBadges, getApprovedReviewsForEstablishment } from "@/lib/admin-data";
import { isModuleActive, CATEGORY_MODULE_KEY } from "@/lib/modules";
import { EstablishmentCard } from "@/components/establishment-card";
import { Section } from "@/components/section";
import { MapSection } from "@/components/map-section";
import { LabelBadgeHistory } from "@/components/label-badge-history";
import { DirectionsButton } from "@/components/directions-button";
import { PhotoGallery } from "@/components/photo-gallery";
import { HoursDisplay } from "@/components/hours-display";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, category, slug } = await params;
  const e = await getEstablishmentBySlug(slug);
  if (!e) return {};
  const name = e.name[locale] ?? e.name.fr;
  const description = (e.description[locale] ?? e.description.fr).slice(0, 155);
  return {
    title: name,
    description,
    alternates: { canonical: `https://essaouirainside.com/${locale}/${category}/${slug}` },
    openGraph: {
      title: name,
      description,
      images: e.images?.[0] ? [e.images[0]] : undefined,
    },
  };
}

export default async function EstablishmentPage({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}) {
  const { locale, category, slug } = await params;
  setRequestLocale(locale);

  const type = CATEGORY_PATH_TO_TYPE[category];
  if (!type) notFound();

  const moduleKey = CATEGORY_MODULE_KEY[type];
  if (moduleKey && !(await isModuleActive(moduleKey))) notFound();

  const e = await getEstablishmentBySlug(slug);
  if (!e) notFound();

  const [t, tCat, tNav, tDash, similar, badges, reviews] = await Promise.all([
    getTranslations("establishment"),
    getTranslations("categories"),
    getTranslations("nav"),
    getTranslations("dashboard"),
    getSimilarEstablishments(e.categoryId, e.slug),
    getLabelBadges(e.id),
    getApprovedReviewsForEstablishment(e.id),
  ]);
  const activeBadges = badges.filter((b) => b.status === "active");
  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;

  const name = e.name[locale] ?? e.name.fr;
  const description = e.description[locale] ?? e.description.fr;
  const images = e.images ?? [];
  const services = e.services?.[locale] ?? e.services?.fr ?? [];
  const products = e.products ?? [];
  const review = e.ourReview?.[locale] ?? e.ourReview?.fr;
  const hours = e.hours?.[locale] ?? e.hours?.fr;
  const faq = e.faq ?? [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    description,
    image: images,
    address: {
      "@type": "PostalAddress",
      streetAddress: e.address ?? undefined,
      addressLocality: "Essaouira",
      addressCountry: "MA",
    },
    telephone: e.phone ?? undefined,
    url: e.website ?? undefined,
    priceRange: e.priceLevel ? priceLevelLabel(e.priceLevel) : undefined,
    ...(e.lat && e.lng
      ? { geo: { "@type": "GeoCoordinates", latitude: e.lat, longitude: e.lng } }
      : {}),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
        <nav className="flex flex-wrap items-center gap-1 text-xs text-foreground/50">
          <Link href={`/${locale}`} className="hover:text-ocean-dark">{tNav("home")}</Link>
          <ChevronRight size={12} className="rtl:rotate-180" />
          <Link href={`/${locale}/${category}`} className="hover:text-ocean-dark">
            {tCat(type as "hebergement" | "restaurant" | "activite" | "shopping")}
          </Link>
          <ChevronRight size={12} className="rtl:rotate-180" />
          <span className="truncate text-foreground/70">{name}</span>
        </nav>
      </div>

      {images.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
          <PhotoGallery images={images} name={name} moreLabel={t("morePhotos", { count: images.length - 6 })} />
        </div>
      )}

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-azur">
            {subcategoryLabel(e.subcategory, locale)}
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-ocean-dark sm:text-4xl">{name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            {avgRating !== null && (
              <a href="#reviews" className="flex items-center gap-1 text-sm font-semibold text-ocean-dark hover:underline">
                <Star size={16} className="fill-terracotta text-terracotta" />
                {avgRating.toFixed(1)}
                <span className="font-normal text-foreground/50">({reviews.length})</span>
              </a>
            )}
            {e.address && (
              <p className="flex items-center gap-1.5 text-foreground/60">
                <MapPin size={16} /> {e.address}
              </p>
            )}
          </div>

          {activeBadges.length > 0 && (
            <div className="mt-5">
              <LabelBadgeHistory badges={activeBadges} />
              <Link
                href={`/${locale}/approved/${e.slug}`}
                className="mt-2 inline-block text-sm font-medium text-terracotta hover:underline"
              >
                {t("viewCertificate")} →
              </Link>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-ocean-dark">{t("about")}</h2>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-foreground/80">{description}</p>
          </div>

          {review && (
            <div className="mt-8 rounded-2xl bg-sand/40 p-6">
              <h2 className="text-lg font-semibold text-ocean-dark">{t("ourReview")}</h2>
              <p className="mt-2 leading-relaxed text-foreground/80">{review}</p>
            </div>
          )}

          {products.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-ocean-dark">{t("productsTitle")}</h2>
              <div className="mt-3 divide-y divide-black/5 rounded-2xl border border-black/5">
                {products.map((p, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 px-4 py-3">
                    <span className="text-sm text-foreground/80">{p.name[locale] ?? p.name.fr}</span>
                    {p.price != null && (
                      <span className="shrink-0 text-sm font-semibold text-ocean-dark">{p.price} MAD</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {services.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-ocean-dark">{t("services")}</h2>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {services.map((s, i) => (
                  <li key={i} className="rounded-lg bg-sand/40 px-3 py-2 text-sm text-foreground/80">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-4 text-sm text-foreground/70">
            {e.wifi && <span className="flex items-center gap-1.5"><Wifi size={16} /> {t("wifi")}</span>}
            {e.parking && <span className="flex items-center gap-1.5"><Car size={16} /> {t("parking")}</span>}
            {e.accessibility && (
              <span className="flex items-center gap-1.5"><Accessibility size={16} /> {t("accessibility")}</span>
            )}
          </div>

          {faq.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-ocean-dark">{t("faq")}</h2>
              <div className="mt-3 divide-y divide-black/5 rounded-2xl border border-black/5">
                {faq.map((item, i) => (
                  <details key={i} className="group p-4">
                    <summary className="cursor-pointer list-none font-medium text-foreground/80">
                      {item.q[locale] ?? item.q.fr}
                    </summary>
                    <p className="mt-2 text-sm text-foreground/60">{item.a[locale] ?? item.a.fr}</p>
                  </details>
                ))}
              </div>
            </div>
          )}

          <div id="reviews" className="mt-10 scroll-mt-24">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-ocean-dark">
              {t("reviewsTitle")}
              {avgRating !== null && (
                <span className="flex items-center gap-1 text-sm font-normal text-foreground/60">
                  <Star size={14} className="fill-terracotta text-terracotta" />
                  {avgRating.toFixed(1)} · {t("basedOnReviews", { count: reviews.length })}
                </span>
              )}
            </h2>

            {(e.instagram || e.facebook || e.googleReviewsUrl || e.tripadvisorUrl) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {e.instagram && (
                  <a
                    href={e.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-foreground/70 hover:bg-sand/40"
                  >
                    <Link2 size={14} /> Instagram
                  </a>
                )}
                {e.facebook && (
                  <a
                    href={e.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-foreground/70 hover:bg-sand/40"
                  >
                    <Link2 size={14} /> Facebook
                  </a>
                )}
                {e.googleReviewsUrl && (
                  <a
                    href={e.googleReviewsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-foreground/70 hover:bg-sand/40"
                  >
                    <ExternalLink size={14} /> {t("googleReviewsLabel")}
                  </a>
                )}
                {e.tripadvisorUrl && (
                  <a
                    href={e.tripadvisorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-foreground/70 hover:bg-sand/40"
                  >
                    <ExternalLink size={14} /> {t("tripadvisorLabel")}
                  </a>
                )}
              </div>
            )}

            {reviews.length === 0 ? (
              <p className="mt-3 text-sm text-foreground/60">{t("noReviews")}</p>
            ) : (
              <div className="mt-4 space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-black/5 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-ocean-dark">{r.authorName}</p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < r.rating ? "fill-terracotta text-terracotta" : "text-black/15"}
                          />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="mt-2 text-sm leading-relaxed text-foreground/80">{r.comment}</p>}
                    {r.ownerReply && (
                      <div className="mt-3 rounded-xl bg-sand/40 p-3">
                        <p className="text-xs font-semibold text-ocean-dark">{name}</p>
                        <p className="mt-1 text-sm text-foreground/70">{r.ownerReply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {e.lat && e.lng && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-ocean-dark">{t("map")}</h2>
              <div className="mt-3 h-80 overflow-hidden rounded-2xl border border-black/5">
                <MapSection points={[{ lat: e.lat, lng: e.lng, label: name }]} />
              </div>
            </div>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-black/5 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          {e.priceLevel && (
            <p className="text-sm font-semibold text-foreground/60">
              {t("price")}: <span className="text-ocean-dark">{priceLevelLabel(e.priceLevel)}</span>
            </p>
          )}
          {hours && (
            <div className="mt-3">
              <HoursDisplay
                value={hours}
                dayLabels={[
                  tDash("dayMon"),
                  tDash("dayTue"),
                  tDash("dayWed"),
                  tDash("dayThu"),
                  tDash("dayFri"),
                  tDash("daySat"),
                  tDash("daySun"),
                ]}
                closedLabel={tDash("hoursClosed")}
                todayLabel={t("today")}
              />
            </div>
          )}
          <div className="mt-5 flex flex-col gap-2">
            {e.phone && (
              <a
                href={`tel:${e.phone}`}
                className="flex items-center justify-center gap-2 rounded-full bg-ocean-dark px-4 py-2.5 text-sm font-semibold text-white hover:bg-ocean"
              >
                <Phone size={16} /> {e.phone}
              </a>
            )}
            {e.whatsapp && (
              <a
                href={`https://wa.me/${e.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full border border-black/10 px-4 py-2.5 text-sm font-semibold text-foreground/80 hover:bg-sand/40"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
            )}
            {e.website && (
              <a
                href={e.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full border border-black/10 px-4 py-2.5 text-sm font-semibold text-foreground/80 hover:bg-sand/40"
              >
                <Globe size={16} /> {t("website")}
              </a>
            )}
            {e.lat && e.lng && (
              <DirectionsButton lat={e.lat} lng={e.lng} label={t("getDirections")} />
            )}
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <Section title={t("similar")}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((s) => (
              <EstablishmentCard
                key={s.id}
                href={`/${locale}/${category}/${s.slug}`}
                name={s.name[locale] ?? s.name.fr}
                image={s.images?.[0]}
                subcategory={subcategoryLabel(s.subcategory, locale)}
                address={s.address}
                priceLevel={s.priceLevel}
                badge={s.badge}
              />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
