import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { getRealEstateBySlug } from "@/lib/admin-data";
import { MapSection } from "@/components/map-section";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const listing = await getRealEstateBySlug(slug);
  if (!listing) return {};
  const title = listing.title[locale] ?? listing.title.fr;
  return {
    title,
    description: (listing.description[locale] ?? listing.description.fr).slice(0, 155),
    alternates: { canonical: `https://essaouirainside.com/${locale}/immobilier/${slug}` },
  };
}

export default async function RealEstateDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const listing = await getRealEstateBySlug(slug);
  if (!listing || listing.status !== "validated") notFound();

  const name = listing.title[locale] ?? listing.title.fr;
  const images = listing.images ?? [];

  return (
    <div>
      {images.length > 0 && (
        <div className="relative h-72 w-full overflow-hidden bg-sand sm:h-[420px]">
          <Image src={images[0]} alt={name} fill className="object-cover" priority />
        </div>
      )}

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-azur">
            {listing.listingType === "vente" ? "À vendre" : "À louer"} — {listing.category}
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-ocean-dark sm:text-4xl">{name}</h1>
          {listing.address && <p className="mt-2 text-foreground/60">{listing.address}</p>}

          <div className="mt-6 flex flex-wrap gap-6 text-sm text-foreground/70">
            {listing.surfaceM2 && <span>{listing.surfaceM2} m²</span>}
            {listing.rooms && <span>{listing.rooms} pièces</span>}
          </div>

          <p className="mt-6 whitespace-pre-line leading-relaxed text-foreground/80">
            {listing.description[locale] ?? listing.description.fr}
          </p>

          {listing.lat && listing.lng && (
            <div className="mt-10 h-80 overflow-hidden rounded-2xl border border-black/5">
              <MapSection points={[{ lat: listing.lat, lng: listing.lng, label: name }]} />
            </div>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          {listing.priceMad && (
            <p className="text-2xl font-semibold text-terracotta">
              {listing.priceMad.toLocaleString("fr-FR")} MAD
              {listing.listingType === "location" ? " / mois" : ""}
            </p>
          )}
          <p className="mt-4 text-sm text-foreground/60">
            Contactez Essaouira Inside pour être mis en relation avec l&apos;agence ou le vendeur.
          </p>
        </aside>
      </div>
    </div>
  );
}
