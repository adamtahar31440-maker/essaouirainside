"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { subcategoryLabel } from "@/lib/labels";
import { EstablishmentCard } from "@/components/establishment-card";
import { cn } from "@/lib/utils";

type Establishment = {
  id: number;
  slug: string;
  name: Record<string, string>;
  images?: string[] | null;
  subcategory: string;
  address?: string | null;
  priceLevel?: string | null;
  badge?: string | null;
  wifi?: boolean | null;
  parking?: boolean | null;
};

// Filtering by subcategory happens here, client-side, instead of the server page
// reading `searchParams` — that alone would force the whole page out of ISR and
// back into a DB hit on every single visit, for every category.
export function CategoryEstablishments({
  locale,
  category,
  establishments,
  subcategories,
  subcategoryMap,
  allLabel,
  noResultsLabel,
}: {
  locale: string;
  category: string;
  establishments: Establishment[];
  subcategories: { slug: string }[];
  subcategoryMap: Record<string, Record<string, string>>;
  allLabel: string;
  noResultsLabel: string;
}) {
  const searchParams = useSearchParams();
  const sub = searchParams.get("sub");
  const filtered = sub ? establishments.filter((e) => e.subcategory === sub) : establishments;

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href={`/${locale}/${category}`}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium",
            !sub ? "border-ocean-dark bg-ocean-dark text-white" : "border-black/10 text-foreground/70"
          )}
        >
          {allLabel}
        </Link>
        {subcategories.map((s) => (
          <Link
            key={s.slug}
            href={`/${locale}/${category}?sub=${s.slug}`}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium",
              sub === s.slug ? "border-ocean-dark bg-ocean-dark text-white" : "border-black/10 text-foreground/70"
            )}
          >
            {subcategoryLabel(subcategoryMap, s.slug, locale)}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-foreground/60">{noResultsLabel}</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => (
            <EstablishmentCard
              key={e.id}
              href={`/${locale}/${category}/${e.slug}`}
              name={e.name[locale] ?? e.name.fr}
              image={e.images?.[0]}
              subcategory={subcategoryLabel(subcategoryMap, e.subcategory, locale)}
              address={e.address}
              priceLevel={e.priceLevel}
              badge={e.badge}
              wifi={e.wifi}
              parking={e.parking}
            />
          ))}
        </div>
      )}
    </>
  );
}
