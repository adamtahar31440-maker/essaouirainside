import Link from "next/link";
import { adminGetProfessionals, adminGetEstablishments } from "@/lib/admin-data";
import { deleteProfessional, setProfessionalStatus } from "@/lib/admin-actions";
import { ConfirmSubmitButton } from "@/components/admin/confirm-button";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  validated: "Validé",
  refused: "Refusé",
  suspended: "Suspendu",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  validated: "bg-green-100 text-green-700",
  refused: "bg-red-100 text-red-700",
  suspended: "bg-gray-200 text-gray-600",
};

export default async function AdminProfessionalsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [items, establishments] = await Promise.all([adminGetProfessionals(), adminGetEstablishments()]);
  const ficheByProfessionalId = new Map(establishments.map((e) => [e.professionalId, e]));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ocean-dark">Professionnels</h1>

      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 bg-sand/30 text-xs uppercase text-foreground/60">
            <tr>
              <th className="px-4 py-3">Entreprise</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Activité</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-foreground/50">
                  Aucun professionnel inscrit pour le moment.
                </td>
              </tr>
            )}
            {items.map((p) => (
              <tr key={p.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3 font-medium text-ocean-dark">{p.companyName}</td>
                <td className="px-4 py-3 text-foreground/70">
                  {p.contactName}
                  <br />
                  <span className="text-xs">{p.email}</span>
                </td>
                <td className="px-4 py-3 text-foreground/70">{p.activityType}</td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", STATUS_COLORS[p.status])}>
                    {STATUS_LABELS[p.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-3">
                    {ficheByProfessionalId.has(p.id) && (
                      <Link
                        href={`/${locale}/admin/establissements/${ficheByProfessionalId.get(p.id)!.id}`}
                        className="text-azur hover:underline"
                      >
                        Voir la fiche
                      </Link>
                    )}
                    {p.status !== "validated" && (
                      <form action={setProfessionalStatus.bind(null, p.id, "validated")}>
                        <button type="submit" className="text-green-700 hover:underline">
                          Valider
                        </button>
                      </form>
                    )}
                    {p.status !== "refused" && (
                      <form action={setProfessionalStatus.bind(null, p.id, "refused")}>
                        <button type="submit" className="text-amber-700 hover:underline">
                          Refuser
                        </button>
                      </form>
                    )}
                    {p.status !== "suspended" && (
                      <form action={setProfessionalStatus.bind(null, p.id, "suspended")}>
                        <button type="submit" className="text-gray-600 hover:underline">
                          Suspendre
                        </button>
                      </form>
                    )}
                    <form action={deleteProfessional.bind(null, p.id)}>
                      <ConfirmSubmitButton confirmText={`Supprimer "${p.companyName}" ?`} className="text-red-600 hover:underline">
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
