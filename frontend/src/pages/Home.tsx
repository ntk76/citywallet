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
import { useCustomerPois } from "@/lib/customer-pois";

export default function Home() {
  const prefs = useMemo(() => loadPrefs(), []);
  const [slot, setSlot] = useState<TimeslotMinutes>(() => normalizeTimeslot(prefs.defaultTimeslot));
  const ctx = useContextSignals(slot);
  const basePois = ctx.livePois.length > 0 ? ctx.livePois : POIS;
  const sourcePois = useCustomerPois(basePois);
  const recs = useMemo(() => recommend(sourcePois, ctx, prefs), [sourcePois, ctx, prefs]);
  const top = recs[0];
  const rest = recs.slice(1, 4);
  const topEvent = ctx.events[0];
  const moreEvents = ctx.events.slice(1, 3);
  const dining = ctx.dining.slice(0, 4);

  return (
    <div className="space-y-5">
      <ContextTopBar ctx={ctx} slot={slot} onSlotChange={setSlot} />

      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">City Wallet</p>
        <h1 className="text-3xl font-bold leading-tight">
          <span className="sunset-text">What fits</span> right now?
        </h1>
      </header>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">Events today</h2>
          <span
            className={`text-[11px] rounded-full px-2 py-0.5 ${
              ctx.eventsSource === "tavily" ? "bg-success/15 text-success" : "bg-warning/20 text-foreground"
            }`}
          >
            {ctx.eventsSource === "tavily" ? "Source: Tavily" : "Source: fallback"}
          </span>
        </div>

        {topEvent ? (
          <a
            href={topEvent.url}
            target="_blank"
            rel="noreferrer"
            className="group block overflow-hidden rounded-[var(--radius)] glass transition hover:translate-y-[-2px] hover:glow"
          >
            <div
              className={`relative h-36 ${topEvent.imageUrl ? "" : "dusk-bg"}`}
              style={
                topEvent.imageUrl
                  ? {
                      backgroundImage: `linear-gradient(to top, rgba(15,15,20,0.92) 0%, rgba(15,15,20,0.35) 55%, rgba(15,15,20,0.2) 100%), url(${topEvent.imageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            />
            <div className="space-y-2 p-4">
              <h2 className="text-2xl font-bold leading-tight">{topEvent.title}</h2>
              <p className="text-sm text-muted-foreground line-clamp-2">{topEvent.snippet}</p>
              <span className="inline-flex items-center justify-center rounded-full sunset-bg px-5 py-2.5 text-sm font-semibold text-primary-foreground glow">
                Go to event →
              </span>
            </div>
          </a>
        ) : (
          <p className="text-xs text-muted-foreground">No event data available.</p>
        )}

        {moreEvents.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {moreEvents.map((event) => (
              <a
                key={event.url}
                href={event.url}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden glass rounded-[var(--radius)] transition hover:translate-y-[-1px]"
              >
                {event.imageUrl ? (
                  <div
                    className="h-20 w-full bg-muted"
                    style={{
                      backgroundImage: `linear-gradient(to top, rgba(15,15,20,0.85), rgba(15,15,20,0.2)), url(${event.imageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                ) : (
                  <div className="h-12 dusk-bg opacity-90" />
                )}
                <div className="p-3 pt-2">
                  <p className="text-sm font-semibold leading-snug line-clamp-2">{event.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{event.snippet}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {dining.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">Food & drink nearby</h2>
            <span
              className={`text-[11px] rounded-full px-2 py-0.5 ${
                ctx.diningSource === "tavily" ? "bg-success/15 text-success" : "bg-warning/20 text-foreground"
              }`}
            >
              {ctx.diningSource === "tavily" ? "Source: Tavily" : "Source: fallback"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {dining.map((place) => (
              <a
                key={place.url}
                href={place.url}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden glass rounded-[var(--radius)] transition hover:translate-y-[-1px]"
              >
                {place.imageUrl ? (
                  <div
                    className="h-16 w-full bg-muted"
                    style={{
                      backgroundImage: `linear-gradient(to top, rgba(15,15,20,0.88), rgba(15,15,20,0.2)), url(${place.imageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                ) : (
                  <div className="h-10 dusk-bg opacity-90" />
                )}
                <div className="p-3 pt-2">
                  <p className="text-sm font-semibold leading-snug line-clamp-2">{place.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{place.snippet}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {top && <OfferCard rec={top} big />}

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">Also in your window</h2>
          <Link to="/explore/list" className="text-xs font-medium text-primary hover:underline">
            View all →
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
