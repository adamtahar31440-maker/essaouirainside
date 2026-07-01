"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Menu, X, Search, Globe, ChevronDown } from "lucide-react";
import { localeNames, routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function Header({ activeModules = [] }: { activeModules?: string[] }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (key?: string) => !key || activeModules.includes(key);

  const links = [
    { href: "/", label: t("home") },
    { href: "/decouvrir", label: t("discover") },
    { href: "/hebergements", label: t("stays") },
    { href: "/restaurants", label: t("restaurants"), moduleKey: "restaurants" },
    { href: "/activites", label: t("activities"), moduleKey: "activites" },
    { href: "/shopping", label: t("shopping"), moduleKey: "shopping" },
    { href: "/immobilier", label: t("realEstate"), moduleKey: "immobilier" },
    { href: "/vivre-a-essaouira", label: t("living") },
    { href: "/blog", label: t("blog"), moduleKey: "blog" },
    { href: "/agenda", label: t("agenda") },
    { href: "/tarifs", label: t("pricing"), moduleKey: "tarifs" },
    { href: "/assistance", label: t("assistance"), moduleKey: "assistance", urgent: true },
  ].filter((link) => isActive(link.moduleKey));

  const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";

  return (
    <header className="relative z-50 border-b border-black/5 bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href={`/${locale}`} className="shrink-0 text-lg font-semibold tracking-tight text-ocean-dark">
          Essaouira <span className="text-terracotta">Inside</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={`/${locale}${link.href === "/" ? "" : link.href}`}
              className={cn(
                "text-sm font-medium transition",
                link.urgent ? "font-semibold text-red-600 hover:text-red-700" : "text-foreground/80 hover:text-ocean-dark"
              )}
            >
              {link.label}
            </Link>
          ))}
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
            {links.map((link) => (
              <Link
                key={link.href}
                href={`/${locale}${link.href === "/" ? "" : link.href}`}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-2 py-2 text-sm font-medium hover:bg-sand/50",
                  link.urgent ? "text-red-600" : "text-foreground/80"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={`/${locale}/recherche`}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2 text-sm font-medium text-foreground/80 hover:bg-sand/50"
            >
              {t("search")}
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
