import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

export function Footer({
  activeModules = [],
  navLinks = [],
}: {
  activeModules?: string[];
  navLinks?: { href: string; label: string }[];
}) {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const locale = useLocale();

  const year = new Date().getFullYear();
  const isActive = (key?: string) => !key || activeModules.includes(key);

  const exploreLinks = [
    ...navLinks,
    ...(isActive("assistance") ? [{ href: "/assistance", label: nav("assistance") }] : []),
  ];

  return (
    <footer className="mt-24 border-t border-black/5 bg-ocean-dark text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-semibold">
              Essaouira <span className="text-terracotta">Inside</span>
            </p>
            <p className="mt-3 text-sm text-white/70">{t("tagline")}</p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/50">
              {t("explore")}
            </p>
            <ul className="mt-3 space-y-2">
              {exploreLinks.map((l) => (
                <li key={l.href}>
                  <Link href={`/${locale}${l.href}`} className="text-sm text-white/80 hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/50">
              {t("about")}
            </p>
            <ul className="mt-3 space-y-2">
              <li><Link href={`/${locale}/contact`} className="text-sm text-white/80 hover:text-white">{t("contact")}</Link></li>
              <li><Link href={`/${locale}/mentions-legales`} className="text-sm text-white/80 hover:text-white">{t("legal")}</Link></li>
              <li><Link href={`/${locale}/confidentialite`} className="text-sm text-white/80 hover:text-white">{t("privacy")}</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/50">
              essaouirainside.com
            </p>
            <p className="mt-3 text-sm text-white/70">Essaouira, Maroc</p>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/50">
          © {year} Essaouira Inside — {t("rights")}
        </div>
      </div>
    </footer>
  );
}
