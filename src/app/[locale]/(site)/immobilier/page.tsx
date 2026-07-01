import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getPublicRealEstateListings } from "@/lib/admin-data";
import { isModuleActive } from "@/lib/modules";
import { Section } from "@/components/section";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Immobilier",
    description: "Achetez ou louez un bien à Essaouira : villas, riads, appartements, terrains.",
    alternates: { canonical: `https://essaouirainside.com/${locale}/immobilier` },
  };
}

export default async function RealEstatePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { locale } = await params;
  const { type } = await searchParams;
  setRequestLocale(locale);

  if (!(await isModuleActive("immobilier"))) notFound();

  const listings = await getPublicRealEstateListings(type);

  return (
    <div>
      <div className="bg-sand/40 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="text-3xl font-semibold text-ocean-dark sm:text-4xl">Immobilier à Essaouira</h1>
          <p className="mt-2 text-foreground/60">Villas, riads, appartements et terrains à vendre ou à louer.</p>
        </div>
      </div>

      <Section>
        <div className="mb-8 flex flex-wrap gap-2">
          <Link href={`/${locale}/immobilier`} className={cn("rounded-full border px-4 py-1.5 text-sm font-medium", !type ? "border-ocean-dark bg-ocean-dark text-white" : "border-black/10 text-foreground/70")}>
            Tous
          </Link>
          <Link href={`/${locale}/immobilier?type=vente`} className={cn("rounded-full border px-4 py-1.5 text-sm font-medium", type === "vente" ? "border-ocean-dark bg-ocean-dark text-white" : "border-black/10 text-foreground/70")}>
            Acheter
          </Link>
          <Link href={`/${locale}/immobilier?type=location`} className={cn("rounded-full border px-4 py-1.5 text-sm font-medium", type === "location" ? "border-ocean-dark bg-ocean-dark text-white" : "border-black/10 text-foreground/70")}>
            Louer
          </Link>
        </div>

        {listings.length === 0 ? (
          <p className="text-foreground/60">Aucune annonce disponible pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((r) => (
              <Link
                key={r.id}
                href={`/${locale}/immobilier/${r.slug}`}
                className="group block overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-sand">
                  {r.images?.[0] && (
                    <Image src={r.images[0]} alt={r.title[locale] ?? r.title.fr} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-ocean-dark px-3 py-1 text-xs font-semibold text-white">
                    {r.listingType === "vente" ? "À vendre" : "À louer"}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-azur">{r.category}</p>
                  <h3 className="mt-1 text-base font-semibold text-ocean-dark">{r.title[locale] ?? r.title.fr}</h3>
                  {r.priceMad && (
                    <p className="mt-1 text-sm font-semibold text-terracotta">
                      {r.priceMad.toLocaleString("fr-FR")} MAD{r.listingType === "location" ? " / mois" : ""}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
