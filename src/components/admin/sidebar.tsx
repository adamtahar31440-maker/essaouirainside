"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { can, type Role, type Permission } from "@/lib/roles";

const SECTIONS: { href: string; label: string; permission?: Permission }[] = [
  { href: "", label: "Dashboard" },
  { href: "/utilisateurs", label: "Utilisateurs", permission: "users" },
  { href: "/professionnels", label: "Professionnels", permission: "professionals" },
  { href: "/establissements", label: "Établissements", permission: "establishments" },
  { href: "/immobilier", label: "Immobilier", permission: "realEstate" },
  { href: "/evenements", label: "Événements", permission: "events" },
  { href: "/articles", label: "Articles", permission: "articles" },
  { href: "/pages", label: "Pages", permission: "articles" },
  { href: "/avis", label: "Avis", permission: "reviews" },
  { href: "/publicites", label: "Publicités", permission: "ads" },
  { href: "/abonnements", label: "Abonnements", permission: "subscriptions" },
  { href: "/paiements", label: "Paiements & Factures", permission: "payments" },
  { href: "/newsletter", label: "Newsletter", permission: "newsletter" },
  { href: "/seo", label: "SEO", permission: "seo" },
  { href: "/modules", label: "Modules", permission: "modules" },
  { href: "/parametres", label: "Paramètres", permission: "settings" },
];

export function AdminSidebar({ locale, role }: { locale: string; role: Role }) {
  const pathname = usePathname();
  const base = `/${locale}/admin`;

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-black/10 bg-ocean-dark text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <Link href={base} className="text-sm font-semibold">
          Essaouira <span className="text-terracotta">Inside</span>
        </Link>
        <UserButton />
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {SECTIONS.filter((s) => !s.permission || can(role, s.permission)).map((s) => {
          const href = `${base}${s.href}`;
          const active = pathname === href;
          return (
            <Link
              key={s.href}
              href={href}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm font-medium transition",
                active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              {s.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3 text-xs text-white/50">
        Connecté en tant que {role}
      </div>
    </aside>
  );
}
