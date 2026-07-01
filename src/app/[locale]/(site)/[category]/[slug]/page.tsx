import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Phone, MessageCircle, Globe, MapPin, Clock, Wifi, Car, Accessibility } from "lucide-react";
import { CATEGORY_PATH_TO_TYPE } from "@/lib/categories";
import { subcategoryLabel } from "@/lib/labels";
import { getEstablishmentBySlug, getSimilarEstablishments } from "@/lib/data";
import { getLabelBadges } from "@/lib/admin-data";
import { isModuleActive, CATEGORY_MODULE_KEY } from "@/lib/modules";
import { EstablishmentCard } from "@/components/establishment-card";
import { Section } from "@/components/section";
import { MapSection } from "@/components/map-section";
import { LabelBadgeHistory } from "@/components/label-badge-history";

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

  const t = await getTranslations("establishment");
  const [similar, badges] = await Promise.all([
    getSimilarEstablishments(e.categoryId, e.slug),
    getLabelBadges(e.id),
  ]);
  const activeBadges = badges.filter((b) => b.status === "active");

  const name = e.name[locale] ?? e.name.fr;
  const description = e.description[locale] ?? e.description.fr;
  const images = e.images ?? [];
  const services = e.services?.[locale] ?? e.services?.fr ?? [];
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
    priceRange: e.priceLevel ?? undefined,
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

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-1 sm:h-[420px] sm:grid-cols-4 sm:grid-rows-2">
          <div className="relative col-span-2 row-span-2 aspect-[4/3] overflow-hidden bg-sand sm:aspect-auto">
            <Image src={images[0]} alt={name} fill className="object-cover" priority sizes="50vw" />
          </div>
          {images.slice(1, 5).map((img, i) => (
            <div key={i} className="relative hidden aspect-square overflow-hidden bg-sand sm:block">
              <Image src={img} alt={`${name} ${i + 2}`} fill className="object-cover" sizes="25vw" />
            </div>
          ))}
        </div>
      )}

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-azur">
            {subcategoryLabel(e.subcategory, locale)}
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-ocean-dark sm:text-4xl">{name}</h1>
          {e.address && (
            <p className="mt-2 flex items-center gap-1.5 text-foreground/60">
              <MapPin size={16} /> {e.address}
            </p>
          )}

          {activeBadges.length > 0 && (
            <div className="mt-5">
              <LabelBadgeHistory badges={activeBadges} />
              <Link
                href={`/${locale}/approved/${e.slug}`}
                className="mt-2 inline-block text-sm font-medium text-terracotta hover:underline"
              >
                Voir le certificat officiel →
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

          {e.lat && e.lng && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-ocean-dark">{t("map")}</h2>
              <div className="mt-3 h-80 overflow-hidden rounded-2xl border border-black/5">
                <MapSection points={[{ lat: e.lat, lng: e.lng, label: name }]} />
              </div>
            </div>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          {e.priceLevel && (
            <p className="text-sm font-semibold text-foreground/60">
              {t("price")}: <span className="text-ocean-dark">{e.priceLevel}</span>
            </p>
          )}
          {hours && (
            <p className="mt-3 flex items-start gap-2 text-sm text-foreground/70">
              <Clock size={16} className="mt-0.5 shrink-0" /> {hours}
            </p>
          )}
          <div className="mt-5 flex flex-col gap-2">
            {e.phone && (
              <a
                href={`tel:${e.phone}`}
                className="flex items-center justify-center gap-2 rounded-full bg-ocean-dark px-4 py-2.5 text-sm font-semibold text-white hover:bg-ocean"
              >
                <Phone size={16} /> {t("callNow")}
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
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${e.lat},${e.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full border border-black/10 px-4 py-2.5 text-sm font-semibold text-foreground/80 hover:bg-sand/40"
              >
                <MapPin size={16} /> {t("getDirections")}
              </a>
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
