"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function WeatherWidgetToggle({
  badge,
  closeLabel,
  children,
}: {
  badge: React.ReactNode;
  closeLabel: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />}
      <div className="fixed bottom-24 right-4 z-40 rtl:right-auto rtl:left-4 sm:bottom-24 sm:right-6 rtl:sm:right-auto rtl:sm:left-6">
      {open ? (
        <div className="relative w-72 rounded-2xl border border-black/10 bg-white p-4">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={closeLabel}
            className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-full text-foreground/50 hover:bg-black/5 hover:text-foreground"
          >
            <X size={18} />
          </button>
          {children}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-sand/40"
        >
          {badge}
        </button>
      )}
      </div>
    </>
  );
}
