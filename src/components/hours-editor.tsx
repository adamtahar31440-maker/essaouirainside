"use client";

import { useState } from "react";

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

function parseExisting(value: string, dayLabels: string[]): string[] {
  const lines = value.split("\n");
  return dayLabels.map((label) => {
    const line = lines.find((l) => l.trim().toLowerCase().startsWith(label.toLowerCase()));
    if (!line) return "";
    const idx = line.indexOf(":");
    return idx >= 0 ? line.slice(idx + 1).trim() : "";
  });
}

export function HoursEditor({
  name,
  defaultValue,
  dayLabels,
  copyLabel,
  placeholder,
}: {
  name: string;
  defaultValue?: string;
  dayLabels: string[];
  copyLabel: string;
  placeholder: string;
}) {
  const [values, setValues] = useState<string[]>(() =>
    defaultValue ? parseExisting(defaultValue, dayLabels) : DAY_KEYS.map(() => "")
  );

  function updateDay(i: number, value: string) {
    setValues((prev) => prev.map((v, idx) => (idx === i ? value : v)));
  }

  function copyPrevious(i: number) {
    setValues((prev) => prev.map((v, idx) => (idx === i ? prev[i - 1] : v)));
  }

  const serialized = DAY_KEYS.map((_, i) => (values[i] ? `${dayLabels[i]}: ${values[i]}` : null))
    .filter(Boolean)
    .join("\n");

  return (
    <div>
      <div className="space-y-2">
        {DAY_KEYS.map((key, i) => (
          <div key={key} className="flex items-center gap-2">
            <span className="w-24 shrink-0 text-sm text-foreground/70">{dayLabels[i]}</span>
            <input
              value={values[i]}
              onChange={(e) => updateDay(i, e.target.value)}
              placeholder={placeholder}
              className="flex-1 rounded-lg border border-black/10 px-3 py-1.5 text-sm outline-none focus:border-ocean-dark"
            />
            {i > 0 && (
              <button
                type="button"
                onClick={() => copyPrevious(i)}
                className="shrink-0 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-foreground/70 hover:bg-sand/50"
              >
                {copyLabel}
              </button>
            )}
          </div>
        ))}
      </div>
      <input type="hidden" name={name} value={serialized} />
    </div>
  );
}
