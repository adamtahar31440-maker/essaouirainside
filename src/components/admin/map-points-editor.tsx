"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { loadGoogleMaps } from "@/lib/google-maps-loader";
import { MapSection } from "@/components/map-section";

const ESSAOUIRA_BOUNDS = { north: 31.6, south: 31.4, east: -9.65, west: -9.9 };

type PointInput = { label: string; lat: number | null; lng: number | null };
type Status = "loading" | "ready" | "error" | "missing-key";

function PointRow({
  point,
  status,
  onLabelChange,
  onCoordsChange,
  onRemove,
  labelPlaceholder,
  addressPlaceholder,
  notLocatedText,
}: {
  point: PointInput;
  status: Status;
  onLabelChange: (label: string) => void;
  onCoordsChange: (lat: number, lng: number) => void;
  onRemove: () => void;
  labelPlaceholder: string;
  addressPlaceholder: string;
  notLocatedText: string;
}) {
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status !== "ready" || !searchRef.current || !window.google) return;
    const autocomplete = new window.google.maps.places.Autocomplete(searchRef.current, {
      componentRestrictions: { country: "ma" },
      fields: ["formatted_address", "geometry"],
      bounds: ESSAOUIRA_BOUNDS,
    });
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const location = place.geometry?.location;
      if (!location) return;
      onCoordsChange(location.lat(), location.lng());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        value={point.label}
        onChange={(e) => onLabelChange(e.target.value)}
        placeholder={labelPlaceholder}
        className="w-44 shrink-0 rounded-lg border border-black/10 px-3 py-1.5 text-sm outline-none focus:border-ocean-dark"
      />
      <input
        ref={searchRef}
        placeholder={addressPlaceholder}
        autoComplete="off"
        className="flex-1 rounded-lg border border-black/10 px-3 py-1.5 text-sm outline-none focus:border-ocean-dark"
      />
      <span className={"shrink-0 text-xs " + (point.lat != null ? "text-emerald-600" : "text-foreground/40")}>
        {point.lat != null && point.lng != null ? `✓ ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}` : notLocatedText}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded-full p-1.5 text-foreground/50 hover:bg-sand/50 hover:text-red-600"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function MapPointsEditor({
  name,
  defaultPoints = [],
  labelPlaceholder,
  addressPlaceholder,
  addLabel,
  notLocatedText,
  missingKeyText,
  errorText,
}: {
  name: string;
  defaultPoints?: { label: string; lat: number; lng: number }[];
  labelPlaceholder: string;
  addressPlaceholder: string;
  addLabel: string;
  notLocatedText: string;
  missingKeyText: string;
  errorText: string;
}) {
  const [points, setPoints] = useState<PointInput[]>(
    defaultPoints.length > 0 ? defaultPoints.map((p) => ({ ...p })) : [{ label: "", lat: null, lng: null }]
  );
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setStatus("missing-key");
      return;
    }
    loadGoogleMaps(apiKey)
      .then(() => setStatus("ready"))
      .catch(() => setStatus("error"));
  }, []);

  function updatePoint(i: number, patch: Partial<PointInput>) {
    setPoints((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }
  function addPoint() {
    setPoints((prev) => [...prev, { label: "", lat: null, lng: null }]);
  }
  function removePoint(i: number) {
    setPoints((prev) => prev.filter((_, idx) => idx !== i));
  }

  const validPoints = points.filter(
    (p): p is { label: string; lat: number; lng: number } => p.label.trim().length > 0 && p.lat != null && p.lng != null
  );
  const serialized = JSON.stringify(validPoints.map((p) => ({ label: p.label.trim(), lat: p.lat, lng: p.lng })));

  return (
    <div>
      <div className="space-y-2">
        {points.map((p, i) => (
          <PointRow
            key={i}
            point={p}
            status={status}
            onLabelChange={(label) => updatePoint(i, { label })}
            onCoordsChange={(lat, lng) => updatePoint(i, { lat, lng })}
            onRemove={() => removePoint(i)}
            labelPlaceholder={labelPlaceholder}
            addressPlaceholder={addressPlaceholder}
            notLocatedText={notLocatedText}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addPoint}
        className="mt-2 flex items-center gap-1.5 rounded-full border border-dashed border-black/20 px-4 py-1.5 text-xs font-medium text-foreground/70 hover:bg-sand/50"
      >
        <Plus size={14} /> {addLabel}
      </button>

      {status === "missing-key" && <p className="mt-1 text-xs text-red-600">{missingKeyText}</p>}
      {status === "error" && <p className="mt-1 text-xs text-red-600">{errorText}</p>}

      {validPoints.length > 0 && (
        <div className="mt-3 h-56 overflow-hidden rounded-lg border border-black/10">
          <MapSection points={validPoints.map((p) => ({ lat: p.lat, lng: p.lng, label: p.label }))} zoom={14} />
        </div>
      )}

      <input type="hidden" name={name} value={serialized} />
    </div>
  );
}
