import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import {
  getProfessionalByClerkId,
  getSubscriptionByProfessionalId,
  getInvoicesByProfessionalId,
  getServiceOrdersByProfessionalId,
  adminGetEstablishments,
  getSubscriptionPlans,
  getLabelApplicationByEstablishmentId,
  getLabelBadges,
  getAllCategories,
} from "@/lib/admin-data";
import { applyAsProfessional, requestMarketplaceService, applyForLabel, updateOwnEstablishment } from "@/lib/pro-actions";
import { SubscriptionPlans } from "@/components/subscription-plans";
import { LabelBadgeHistory } from "@/components/label-badge-history";
import { LocalizedFieldGroup } from "@/components/admin/localized-field-group";
import { CATEGORY_SUBCATEGORIES } from "@/lib/categories";

const LABEL_APPLICATION_STATUS_LABELS: Record<string, string> = {
  pending: "En attente d'évaluation",
  info_requested: "L'équipe vous a demandé des informations complémentaires",
  visit_scheduled: "Une visite a été programmée",
  on_hold: "Dossier en attente",
};

const OPEN_LABEL_APPLICATION_STATUSES = ["pending", "info_requested", "visit_scheduled", "on_hold"];

const inputClass = "w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-ocean-dark";
const labelClass = "mb-1 block text-xs font-semibold text-foreground/60";

const SERVICES = [
  { key: "shooting_photo", label: "Shooting photo professionnel" },
  { key: "video", label: "Reportage vidéo" },
  { key: "article_seo", label: "Rédaction d'un article SEO" },
  { key: "social_media", label: "Gestion des réseaux sociaux" },
  { key: "ad_campaign", label: "Campagne publicitaire" },
  { key: "newsletter_feature", label: "Mise en avant dans la newsletter" },
  { key: "content_creation", label: "Création de contenu" },
  { key: "marketing", label: "Accompagnement marketing" },
];

export default async function ProDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await currentUser();
  const professional = user ? await getProfessionalByClerkId(user.id) : null;

  if (!professional) {
    const categories = await getAllCategories();
    return (
      <div>
        <h1 className="mb-2 text-2xl font-semibold text-ocean-dark">Devenir partenaire</h1>
        <p className="mb-6 text-sm text-foreground/60">
          Remplis la fiche complète de ton établissement. Un membre de l&apos;équipe Essaouira Inside l&apos;examinera
          avant de la publier et de valider ton compte.
        </p>
        <form action={applyAsProfessional} className="max-w-2xl space-y-6 rounded-2xl border border-black/5 bg-white p-6">
          <div>
            <label className={labelClass}>Responsable</label>
            <input name="contactName" className={inputClass} required />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Catégorie</label>
              <select name="categoryId" className={inputClass} required>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name.fr}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Sous-catégorie</label>
              <select name="subcategory" className={inputClass} required>
                {Object.values(CATEGORY_SUBCATEGORIES)
                  .flat()
                  .filter((v, i, arr) => arr.indexOf(v) === i)
                  .map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <LocalizedFieldGroup field="name" label="Nom de l'établissement" required />
          <LocalizedFieldGroup field="description" label="Description" multiline />

          <div>
            <label className={labelClass}>Adresse</label>
            <input name="address" className={inputClass} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Latitude</label>
              <input name="lat" type="number" step="any" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Longitude</label>
              <input name="lng" type="number" step="any" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Téléphone</label>
              <input name="phone" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>WhatsApp</label>
              <input name="whatsapp" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Site internet</label>
              <input name="website" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Niveau de prix</label>
            <select name="priceLevel" defaultValue="€€" className={inputClass}>
              <option value="€">€</option>
              <option value="€€">€€</option>
              <option value="€€€">€€€</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Photos (une URL par ligne)</label>
            <textarea name="images" rows={4} className={inputClass} placeholder="https://..." />
          </div>

          <button type="submit" className="rounded-full bg-ocean-dark px-6 py-2.5 text-sm font-semibold text-white hover:bg-ocean">
            Envoyer ma demande
          </button>
        </form>
      </div>
    );
  }

  if (professional.status === "pending") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <p className="font-semibold text-amber-800">Demande en attente de validation</p>
        <p className="mt-1 text-sm text-amber-700">
          Merci {professional.contactName || professional.companyName} ! Votre demande est en cours d&apos;examen.
        </p>
      </div>
    );
  }

  if (professional.status === "refused" || professional.status === "suspended") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="font-semibold text-red-800">
          Compte {professional.status === "refused" ? "refusé" : "suspendu"}
        </p>
        <p className="mt-1 text-sm text-red-700">Contactez-nous pour plus d&apos;informations.</p>
      </div>
    );
  }

  const [subscription, invoices, serviceOrders, allEstablishments, plans] = await Promise.all([
    getSubscriptionByProfessionalId(professional.id),
    getInvoicesByProfessionalId(professional.id),
    getServiceOrdersByProfessionalId(professional.id),
    adminGetEstablishments(),
    getSubscriptionPlans(),
  ]);
  const myEstablishment = allEstablishments.find((e) => e.professionalId === professional.id);

  const [labelApplication, labelBadges] = myEstablishment
    ? await Promise.all([
        getLabelApplicationByEstablishmentId(myEstablishment.id),
        getLabelBadges(myEstablishment.id),
      ])
    : [null, []];
  const labelApplicationOpen = labelApplication && OPEN_LABEL_APPLICATION_STATUSES.includes(labelApplication.status);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-ocean-dark">Bonjour {professional.companyName}</h1>
        <p className="text-sm text-foreground/60">Votre espace professionnel Essaouira Inside.</p>
      </div>

      <section className="rounded-2xl border border-black/5 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-ocean-dark">Votre abonnement</h2>
        {subscription && subscription.status === "active" ? (
          <p className="mb-4 text-sm text-foreground/70">
            Plan <strong>{subscription.planKey}</strong> ({subscription.billingCycle}) — statut : {subscription.status}
          </p>
        ) : (
          <p className="mb-4 text-sm text-foreground/60">
            Vous êtes actuellement sur le plan Starter (gratuit). Choisissez un plan pour débloquer plus de visibilité.
          </p>
        )}
        <SubscriptionPlans plans={plans} currentPlanKey={subscription?.status === "active" ? subscription.planKey : undefined} />
      </section>

      <section className="rounded-2xl border border-black/5 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-ocean-dark">Votre fiche établissement</h2>
        {myEstablishment ? (
          <form action={updateOwnEstablishment} className="space-y-6">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="id" value={myEstablishment.id} />

            {myEstablishment.status !== "active" && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                Statut actuel : {myEstablishment.status === "pending" ? "en attente de validation" : "désactivée"} —
                elle n&apos;est pas encore visible publiquement.
              </p>
            )}

            <LocalizedFieldGroup field="name" label="Nom" values={myEstablishment.name} required />
            <LocalizedFieldGroup field="description" label="Description" values={myEstablishment.description} multiline />
            <LocalizedFieldGroup field="hours" label="Horaires" values={myEstablishment.hours ?? undefined} />

            <div>
              <label className={labelClass}>Adresse</label>
              <input name="address" defaultValue={myEstablishment.address ?? ""} className={inputClass} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Téléphone</label>
                <input name="phone" defaultValue={myEstablishment.phone ?? ""} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>WhatsApp</label>
                <input name="whatsapp" defaultValue={myEstablishment.whatsapp ?? ""} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Site internet</label>
                <input name="website" defaultValue={myEstablishment.website ?? ""} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Niveau de prix</label>
              <select name="priceLevel" defaultValue={myEstablishment.priceLevel ?? "€€"} className={inputClass}>
                <option value="€">€</option>
                <option value="€€">€€</option>
                <option value="€€€">€€€</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Photos (une URL par ligne)</label>
              <textarea
                name="images"
                defaultValue={myEstablishment.images?.join("\n") ?? ""}
                rows={4}
                className={inputClass}
                placeholder="https://..."
              />
            </div>

            <button type="submit" className="rounded-full bg-ocean-dark px-6 py-2.5 text-sm font-semibold text-white hover:bg-ocean">
              Enregistrer
            </button>
          </form>
        ) : (
          <p className="text-sm text-foreground/60">
            Aucune fiche n&apos;est encore reliée à votre compte. Notre équipe va créer votre fiche établissement.
          </p>
        )}
      </section>

      {myEstablishment && (
        <section className="rounded-2xl border border-black/5 bg-white p-6">
          <h2 className="mb-3 text-sm font-semibold text-ocean-dark">Label Essaouira Inside Approved</h2>

          {labelBadges.length > 0 && (
            <div className="mb-5">
              <LabelBadgeHistory badges={labelBadges.filter((b) => b.status === "active")} />
              {(() => {
                const latestActive = [...labelBadges]
                  .filter((b) => b.status === "active")
                  .sort((a, b) => b.year - a.year)[0];
                if (!latestActive) return null;
                return (
                  <div className="mt-3 flex flex-wrap gap-3">
                    <a
                      href={`/api/label/certificate/${myEstablishment.id}?year=${latestActive.year}`}
                      download
                      className="rounded-full bg-ocean-dark px-4 py-2 text-xs font-semibold text-white hover:bg-ocean"
                    >
                      Télécharger le certificat
                    </a>
                    <a
                      href={`/api/label/badge/${myEstablishment.id}?year=${latestActive.year}`}
                      download
                      className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-foreground/70 hover:bg-black/5"
                    >
                      Télécharger le badge
                    </a>
                    <Link
                      href={`/${locale}/approved/${myEstablishment.slug}`}
                      className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-foreground/70 hover:bg-black/5"
                    >
                      Voir la page officielle
                    </Link>
                  </div>
                );
              })()}
            </div>
          )}

          {labelApplicationOpen ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-800">
                {LABEL_APPLICATION_STATUS_LABELS[labelApplication!.status]}
              </p>
              <p className="mt-1 text-sm text-amber-700">
                Votre candidature du{" "}
                {labelApplication!.createdAt
                  ? new Date(labelApplication!.createdAt).toLocaleDateString("fr-FR")
                  : ""}{" "}
                est en cours de traitement par l&apos;équipe Essaouira Inside.
              </p>
            </div>
          ) : (
            <details className="group">
              <summary className="cursor-pointer list-none rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 inline-block">
                Demander le Label Essaouira Inside Approved
              </summary>
              <form action={applyForLabel} className="mt-5 max-w-2xl space-y-4">
                <input type="hidden" name="establishmentId" value={myEstablishment.id} />
                <div>
                  <label className={labelClass}>Nom du responsable</label>
                  <input name="contactName" defaultValue={professional.contactName ?? ""} className={inputClass} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Téléphone</label>
                    <input name="phone" defaultValue={professional.phone ?? ""} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input name="email" defaultValue={professional.email ?? ""} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Adresse</label>
                  <input name="address" defaultValue={myEstablishment.address ?? ""} className={inputClass} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Site internet</label>
                    <input name="website" defaultValue={professional.website ?? ""} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Réseaux sociaux</label>
                    <input name="socialLinks" className={inputClass} placeholder="Instagram, Facebook..." />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Description de l&apos;activité</label>
                  <textarea name="activityDescription" rows={3} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Galerie photos (une URL par ligne)</label>
                  <textarea name="images" rows={3} className={inputClass} placeholder="https://..." />
                </div>
                <div>
                  <label className={labelClass}>Pourquoi souhaitez-vous obtenir le label ?</label>
                  <textarea name="motivation" rows={3} className={inputClass} required />
                </div>
                <label className="flex items-start gap-2 text-sm text-foreground/70">
                  <input type="checkbox" name="charterAccepted" required className="mt-0.5" />
                  J&apos;ai lu et j&apos;accepte la Charte du Label Essaouira Inside Approved.
                </label>
                <button type="submit" className="rounded-full bg-ocean-dark px-6 py-2.5 text-sm font-semibold text-white hover:bg-ocean">
                  Envoyer ma candidature
                </button>
              </form>
            </details>
          )}
        </section>
      )}

      <section className="rounded-2xl border border-black/5 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-ocean-dark">Factures</h2>
        {invoices.length === 0 ? (
          <p className="text-sm text-foreground/60">Aucune facture pour le moment.</p>
        ) : (
          <ul className="space-y-1 text-sm text-foreground/70">
            {invoices.map((inv) => (
              <li key={inv.id}>
                {inv.amountMad} MAD — {inv.status} —{" "}
                {inv.issuedAt ? new Date(inv.issuedAt).toLocaleDateString("fr-FR") : ""}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-black/5 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-ocean-dark">Marketplace de services</h2>
        <form action={requestMarketplaceService} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className={labelClass}>Service</label>
            <select name="serviceKey" className={inputClass}>
              {SERVICES.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className={labelClass}>Notes</label>
            <input name="notes" className={inputClass} placeholder="Détails de votre demande" />
          </div>
          <button type="submit" className="rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
            Commander
          </button>
        </form>
        {serviceOrders.length > 0 && (
          <ul className="mt-4 space-y-1 text-sm text-foreground/70">
            {serviceOrders.map((o) => (
              <li key={o.id}>
                {SERVICES.find((s) => s.key === o.serviceKey)?.label ?? o.serviceKey} — {o.status}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
