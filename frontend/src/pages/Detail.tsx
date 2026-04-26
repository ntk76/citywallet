import { Link, useNavigate, useParams } from "react-router-dom";
import { useMemo } from "react";
import { POIS, fetchPoi, categoryMeta } from "@/mocks/pois";
import { recommend } from "@/lib/recommend";
import { loadPrefs } from "@/lib/prefs";
import { useContextSignals } from "@/lib/context-api";
import { formatTimeslotLabel } from "@/lib/timeslot";
import { mapsLink } from "@/lib/geo";
import { Countdown } from "@/components/wallet/OfferCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Clock, Tag } from "lucide-react";

export default function Detail() {
  const { id = "" } = useParams();
  const nav = useNavigate();
  const prefs = useMemo(() => loadPrefs(), []);
  const ctx = useContextSignals(prefs.defaultTimeslot);
  const sourcePois = ctx.livePois.length > 0 ? ctx.livePois : POIS;
  const poi = useMemo(
    () => sourcePois.find((entry) => entry.id === id) ?? fetchPoi(id),
    [sourcePois, id],
  );
  const rec = useMemo(() => (poi ? recommend([poi], ctx, prefs)[0] : undefined), [poi, ctx, prefs]);

  if (!poi || !rec) {
    return (
      <div className="space-y-3">
        <p>Ort nicht gefunden.</p>
        <Link to="/explore/list" className="text-primary underline">Zur Liste</Link>
      </div>
    );
  }

  const { offer, fitsTimeslot } = rec;
  const meta = categoryMeta[poi.category];

  return (
    <div className="space-y-4">
      <button onClick={() => nav(-1)} className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Zurück
      </button>

      <div
        className="relative h-52 rounded-[var(--radius)] overflow-hidden glow"
        style={{
          backgroundImage: poi.imageUrl
            ? `linear-gradient(135deg, hsla(${poi.imageHue} 90% 20% / 0.5), hsla(${(poi.imageHue + 30) % 360} 88% 24% / 0.4) 70%, hsla(${(poi.imageHue + 60) % 360} 90% 28% / 0.35)), url(${poi.imageUrl})`
            : `linear-gradient(135deg, hsl(${poi.imageHue} 90% 58%), hsl(${(poi.imageHue + 30) % 360} 88% 62%) 70%, hsl(${(poi.imageHue + 60) % 360} 90% 64%))`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {offer && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/95 px-3 py-1 text-sm font-bold text-foreground shadow-soft">
            <Tag className="h-3.5 w-3.5" /> {offer.discountPct}% Rabatt
          </span>
        )}
        {offer && (
          <Countdown minutes={offer.validForMin} className="absolute right-3 top-3 rounded-full bg-background/95 px-3 py-1 text-sm font-mono shadow-soft" />
        )}
      </div>

      <header className="space-y-1">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{meta.emoji} {meta.label}</p>
        <h1 className="text-3xl font-bold leading-tight">{poi.name}</h1>
        <p className="text-sm text-muted-foreground">{poi.description}</p>
      </header>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="frosted rounded-full border border-border px-3 py-1.5 inline-flex items-center gap-1">
          <MapPin className="h-3 w-3" /> {poi.distanceM} m
        </span>
        <span className="frosted rounded-full border border-border px-3 py-1.5 inline-flex items-center gap-1">
          <Clock className="h-3 w-3" /> {poi.walkMin} Min Fußweg
        </span>
        <span className={`rounded-full px-3 py-1.5 ${fitsTimeslot ? "bg-success/15 text-success" : "bg-warning/20 text-foreground"}`}>
          {fitsTimeslot ? `Passt in ${formatTimeslotLabel(ctx.timeslotMin)}` : `Knapp für ${formatTimeslotLabel(ctx.timeslotMin)}`}
        </span>
        <span className="frosted rounded-full border border-border px-3 py-1.5">{"€".repeat(poi.priceLevel)}</span>
      </div>

      {offer && (
        <div className="space-y-2 rounded-[var(--radius)] glass p-4">
          <p className="text-sm font-medium">{offer.emotional}</p>
          <p className="text-xs text-muted-foreground">{offer.factual}</p>
        </div>
      )}

      <div className="flex gap-2">
        {offer ? (
          <Link
            to={`/redeem?token=${offer.token}&poi=${poi.id}&pct=${offer.discountPct}`}
            className="flex-1 inline-flex items-center justify-center rounded-full sunset-bg px-5 py-3 text-sm font-semibold text-primary-foreground glow"
          >
            Einlösen
          </Link>
        ) : (
          <Button asChild className="flex-1 sunset-bg text-primary-foreground border-0">
            <Link to="/redeem">QR scannen</Link>
          </Button>
        )}
        <a
          href={mapsLink(poi.location.lat, poi.location.lng, poi.name)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold"
        >
          Route
        </a>
      </div>
    </div>
  );
}
