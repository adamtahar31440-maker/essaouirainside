import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { getTranslations, setRequestLocale } from "next-intl/server";
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
import { ProApplicationForm } from "@/components/pro-application-form";
import { DashboardLangSwitcher } from "@/components/dashboard-lang-switcher";
import { SubmitButton } from "@/components/submit-button";
import { ImageUploader } from "@/components/image-uploader";
import { HoursEditor } from "@/components/hours-editor";
import { PRICE_LEVELS, priceLevelLabel } from "@/lib/labels";

const OPEN_LABEL_APPLICATION_STATUSES = ["pending", "info_requested", "visit_scheduled", "on_hold"];

const inputClass = "w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-ocean-dark";
const labelClass = "mb-1 block text-xs font-semibold text-foreground/60";

export default async function ProDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");
  const user = await currentUser();
  const professional = user ? await getProfessionalByClerkId(user.id) : null;

  if (!professional) {
    const categories = await getAllCategories();
    return <ProApplicationForm action={applyAsProfessional} categories={categories} defaultLocale={locale} />;
  }

  const langSwitcher = <DashboardLangSwitcher locale={locale} label={t("language")} />;

  if (professional.status === "pending") {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">{langSwitcher}</div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <p className="font-semibold text-amber-800">{t("pendingTitle")}</p>
          <p className="mt-1 text-sm text-amber-700">
            {t("pendingBody", { name: professional.contactName || professional.companyName })}
          </p>
        </div>
      </div>
    );
  }

  if (professional.status === "refused" || professional.status === "suspended") {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">{langSwitcher}</div>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="font-semibold text-red-800">
            {professional.status === "refused" ? t("refusedTitle") : t("suspendedTitle")}
          </p>
          <p className="mt-1 text-sm text-red-700">{t("refusedSuspendedBody")}</p>
        </div>
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
  const currentPlanKey = subscription?.status === "active" ? subscription.planKey : "starter";
  const maxPhotos = plans.find((p) => p.key === currentPlanKey)?.maxPhotos ?? null;

  const [labelApplication, labelBadges] = myEstablishment
    ? await Promise.all([
        getLabelApplicationByEstablishmentId(myEstablishment.id),
        getLabelBadges(myEstablishment.id),
      ])
    : [null, []];
  const labelApplicationOpen = labelApplication && OPEN_LABEL_APPLICATION_STATUSES.includes(labelApplication.status);

  const LABEL_APPLICATION_STATUS_LABELS: Record<string, string> = {
    pending: t("labelStatusPending"),
    info_requested: t("labelStatusInfoRequested"),
    visit_scheduled: t("labelStatusVisitScheduled"),
    on_hold: t("labelStatusOnHold"),
  };

  const SERVICES = [
    { key: "shooting_photo", label: t("serviceShootingPhoto") },
    { key: "video", label: t("serviceVideo") },
    { key: "article_seo", label: t("serviceArticleSeo") },
    { key: "social_media", label: t("serviceSocialMedia") },
    { key: "ad_campaign", label: t("serviceAdCampaign") },
    { key: "newsletter_feature", label: t("serviceNewsletterFeature") },
    { key: "content_creation", label: t("serviceContentCreation") },
    { key: "marketing", label: t("serviceMarketing") },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ocean-dark">{t("greeting", { name: professional.companyName })}</h1>
          <p className="text-sm text-foreground/60">{t("tagline")}</p>
        </div>
        {langSwitcher}
      </div>

      <section className="rounded-2xl border border-black/5 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-ocean-dark">{t("subscriptionTitle")}</h2>
        {subscription && subscription.status === "active" ? (
          <p className="mb-4 text-sm text-foreground/70">
            {t("subscriptionActive", {
              plan: subscription.planKey,
              cycle: subscription.billingCycle,
              status: subscription.status,
            })}
          </p>
        ) : (
          <p className="mb-4 text-sm text-foreground/60">{t("subscriptionFree")}</p>
        )}
        <SubscriptionPlans plans={plans} currentPlanKey={subscription?.status === "active" ? subscription.planKey : undefined} />
      </section>

      <section className="rounded-2xl border border-black/5 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-ocean-dark">{t("establishmentTitle")}</h2>
        {myEstablishment ? (
          <form action={updateOwnEstablishment} className="space-y-6">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="id" value={myEstablishment.id} />

            {myEstablishment.status !== "active" && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                {t("establishmentStatusNote", {
                  status: myEstablishment.status === "pending" ? t("statusPending") : t("statusDisabled"),
                })}
              </p>
            )}

            <p className="rounded-lg bg-ocean-dark/5 px-3 py-2 text-xs text-foreground/60">{t("editHint")}</p>

            <div>
              <label className={labelClass}>{t("fieldName")}</label>
              <input name="name" defaultValue={myEstablishment.name.fr} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>{t("fieldDescription")}</label>
              <textarea name="description" defaultValue={myEstablishment.description.fr} rows={4} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t("fieldHours")}</label>
              <HoursEditor
                name="hours"
                defaultValue={myEstablishment.hours?.fr ?? ""}
                dayLabels={[
                  t("dayMon"),
                  t("dayTue"),
                  t("dayWed"),
                  t("dayThu"),
                  t("dayFri"),
                  t("daySat"),
                  t("daySun"),
                ]}
                copyLabel={t("hoursCopyPrevious")}
                placeholder={t("hoursPlaceholder")}
              />
            </div>

            <div>
              <label className={labelClass}>{t("fieldAddress")}</label>
              <input name="address" defaultValue={myEstablishment.address ?? ""} className={inputClass} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>{t("fieldPhone")}</label>
                <input name="phone" defaultValue={myEstablishment.phone ?? ""} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("fieldWhatsapp")}</label>
                <input name="whatsapp" defaultValue={myEstablishment.whatsapp ?? ""} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("fieldWebsite")}</label>
                <input name="website" defaultValue={myEstablishment.website ?? ""} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>{t("fieldPriceLevel")}</label>
              <select name="priceLevel" defaultValue={myEstablishment.priceLevel ?? "€€"} className={inputClass}>
                {PRICE_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {priceLevelLabel(level)}
                  </option>
                ))}
              </select>
            </div>
            <ImageUploader
              label={t("fieldImages")}
              defaultImages={myEstablishment.images ?? []}
              max={maxPhotos}
              limitReachedText={typeof maxPhotos === "number" ? t("imagesLimitReached", { max: maxPhotos }) : undefined}
            />

            <SubmitButton label={t("save")} pendingLabel={t("savePending")} />
          </form>
        ) : (
          <p className="text-sm text-foreground/60">{t("noEstablishment")}</p>
        )}
      </section>

      {myEstablishment && (
        <section className="rounded-2xl border border-black/5 bg-white p-6">
          <h2 className="mb-3 text-sm font-semibold text-ocean-dark">{t("labelTitle")}</h2>

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
                      {t("downloadCertificate")}
                    </a>
                    <a
                      href={`/api/label/badge/${myEstablishment.id}?year=${latestActive.year}`}
                      download
                      className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-foreground/70 hover:bg-black/5"
                    >
                      {t("downloadBadge")}
                    </a>
                    <Link
                      href={`/${locale}/approved/${myEstablishment.slug}`}
                      className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-foreground/70 hover:bg-black/5"
                    >
                      {t("viewOfficialPage")}
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
                {t("labelApplicationDate", {
                  date: labelApplication!.createdAt
                    ? new Date(labelApplication!.createdAt).toLocaleDateString(locale)
                    : "",
                })}
              </p>
            </div>
          ) : (
            <details className="group">
              <summary className="cursor-pointer list-none rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 inline-block">
                {t("requestLabel")}
              </summary>
              <form action={applyForLabel} className="mt-5 max-w-2xl space-y-4">
                <input type="hidden" name="establishmentId" value={myEstablishment.id} />
                <div>
                  <label className={labelClass}>{t("labelContactName")}</label>
                  <input name="contactName" defaultValue={professional.contactName ?? ""} className={inputClass} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>{t("fieldPhone")}</label>
                    <input name="phone" defaultValue={professional.phone ?? ""} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t("labelEmail")}</label>
                    <input name="email" defaultValue={professional.email ?? ""} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t("fieldAddress")}</label>
                  <input name="address" defaultValue={myEstablishment.address ?? ""} className={inputClass} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>{t("fieldWebsite")}</label>
                    <input name="website" defaultValue={professional.website ?? ""} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t("labelSocialLinks")}</label>
                    <input name="socialLinks" className={inputClass} placeholder="Instagram, Facebook..." />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t("labelActivityDescription")}</label>
                  <textarea name="activityDescription" rows={3} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t("labelGallery")}</label>
                  <textarea name="images" rows={3} className={inputClass} placeholder="https://..." />
                </div>
                <div>
                  <label className={labelClass}>{t("labelMotivation")}</label>
                  <textarea name="motivation" rows={3} className={inputClass} required />
                </div>
                <label className="flex items-start gap-2 text-sm text-foreground/70">
                  <input type="checkbox" name="charterAccepted" required className="mt-0.5" />
                  {t("labelCharter")}
                </label>
                <button type="submit" className="rounded-full bg-ocean-dark px-6 py-2.5 text-sm font-semibold text-white hover:bg-ocean">
                  {t("submitLabelApplication")}
                </button>
              </form>
            </details>
          )}
        </section>
      )}

      <section className="rounded-2xl border border-black/5 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-ocean-dark">{t("invoicesTitle")}</h2>
        {invoices.length === 0 ? (
          <p className="text-sm text-foreground/60">{t("noInvoices")}</p>
        ) : (
          <ul className="space-y-1 text-sm text-foreground/70">
            {invoices.map((inv) => (
              <li key={inv.id}>
                {inv.amountMad} MAD — {inv.status} —{" "}
                {inv.issuedAt ? new Date(inv.issuedAt).toLocaleDateString(locale) : ""}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-black/5 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-ocean-dark">{t("marketplaceTitle")}</h2>
        <form action={requestMarketplaceService} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className={labelClass}>{t("serviceLabel")}</label>
            <select name="serviceKey" className={inputClass}>
              {SERVICES.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className={labelClass}>{t("notesLabel")}</label>
            <input name="notes" className={inputClass} placeholder={t("notesPlaceholder")} />
          </div>
          <button type="submit" className="rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
            {t("order")}
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
