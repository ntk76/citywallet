import { useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { POIS, categoryMeta } from "@/mocks/pois";
import { fetchContext } from "@/mocks/context";
import { mapsLink } from "@/lib/geo";
import { Link } from "react-router-dom";

// Fix default icon paths (otherwise broken in bundlers)
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

export default function ExploreMap() {
  const ctx = useMemo(() => fetchContext(), []);
  const center: [number, number] = [ctx.location.lat, ctx.location.lng];

  // Force size invalidation when container becomes visible
  useEffect(() => {
    const t = setTimeout(() => window.dispatchEvent(new Event("resize")), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-3">
      <header>
        <h1 className="text-2xl font-bold"><span className="sunset-text">Karte</span></h1>
        <p className="text-xs text-muted-foreground">{POIS.length} Orte · OpenStreetMap</p>
      </header>

      <div className="overflow-hidden rounded-[var(--radius)] glass" style={{ height: "62vh" }}>
        <MapContainer center={center} zoom={15} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {POIS.map((p) => (
            <Marker key={p.id} position={[p.location.lat, p.location.lng]}>
              <Popup>
                <div className="space-y-1.5 min-w-[180px]">
                  <div className="text-xs uppercase tracking-wide opacity-70">
                    {categoryMeta[p.category].emoji} {categoryMeta[p.category].label}
                  </div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs opacity-70">{p.distanceM} m · {p.walkMin} Min</div>
                  <div className="flex gap-2 pt-1">
                    <Link
                      to={`/detail/${p.id}`}
                      className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
                    >
                      Details
                    </Link>
                    <a
                      href={mapsLink(p.location.lat, p.location.lng, p.name)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-border px-3 py-1 text-xs font-semibold"
                    >
                      Navigieren
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
