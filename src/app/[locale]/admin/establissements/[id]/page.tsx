import { notFound } from "next/navigation";
import Link from "next/link";
import {
  adminGetEstablishmentById,
  getAllCategories,
  adminGetLabelEvaluations,
  getLabelBadges,
  adminGetProfessionals,
} from "@/lib/admin-data";
import { setLabelStatus } from "@/lib/admin-actions";
import { EstablishmentForm } from "@/components/admin/establishment-form";
import { LabelEvaluationForm } from "@/components/admin/label-evaluation-form";
import { LabelBadgeHistory } from "@/components/label-badge-history";

const LABEL_STATUS_LABELS: Record<string, string> = {
  none: "Aucun label",
  approved: "Label attribué",
  suspended: "Label suspendu",
  revoked: "Label retiré",
};

const LABEL_STATUS_CLASSES: Record<string, string> = {
  none: "bg-black/5 text-foreground/60",
  approved: "bg-green-100 text-green-800",
  suspended: "bg-amber-100 text-amber-800",
  revoked: "bg-red-100 text-red-800",
};

export default async function EditEstablishmentPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const [establishment, categories, evaluations, badges, professionals] = await Promise.all([
    adminGetEstablishmentById(Number(id)),
    getAllCategories(),
    adminGetLabelEvaluations(Number(id)),
    getLabelBadges(Number(id)),
    adminGetProfessionals(),
  ]);
  if (!establishment) notFound();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="mb-6 text-2xl font-semibold text-ocean-dark">
          Modifier : {establishment.name.fr}
        </h1>
        <EstablishmentForm locale={locale} categories={categories} professionals={professionals} establishment={establishment} />
      </div>

      <section className="space-y-6 border-t border-black/10 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-ocean-dark">Label Essaouira Inside Approved</h2>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${LABEL_STATUS_CLASSES[establishment.labelStatus] ?? LABEL_STATUS_CLASSES.none}`}
          >
            {LABEL_STATUS_LABELS[establishment.labelStatus] ?? "Aucun label"}
            {establishment.labelScore != null ? ` — ${establishment.labelScore}/100` : ""}
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          <form action={setLabelStatus.bind(null, establishment.id, "approved")}>
            <button type="submit" className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
              Attribuer
            </button>
          </form>
          <form action={setLabelStatus.bind(null, establishment.id, "refused")}>
            <button type="submit" className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-foreground/70 hover:bg-black/5">
              Refuser
            </button>
          </form>
          <form action={setLabelStatus.bind(null, establishment.id, "suspended")}>
            <button type="submit" className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600">
              Suspendre
            </button>
          </form>
          <form action={setLabelStatus.bind(null, establishment.id, "revoked")}>
            <button type="submit" className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
              Retirer
            </button>
          </form>
        </div>

        {badges.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-foreground/60">Historique des badges annuels</h3>
            <LabelBadgeHistory badges={badges} compact />
            <Link
              href={`/${locale}/approved/${establishment.slug}`}
              target="_blank"
              className="mt-2 inline-block text-sm font-medium text-azur hover:underline"
            >
              Voir la page publique →
            </Link>
          </div>
        )}

        <LabelEvaluationForm locale={locale} establishmentId={establishment.id} />

        {evaluations.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-xs font-semibold uppercase text-foreground/50">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Évaluateur</th>
                  <th className="py-2 pr-4">Score</th>
                  <th className="py-2 pr-4">Décision</th>
                  <th className="py-2 pr-4">Commentaires</th>
                </tr>
              </thead>
              <tbody>
                {evaluations.map((ev) => (
                  <tr key={ev.id} className="border-b border-black/5 align-top">
                    <td className="py-2 pr-4 whitespace-nowrap">
                      {ev.createdAt ? new Date(ev.createdAt).toLocaleDateString("fr-FR") : "—"}
                    </td>
                    <td className="py-2 pr-4 whitespace-nowrap">{ev.evaluatorName ?? "—"}</td>
                    <td className="py-2 pr-4 font-semibold text-ocean-dark whitespace-nowrap">{ev.totalScore}/100</td>
                    <td className="py-2 pr-4 whitespace-nowrap">
                      {ev.decision ? LABEL_STATUS_LABELS[ev.decision === "refused" ? "none" : ev.decision] ?? ev.decision : "—"}
                    </td>
                    <td className="py-2 pr-4 text-foreground/70">{ev.comments ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
