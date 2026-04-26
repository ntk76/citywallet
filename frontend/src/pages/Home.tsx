import { useMemo, useState } from "react";
import { POIS } from "@/mocks/pois";
import { recommend } from "@/lib/recommend";
import { loadPrefs } from "@/lib/prefs";
import { useContextSignals } from "@/lib/context-api";
import { OfferCard } from "@/components/wallet/OfferCard";
import { ContextTopBar } from "@/components/wallet/ContextTopBar";
import { PrivacyBanner } from "@/components/wallet/PrivacyBanner";
import { Link } from "react-router-dom";
import { normalizeTimeslot, type TimeslotMinutes } from "@/lib/timeslot";

export default function Home() {
  const prefs = useMemo(() => loadPrefs(), []);
  const [slot, setSlot] = useState<TimeslotMinutes>(() => normalizeTimeslot(prefs.defaultTimeslot));
  const ctx = useContextSignals(slot);
  const sourcePois = ctx.livePois.length > 0 ? ctx.livePois : POIS;
  const recs = useMemo(() => recommend(sourcePois, ctx, prefs), [sourcePois, ctx, prefs]);
  const top = recs[0];
  const rest = recs.slice(1, 4);
  const topEvent = ctx.events[0];
  const moreEvents = ctx.events.slice(1, 3);

  return (
    <div className="space-y-5">
      <ContextTopBar ctx={ctx} slot={slot} onSlotChange={setSlot} />

      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">City Wallet</p>
        <h1 className="text-3xl font-bold leading-tight">
          <span className="sunset-text">Was passt</span> gerade?
        </h1>
      </header>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">Events heute</h2>
          <span
            className={`text-[11px] rounded-full px-2 py-0.5 ${
              ctx.eventsSource === "tavily" ? "bg-success/15 text-success" : "bg-warning/20 text-foreground"
            }`}
          >
            {ctx.eventsSource === "tavily" ? "Quelle: Tavily" : "Quelle: Fallback"}
          </span>
        </div>

        {topEvent ? (
          <a
            href={topEvent.url}
            target="_blank"
            rel="noreferrer"
            className="group block overflow-hidden rounded-[var(--radius)] glass transition hover:translate-y-[-2px] hover:glow"
          >
            <div className="relative h-36 dusk-bg" />
            <div className="space-y-2 p-4">
              <h2 className="text-2xl font-bold leading-tight">{topEvent.title}</h2>
              <p className="text-sm text-muted-foreground line-clamp-2">{topEvent.snippet}</p>
              <span className="inline-flex items-center justify-center rounded-full sunset-bg px-5 py-2.5 text-sm font-semibold text-primary-foreground glow">
                Zum Event →
              </span>
            </div>
          </a>
        ) : (
          <p className="text-xs text-muted-foreground">Keine Eventdaten verfuegbar.</p>
        )}

        {moreEvents.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {moreEvents.map((event) => (
              <a
                key={event.url}
                href={event.url}
                target="_blank"
                rel="noreferrer"
                className="block glass rounded-[var(--radius)] p-3 transition hover:translate-y-[-1px]"
              >
                <p className="text-sm font-semibold leading-snug line-clamp-2">{event.title}</p>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{event.snippet}</p>
              </a>
            ))}
          </div>
        )}
      </section>

      {top && <OfferCard rec={top} big />}

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">Auch in deinem Fenster</h2>
          <Link to="/explore/list" className="text-xs font-medium text-primary hover:underline">
            Alles ansehen →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {rest.map((r) => (
            <OfferCard key={r.poi.id} rec={r} />
          ))}
        </div>
      </section>

      <PrivacyBanner />
    </div>
  );
}
