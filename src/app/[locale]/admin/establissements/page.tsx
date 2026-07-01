import Link from "next/link";
import { adminGetEstablishments, getAllCategories } from "@/lib/admin-data";
import {
  deleteEstablishment,
  setEstablishmentStatus,
  toggleEstablishmentFeatured,
} from "@/lib/admin-actions";
import { ConfirmSubmitButton } from "@/components/admin/confirm-button";

export default async function AdminEstablishmentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [establishments, categories] = await Promise.all([
    adminGetEstablishments(),
    getAllCategories(),
  ]);
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-ocean-dark">Établissements</h1>
        <Link
          href={`/${locale}/admin/establissements/new`}
          className="rounded-full bg-ocean-dark px-4 py-2 text-sm font-semibold text-white hover:bg-ocean"
        >
          + Nouveau
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 bg-sand/30 text-xs uppercase text-foreground/60">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Mis en avant</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {establishments.map((e) => (
              <tr key={e.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3 font-medium text-ocean-dark">{e.name.fr}</td>
                <td className="px-4 py-3 text-foreground/70">
                  {categoryById.get(e.categoryId)?.name.fr ?? "—"} / {e.subcategory}
                </td>
                <td className="px-4 py-3">
                  <form action={setEstablishmentStatus.bind(null, e.id, e.status === "active" ? "disabled" : "active")}>
                    <button
                      type="submit"
                      className={
                        e.status === "active"
                          ? "rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"
                          : "rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-600"
                      }
                    >
                      {e.status === "active" ? "Actif" : "Désactivé"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <form action={toggleEstablishmentFeatured.bind(null, e.id, !e.featured)}>
                    <button
                      type="submit"
                      className={
                        e.featured
                          ? "rounded-full bg-terracotta/10 px-3 py-1 text-xs font-semibold text-terracotta"
                          : "rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500"
                      }
                    >
                      {e.featured ? "★ Oui" : "Non"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/${locale}/admin/establissements/${e.id}`}
                      className="text-azur hover:underline"
                    >
                      Modifier
                    </Link>
                    <form action={deleteEstablishment.bind(null, e.id)}>
                      <ConfirmSubmitButton
                        confirmText={`Supprimer "${e.name.fr}" ?`}
                        className="text-red-600 hover:underline"
                      >
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
