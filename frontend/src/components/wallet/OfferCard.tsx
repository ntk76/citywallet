import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, MapPin, Tag } from "lucide-react";
import type { Recommendation } from "@/lib/recommend";

export function OfferCard({ rec, big = false }: { rec: Recommendation; big?: boolean }) {
  const { poi, offer, reason, fitsTimeslot } = rec;
  return (
    <Link
      to={`/detail/${poi.id}`}
      className={`group block overflow-hidden rounded-[var(--radius)] glass transition hover:translate-y-[-2px] hover:glow ${big ? "p-0" : "p-0"}`}
      aria-label={`${poi.name} öffnen`}
    >
      {/* Hero band */}
      <div
        className={`relative ${big ? "h-44" : "h-28"} sunset-bg`}
        style={{
          backgroundImage: poi.imageUrl
            ? `linear-gradient(135deg, hsla(${poi.imageHue} 90% 20% / 0.45), hsla(${(poi.imageHue + 30) % 360} 88% 24% / 0.35) 70%, hsla(${(poi.imageHue + 60) % 360} 90% 28% / 0.3)), url(${poi.imageUrl})`
            : `linear-gradient(135deg, hsl(${poi.imageHue} 90% 58%), hsl(${(poi.imageHue + 30) % 360} 88% 62%) 70%, hsl(${(poi.imageHue + 60) % 360} 90% 64%))`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {offer && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold text-foreground shadow-soft">
            <Tag className="h-3 w-3" /> {offer.discountPct}%
          </span>
        )}
        {offer && (
          <Countdown minutes={offer.validForMin} className="absolute right-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-mono text-foreground shadow-soft" />
        )}
      </div>

      <div className="space-y-2 p-4">
        {big ? (
          <h2 className="text-2xl font-bold leading-tight">
            {offer ? offer.headline : poi.name}
          </h2>
        ) : (
          <h3 className="text-base font-semibold leading-tight">{poi.name}</h3>
        )}

        <p className={`text-muted-foreground ${big ? "text-sm" : "text-xs"}`}>{reason}</p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {poi.distanceM} m</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {poi.walkMin} Min</span>
          {fitsTimeslot ? (
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-success">passt ins Zeitfenster</span>
          ) : (
            <span className="rounded-full bg-muted px-2 py-0.5">knapp</span>
          )}
        </div>

        {big && (
          <div className="mt-3">
            <span className="inline-flex items-center justify-center rounded-full sunset-bg px-5 py-2.5 text-sm font-semibold text-primary-foreground glow">
              {offer ? offer.cta : "Ansehen"} →
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

export function Countdown({ minutes, className }: { minutes: number; className?: string }) {
  const [secs, setSecs] = useState(minutes * 60);
  useEffect(() => {
    const id = window.setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, []);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return <span className={className} aria-label="Restzeit">⏱ {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}</span>;
}
