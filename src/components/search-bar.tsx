"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Search } from "lucide-react";

export function SearchBar() {
  const t = useTranslations("home");
  const locale = useLocale();
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/${locale}/recherche?q=${encodeURIComponent(q)}`);
      }}
      className="flex w-full max-w-xl items-center gap-2 rounded-full bg-white p-1.5 pl-5 shadow-lg"
    >
      <Search size={18} className="shrink-0 text-foreground/40" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className="w-full bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-foreground/40"
      />
      <button
        type="submit"
        aria-label="search"
        className="shrink-0 rounded-full bg-ocean-dark px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ocean"
      >
        →
      </button>
    </form>
  );
}
