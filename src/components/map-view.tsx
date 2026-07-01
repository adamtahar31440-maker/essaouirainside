"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export type MapPoint = {
  lat: number;
  lng: number;
  label: string;
  href?: string;
};

export function MapView({ points, zoom = 14 }: { points: MapPoint[]; zoom?: number }) {
  if (points.length === 0) return null;
  const center: [number, number] = [points[0].lat, points[0].lng];

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((p, i) => (
        <Marker key={i} position={[p.lat, p.lng]} icon={markerIcon}>
          <Popup>
            {p.href ? <a href={p.href}>{p.label}</a> : p.label}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
