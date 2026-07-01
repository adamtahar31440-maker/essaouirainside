import { currentUser } from "@clerk/nextjs/server";
import {
  getProfessionalByClerkId,
  getSubscriptionByProfessionalId,
  getInvoicesByProfessionalId,
  getServiceOrdersByProfessionalId,
  adminGetEstablishments,
  getSubscriptionPlans,
} from "@/lib/admin-data";
import { applyAsProfessional, requestMarketplaceService } from "@/lib/pro-actions";
import { SubscriptionPlans } from "@/components/subscription-plans";

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

export default async function ProDashboardPage() {
  const user = await currentUser();
  const professional = user ? await getProfessionalByClerkId(user.id) : null;

  if (!professional) {
    return (
      <div>
        <h1 className="mb-2 text-2xl font-semibold text-ocean-dark">Devenir partenaire</h1>
        <p className="mb-6 text-sm text-foreground/60">
          Créez votre profil professionnel. Un membre de l&apos;équipe Essaouira Inside validera votre demande.
        </p>
        <form action={applyAsProfessional} className="max-w-xl space-y-4 rounded-2xl border border-black/5 bg-white p-6">
          <div>
            <label className={labelClass}>Nom de l&apos;entreprise</label>
            <input name="companyName" className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Responsable</label>
            <input name="contactName" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Type d&apos;activité</label>
            <select name="activityType" className={inputClass}>
              <option value="restaurant">Restaurant</option>
              <option value="hotel">Hôtel</option>
              <option value="riad">Riad</option>
              <option value="activite">Activité</option>
              <option value="immobilier">Agence immobilière</option>
              <option value="boutique">Boutique</option>
              <option value="artisan">Artisan</option>
              <option value="service">Service</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Téléphone</label>
            <input name="phone" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Site internet</label>
            <input name="website" className={inputClass} />
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
          <p className="text-sm text-foreground/70">
            {myEstablishment.name.fr} — Contactez l&apos;équipe pour toute modification de contenu pour le moment.
          </p>
        ) : (
          <p className="text-sm text-foreground/60">
            Aucune fiche n&apos;est encore reliée à votre compte. Notre équipe va créer votre fiche établissement.
          </p>
        )}
      </section>

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
