"use client";

import { useState } from "react";

export function PhoneField({
  name,
  defaultValue,
  dir,
}: {
  name: string;
  defaultValue?: string;
  dir?: "ltr" | "rtl";
}) {
  const [local, setLocal] = useState(defaultValue?.replace(/^\+?212\s?/, "") ?? "");
  const digits = local.replace(/\D/g, "").replace(/^0+/, "");
  const full = digits ? `+212${digits}` : "";

  return (
    <div>
      <div
        className="flex overflow-hidden rounded-lg border border-black/10 focus-within:border-ocean-dark"
        dir="ltr"
      >
        <span className="flex items-center bg-sand px-3 text-sm font-medium text-foreground/70">+212</span>
        <input
          type="tel"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          className="w-full px-3 py-2 text-sm outline-none"
          placeholder="6XX XXX XXX"
          dir={dir}
        />
      </div>
      <input type="hidden" name={name} value={full} />
    </div>
  );
}
