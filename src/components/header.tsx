"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Menu, X, Search, Globe, ChevronDown } from "lucide-react";
import { localeNames, routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string; pages?: { href: string; label: string }[] };

export function Header({
  activeModules = [],
  navLinks = [],
}: {
  activeModules?: string[];
  navLinks?: NavLink[];
}) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (key?: string) => !key || activeModules.includes(key);

  const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";
  const localePrefixed = (href: string) => `/${locale}${href === "/" ? "" : href}`;

  return (
    <header className="relative z-50 border-b border-black/5 bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href={`/${locale}`} className="shrink-0 text-lg font-semibold tracking-tight text-ocean-dark">
          Essaouira <span className="text-terracotta">Inside</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          <Link href={`/${locale}`} className="text-sm font-medium text-foreground/80 transition hover:text-ocean-dark">
            {t("home")}
          </Link>
          {navLinks.map((link) =>
            link.pages && link.pages.length > 0 ? (
              <div key={link.href} className="group relative">
                <Link
                  href={localePrefixed(link.href)}
                  className="flex items-center gap-1 text-sm font-medium text-foreground/80 transition hover:text-ocean-dark"
                >
                  {link.label}
                  <ChevronDown size={14} className="transition group-hover:rotate-180" />
                </Link>
                <div className="invisible absolute left-0 top-full z-20 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 rtl:left-auto rtl:right-0">
                  <div className="w-56 rounded-xl border border-black/10 bg-white p-2 shadow-lg">
                    {link.pages.map((p) => (
                      <Link
                        key={p.href}
                        href={localePrefixed(p.href)}
                        className="block rounded-lg px-3 py-2 text-sm text-foreground/70 hover:bg-sand/50 hover:text-ocean-dark"
                      >
                        {p.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={link.href}
                href={localePrefixed(link.href)}
                className="text-sm font-medium text-foreground/80 transition hover:text-ocean-dark"
              >
                {link.label}
              </Link>
            )
          )}
          {isActive("tarifs") && (
            <Link href={localePrefixed("/tarifs")} className="text-sm font-medium text-foreground/80 transition hover:text-ocean-dark">
              {t("pricing")}
            </Link>
          )}
          {isActive("assistance") && (
            <Link href={localePrefixed("/assistance")} className="text-sm font-semibold text-red-600 transition hover:text-red-700">
              {t("assistance")}
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href={`/${locale}/recherche`}
            aria-label={t("search")}
            className="rounded-full p-2 text-foreground/70 transition hover:bg-sand/60 hover:text-ocean-dark"
          >
            <Search size={18} />
          </Link>
          <LocaleSwitcher pathWithoutLocale={pathWithoutLocale} />
          <Link
            href={`/${locale}/pro`}
            className="rounded-full bg-ocean-dark px-4 py-2 text-sm font-semibold text-white transition hover:bg-ocean"
          >
            {t("proSpace")}
          </Link>
        </div>

        <button
          className="rounded-md p-2 lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-black/5 bg-background px-4 pb-4 lg:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            <Link
              href={`/${locale}`}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2 text-sm font-medium text-foreground/80 hover:bg-sand/50"
            >
              {t("home")}
            </Link>
            {navLinks.map((link) => (
              <div key={link.href}>
                <Link
                  href={localePrefixed(link.href)}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-2 py-2 text-sm font-medium text-foreground/80 hover:bg-sand/50"
                >
                  {link.label}
                </Link>
                {link.pages && link.pages.length > 0 && (
                  <div className="ms-3 flex flex-col gap-0.5 border-s border-black/10 ps-3">
                    {link.pages.map((p) => (
                      <Link
                        key={p.href}
                        href={localePrefixed(p.href)}
                        onClick={() => setOpen(false)}
                        className="rounded-md px-2 py-1.5 text-sm text-foreground/60 hover:bg-sand/50"
                      >
                        {p.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isActive("tarifs") && (
              <Link
                href={localePrefixed("/tarifs")}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm font-medium text-foreground/80 hover:bg-sand/50"
              >
                {t("pricing")}
              </Link>
            )}
            {isActive("assistance") && (
              <Link
                href={localePrefixed("/assistance")}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm font-semibold text-red-600 hover:bg-sand/50"
              >
                {t("assistance")}
              </Link>
            )}
            <Link
              href={`/${locale}/recherche`}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2 text-sm font-medium text-foreground/80 hover:bg-sand/50"
            >
              {t("search")}
            </Link>
            <Link
              href={`/${locale}/pro`}
              onClick={() => setOpen(false)}
              className="mt-1 rounded-full bg-ocean-dark px-4 py-2 text-center text-sm font-semibold text-white"
            >
              {t("proSpace")}
            </Link>
          </nav>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {routing.locales.map((l) => (
              <Link
                key={l}
                href={`/${l}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-center text-xs font-medium",
                  l === locale ? "border-ocean-dark bg-ocean-dark text-white" : "border-black/10"
                )}
              >
                {localeNames[l]}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function LocaleSwitcher({ pathWithoutLocale }: { pathWithoutLocale: string }) {
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-foreground/70 hover:bg-sand/60"
      >
        <Globe size={14} />
        {localeNames[locale]}
        <ChevronDown size={12} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 grid max-h-80 w-48 grid-cols-1 gap-0.5 overflow-y-auto rounded-xl border border-black/10 bg-white p-2 shadow-lg rtl:right-auto rtl:left-0">
            {routing.locales.map((l) => (
              <Link
                key={l}
                href={`/${l}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium",
                  l === locale ? "bg-ocean-dark text-white" : "text-foreground/70 hover:bg-sand/50"
                )}
              >
                {localeNames[l]}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
