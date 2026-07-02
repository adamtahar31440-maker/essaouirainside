"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "@/lib/google-maps-loader";

const ESSAOUIRA_CENTER = { lat: 31.5085, lng: -9.7595 };
const ESSAOUIRA_BOUNDS = { north: 31.6, south: 31.4, east: -9.65, west: -9.9 };

export function AddressLocationPicker({
  className,
  dir,
  defaultAddress,
  defaultLat,
  defaultLng,
}: {
  className: string;
  dir?: "ltr" | "rtl";
  defaultAddress?: string;
  defaultLat?: number | null;
  defaultLng?: number | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [coords, setCoords] = useState({
    lat: defaultLat ?? ESSAOUIRA_CENTER.lat,
    lng: defaultLng ?? ESSAOUIRA_CENTER.lng,
  });
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "missing-key">("loading");

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

  useEffect(() => {
    if (status !== "ready" || !mapDivRef.current || mapRef.current || !window.google) return;

    const map = new window.google.maps.Map(mapDivRef.current, {
      center: coords,
      zoom: defaultLat ? 16 : 13,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
    });
    const marker = new window.google.maps.Marker({
      position: coords,
      map,
      draggable: true,
    });
    marker.addListener("dragend", () => {
      const pos = marker.getPosition();
      if (pos) setCoords({ lat: pos.lat(), lng: pos.lng() });
    });
    mapRef.current = map;
    markerRef.current = marker;

    if (inputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "ma" },
        fields: ["formatted_address", "geometry"],
        bounds: ESSAOUIRA_BOUNDS,
      });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        const location = place.geometry?.location;
        if (!location) return;
        const next = { lat: location.lat(), lng: location.lng() };
        setCoords(next);
        map.panTo(next);
        map.setZoom(16);
        marker.setPosition(next);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    markerRef.current?.setPosition(coords);
  }, [coords]);

  return (
    <div>
      <input
        ref={inputRef}
        name="address"
        defaultValue={defaultAddress}
        className={className}
        dir={dir}
        autoComplete="off"
      />
      <input type="hidden" name="lat" value={coords.lat} readOnly />
      <input type="hidden" name="lng" value={coords.lng} readOnly />

      {status === "missing-key" && (
        <p className="mt-1 text-xs text-red-600">
          Carte indisponible : clé API Google Maps non configurée.
        </p>
      )}
      {status === "error" && (
        <p className="mt-1 text-xs text-red-600">Impossible de charger Google Maps.</p>
      )}

      <div
        ref={mapDivRef}
        className="mt-2 h-56 w-full overflow-hidden rounded-lg border border-black/10 bg-sand"
      />
      {status === "ready" && (
        <p className="mt-1 text-xs text-foreground/50">
          Faites glisser le repère sur la carte pour ajuster précisément l&apos;emplacement.
        </p>
      )}
    </div>
  );
}
