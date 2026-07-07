import Link from "next/link";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { getSubscriptionPlans } from "@/lib/admin-data";
import { Section } from "@/components/section";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Espace Professionnel",
    description:
      "Rejoignez Essaouira Inside en tant que professionnel : restaurants, hôtels, riads, activités, agences immobilières. Plans Starter, Premium, Business et Enterprise.",
    alternates: { canonical: `https://essaouirainside.com/${locale}/pro` },
  };
}

export default async function ProLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const plans = await getSubscriptionPlans();
  const dashboardPath = `/${locale}/pro/dashboard`;
  const signInHref = `/${locale}/sign-in?redirect_url=${encodeURIComponent(dashboardPath)}`;
  const signUpHref = `/${locale}/sign-up?redirect_url=${encodeURIComponent(dashboardPath)}`;

  return (
    <div>
      <div className="bg-ocean-dark py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h1 className="text-3xl font-semibold sm:text-4xl">Rejoignez Essaouira Inside</h1>
          <p className="mt-4 text-white/80">
            Restaurants, hôtels, riads, activités, boutiques, agences immobilières — mettez votre établissement en
            avant auprès des voyageurs et habitants d&apos;Essaouira.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={signUpHref}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ocean-dark hover:bg-white/90"
            >
              Créer mon compte pro
            </Link>
            <Link
              href={signInHref}
              className="rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>

      <Section>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, i) => (
            <div
              key={plan.key}
              className={cn(
                "flex flex-col rounded-2xl border p-6",
                i === 1 ? "border-ocean-dark bg-ocean-dark text-white shadow-lg" : "border-black/5 bg-white"
              )}
            >
              <p className={cn("text-sm font-semibold uppercase tracking-wide", i === 1 ? "text-white/70" : "text-azur")}>
                {plan.name.fr}
              </p>
              <p className="mt-2 text-3xl font-semibold">
                {plan.priceMonthlyMad === 0 ? "Gratuit" : `${plan.priceMonthlyMad} MAD`}
                {plan.priceMonthlyMad > 0 && <span className="text-sm font-normal opacity-60"> /mois</span>}
              </p>
              {plan.priceMonthlyMad > 0 && (
                <p className={cn("text-xs", i === 1 ? "text-white/60" : "text-foreground/50")}>
                  ou {plan.priceYearlyMad} MAD/an (2 mois offerts)
                </p>
              )}
              <ul className="mt-5 flex-1 space-y-2 text-sm">
                {plan.features?.fr?.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2">
                    <Check size={16} className={cn("mt-0.5 shrink-0", i === 1 ? "text-white" : "text-azur")} />
                    <span className={i === 1 ? "text-white/90" : "text-foreground/70"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={signUpHref}
                className={cn(
                  "mt-6 rounded-full px-5 py-2.5 text-center text-sm font-semibold transition",
                  i === 1
                    ? "bg-white text-ocean-dark hover:bg-white/90"
                    : "bg-ocean-dark text-white hover:bg-ocean"
                )}
              >
                {plan.priceMonthlyMad === 0 ? "Créer ma fiche gratuite" : "Choisir ce plan"}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-foreground/60">
          Après inscription, votre demande est validée par notre équipe sous 24-48h avant activation.
        </p>
      </Section>
    </div>
  );
}
