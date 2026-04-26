import { useMemo, useState } from "react";
import { POIS, categoryMeta, type Category } from "@/mocks/pois";
import { recommend } from "@/lib/recommend";
import { loadPrefs } from "@/lib/prefs";
import { useBackendContextData } from "@/lib/context-api";
import { OfferCard } from "@/components/wallet/OfferCard";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type Sort = "relevance" | "distance" | "open";

export default function ExploreList() {
  const prefs = useMemo(() => loadPrefs(), []);
  const [cat, setCat] = useState<Category | "all">("all");
  const [sort, setSort] = useState<Sort>("relevance");
  const [onlyFits, setOnlyFits] = useState(false);

  const { context: ctx, events, eventsMeta, isLoading } = useBackendContextData(prefs.defaultTimeslot);

  const items = useMemo(() => {
    const filtered = cat === "all" ? POIS : POIS.filter((p) => p.category === cat);
    let recs = recommend(filtered, ctx, prefs);
    if (onlyFits) recs = recs.filter((r) => r.fitsTimeslot);
    if (sort === "distance") recs = [...recs].sort((a, b) => a.poi.distanceM - b.poi.distanceM);
    if (sort === "open") recs = [...recs].sort((a, b) => Number(b.poi.openNow) - Number(a.poi.openNow));
    return recs;
  }, [cat, sort, onlyFits, ctx, prefs]);

  const cats: Array<Category | "all"> = ["all", "food", "events", "markets", "museums", "shopping"];

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold"><span className="sunset-text">Erkunde</span> deine Stadt</h1>
        <p className="text-xs text-muted-foreground">{items.length} Vorschläge · {ctx.timeslotMin} Min Fenster</p>
      </header>

      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex gap-2">
          {cats.map((c) => {
            const active = c === cat;
            const label = c === "all" ? "Alle" : `${categoryMeta[c].emoji} ${categoryMeta[c].label}`;
            return (
              <Button
                key={c}
                size="sm"
                variant={active ? "default" : "outline"}
                onClick={() => setCat(c)}
                className={`shrink-0 rounded-full ${active ? "sunset-bg text-primary-foreground border-0" : ""}`}
              >
                {label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["relevance", "distance", "open"] as Sort[]).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={sort === s ? "secondary" : "ghost"}
            onClick={() => setSort(s)}
            className="rounded-full"
          >
            {s === "relevance" ? "Relevanz" : s === "distance" ? "Nähe" : "Geöffnet"}
          </Button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <Switch id="fits" checked={onlyFits} onCheckedChange={setOnlyFits} />
          <Label htmlFor="fits" className="text-xs">Passt ins Fenster</Label>
        </div>
      </div>

      <div className="grid gap-3">
        {items.map((r) => (
          <OfferCard key={r.poi.id} rec={r} />
        ))}
        {items.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-12">Nichts passt — Filter lockern?</p>
        )}
      </div>

      <section className="space-y-2 rounded-[var(--radius)] border border-border p-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Backend Events</h2>
          <span className="text-[11px] text-muted-foreground">
            {eventsMeta.source} {eventsMeta.cacheHit ? "(Cache)" : "(Live)"}
          </span>
        </div>
        {isLoading && <p className="text-xs text-muted-foreground">Lade Events...</p>}
        {!isLoading && events.length === 0 && <p className="text-xs text-muted-foreground">Keine Events verfügbar.</p>}
        {events.map((event) => (
          <a
            key={event.url}
            href={event.url}
            target="_blank"
            rel="noreferrer"
            className="block rounded-lg border border-border px-3 py-2 hover:border-primary/40"
          >
            <p className="text-sm font-medium leading-snug">{event.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{event.snippet}</p>
          </a>
        ))}
      </section>
    </div>
  );
}
