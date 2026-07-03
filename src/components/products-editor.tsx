"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

type ProductInput = { name: string; price: string };

export function ProductsEditor({
  name,
  defaultProducts = [],
  namePlaceholder,
  pricePlaceholder,
  addLabel,
}: {
  name: string;
  defaultProducts?: { name: string; price: number | null }[];
  namePlaceholder: string;
  pricePlaceholder: string;
  addLabel: string;
}) {
  const [items, setItems] = useState<ProductInput[]>(
    defaultProducts.map((p) => ({ name: p.name, price: p.price != null ? String(p.price) : "" }))
  );

  function addItem() {
    setItems((prev) => [...prev, { name: "", price: "" }]);
  }
  function updateItem(i: number, field: "name" | "price", value: string) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));
  }
  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  const serialized = JSON.stringify(
    items
      .filter((it) => it.name.trim())
      .map((it) => ({ name: it.name.trim(), price: it.price.trim() ? Number(it.price) : null }))
  );

  return (
    <div>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={it.name}
              onChange={(e) => updateItem(i, "name", e.target.value)}
              placeholder={namePlaceholder}
              className="flex-1 rounded-lg border border-black/10 px-3 py-1.5 text-sm outline-none focus:border-ocean-dark"
            />
            <input
              value={it.price}
              onChange={(e) => updateItem(i, "price", e.target.value.replace(/[^\d]/g, ""))}
              placeholder={pricePlaceholder}
              inputMode="numeric"
              className="w-28 shrink-0 rounded-lg border border-black/10 px-3 py-1.5 text-sm outline-none focus:border-ocean-dark"
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="shrink-0 rounded-full p-1.5 text-foreground/50 hover:bg-sand/50 hover:text-red-600"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="mt-2 flex items-center gap-1.5 rounded-full border border-dashed border-black/20 px-4 py-1.5 text-xs font-medium text-foreground/70 hover:bg-sand/50"
      >
        <Plus size={14} /> {addLabel}
      </button>
      <input type="hidden" name={name} value={serialized} />
    </div>
  );
}
