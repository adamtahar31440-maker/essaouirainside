"use client";

import { useState } from "react";

type Category = { id: number; name: Record<string, string> };
type Subcategory = { slug: string; name: Record<string, string> };

const inputClass =
  "w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-ocean-dark";
const labelClass = "mb-1 block text-xs font-semibold text-foreground/60";

export function CategorySubcategoryPicker({
  categories,
  subcategoriesByCategory,
  locale = "fr",
  defaultCategoryId,
  defaultSubcategory,
  categoryRef,
  categoryLabel = "Catégorie",
  subcategoryLabel = "Sous-catégorie",
}: {
  categories: Category[];
  subcategoriesByCategory: Record<number, Subcategory[]>;
  locale?: string;
  defaultCategoryId?: number;
  defaultSubcategory?: string;
  categoryRef?: React.RefObject<HTMLSelectElement | null>;
  categoryLabel?: string;
  subcategoryLabel?: string;
}) {
  const [categoryId, setCategoryId] = useState<number>(defaultCategoryId ?? categories[0]?.id);
  const subs = subcategoriesByCategory[categoryId] ?? [];
  const [subcategory, setSubcategory] = useState<string>(
    defaultSubcategory && subs.some((s) => s.slug === defaultSubcategory) ? defaultSubcategory : (subs[0]?.slug ?? "")
  );

  function handleCategoryChange(id: number) {
    setCategoryId(id);
    const next = subcategoriesByCategory[id] ?? [];
    setSubcategory(next[0]?.slug ?? "");
  }

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className={labelClass}>{categoryLabel}</label>
        <select
          name="categoryId"
          ref={categoryRef}
          value={categoryId}
          onChange={(e) => handleCategoryChange(Number(e.target.value))}
          className={inputClass}
          required
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name[locale] ?? c.name.fr}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>{subcategoryLabel}</label>
        <select
          name="subcategory"
          value={subcategory}
          onChange={(e) => setSubcategory(e.target.value)}
          className={inputClass}
          required
        >
          {subs.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name[locale] ?? s.name.fr}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
