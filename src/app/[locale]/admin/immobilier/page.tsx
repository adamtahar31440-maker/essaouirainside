import Link from "next/link";
import { adminGetRealEstateListings } from "@/lib/admin-data";
import { deleteRealEstate, setRealEstateStatus, toggleRealEstateFeatured } from "@/lib/admin-actions";
import { ConfirmSubmitButton } from "@/components/admin/confirm-button";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  validated: "Validée",
  refused: "Refusée",
};
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  validated: "bg-green-100 text-green-700",
  refused: "bg-red-100 text-red-700",
};

export default async function AdminRealEstatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const items = await adminGetRealEstateListings();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ocean-dark">Immobilier</h1>
        <Link
          href={`/${locale}/admin/immobilier/new`}
          className="rounded-full bg-ocean-dark px-4 py-2 text-sm font-semibold text-white hover:bg-ocean"
        >
          + Nouvelle annonce
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 bg-sand/30 text-xs uppercase text-foreground/60">
            <tr>
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Prix (MAD)</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Mis en avant</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3 font-medium text-ocean-dark">{r.title.fr}</td>
                <td className="px-4 py-3 text-foreground/70">
                  {r.listingType} / {r.category}
                </td>
                <td className="px-4 py-3 text-foreground/70">{r.priceMad?.toLocaleString("fr-FR")}</td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", STATUS_COLORS[r.status])}>
                    {STATUS_LABELS[r.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <form action={toggleRealEstateFeatured.bind(null, r.id, !r.featured)}>
                    <button
                      type="submit"
                      className={
                        r.featured
                          ? "rounded-full bg-terracotta/10 px-3 py-1 text-xs font-semibold text-terracotta"
                          : "rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500"
                      }
                    >
                      {r.featured ? "★ Oui" : "Non"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-3">
                    {r.status !== "validated" && (
                      <form action={setRealEstateStatus.bind(null, r.id, "validated")}>
                        <button type="submit" className="text-green-700 hover:underline">Valider</button>
                      </form>
                    )}
                    {r.status !== "refused" && (
                      <form action={setRealEstateStatus.bind(null, r.id, "refused")}>
                        <button type="submit" className="text-amber-700 hover:underline">Refuser</button>
                      </form>
                    )}
                    <Link href={`/${locale}/admin/immobilier/${r.id}`} className="text-azur hover:underline">
                      Modifier
                    </Link>
                    <form action={deleteRealEstate.bind(null, r.id)}>
                      <ConfirmSubmitButton confirmText={`Supprimer "${r.title.fr}" ?`} className="text-red-600 hover:underline">
                        Supprimer
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
