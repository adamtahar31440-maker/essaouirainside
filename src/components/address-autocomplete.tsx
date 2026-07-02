"use client";

import { useEffect, useRef, useState } from "react";

type Suggestion = { display_name: string; lat: string; lon: string };

// Roughly the Essaouira area — biases results without excluding matches elsewhere.
const ESSAOUIRA_VIEWBOX = "-9.90,31.60,-9.65,31.40";

export function AddressAutocomplete({
  className,
  dir,
  defaultValue,
}: {
  className: string;
  dir?: "ltr" | "rtl";
  defaultValue?: string;
}) {
  const [query, setQuery] = useState(defaultValue ?? "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          format: "json",
          q: query,
          countrycodes: "ma",
          viewbox: ESSAOUIRA_VIEWBOX,
          limit: "5",
        });
        const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
        if (!res.ok) return;
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
        setOpen(true);
      } catch {
        setSuggestions([]);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  function selectSuggestion(s: Suggestion) {
    setQuery(s.display_name);
    setSuggestions([]);
    setOpen(false);
    const form = wrapperRef.current?.closest("form");
    const latInput = form?.elements.namedItem("lat");
    const lngInput = form?.elements.namedItem("lng");
    if (latInput instanceof HTMLInputElement) latInput.value = s.lat;
    if (lngInput instanceof HTMLInputElement) lngInput.value = s.lon;
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        name="address"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={className}
        dir={dir}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-black/10 bg-white text-sm shadow-lg">
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectSuggestion(s)}
                className="block w-full px-3 py-2 text-left hover:bg-sand"
              >
                {s.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
