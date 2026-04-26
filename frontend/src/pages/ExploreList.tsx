import { useMemo, useState } from "react";
import { POIS, categoryMeta, type Category } from "@/mocks/pois";
import { recommend } from "@/lib/recommend";
import { loadPrefs } from "@/lib/prefs";
import { useContextSignals } from "@/lib/context-api";
import { formatTimeslotLabel } from "@/lib/timeslot";
import { useCustomerPois } from "@/lib/customer-pois";
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

  const ctx = useContextSignals(prefs.defaultTimeslot);
  const basePois = ctx.livePois.length > 0 ? ctx.livePois : POIS;
  const sourcePois = useCustomerPois(basePois);

  const items = useMemo(() => {
    const filtered = cat === "all" ? sourcePois : sourcePois.filter((p) => p.category === cat);
    let recs = recommend(filtered, ctx, prefs);
    if (onlyFits) recs = recs.filter((r) => r.fitsTimeslot);
    if (sort === "distance") recs = [...recs].sort((a, b) => a.poi.distanceM - b.poi.distanceM);
    if (sort === "open") recs = [...recs].sort((a, b) => Number(b.poi.openNow) - Number(a.poi.openNow));
    return recs;
  }, [cat, sort, onlyFits, sourcePois, ctx, prefs]);

  const cats: Array<Category | "all"> = ["all", "food", "events", "markets", "museums", "shopping"];

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold"><span className="sunset-text">Explore</span> your city</h1>
        <p className="text-xs text-muted-foreground">
          {items.length} picks · window {formatTimeslotLabel(ctx.timeslotMin)}
        </p>
      </header>

      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex gap-2">
          {cats.map((c) => {
            const active = c === cat;
            const label = c === "all" ? "All" : `${categoryMeta[c].emoji} ${categoryMeta[c].label}`;
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
            {s === "relevance" ? "Relevance" : s === "distance" ? "Distance" : "Open now"}
          </Button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <Switch id="fits" checked={onlyFits} onCheckedChange={setOnlyFits} />
          <Label htmlFor="fits" className="text-xs">Fits time window</Label>
        </div>
      </div>

      <div className="grid gap-3">
        {items.map((r) => (
          <OfferCard key={r.poi.id} rec={r} />
        ))}
        {items.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-12">Nothing fits — loosen filters?</p>
        )}
      </div>
    </div>
  );
}
