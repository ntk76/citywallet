import { useEffect, useMemo, useState } from "react";
import { Plus, PauseCircle, PlayCircle } from "lucide-react";
import { POIS } from "@/mocks/pois";
import {
  createMerchantOffer,
  listMerchantOffers,
  toggleMerchantOffer,
  type MerchantOffer,
} from "@/lib/merchant-offers";

export default function MerchantOffers() {
  const [items, setItems] = useState<MerchantOffer[]>([]);
  const [poiId, setPoiId] = useState(POIS[0]?.id ?? "");
  const [headline, setHeadline] = useState("20% auf ausgewählte Artikel");
  const [discountPct, setDiscountPct] = useState(20);
  const [validForMin, setValidForMin] = useState(30);

  const poiMap = useMemo(() => new Map(POIS.map((poi) => [poi.id, poi])), []);

  useEffect(() => {
    const refresh = () => setItems(listMerchantOffers());
    refresh();
    window.addEventListener("merchant-offers-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("merchant-offers-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  function onCreateOffer() {
    const poi = poiMap.get(poiId);
    if (!poi) return;
    createMerchantOffer({
      poiId,
      headline,
      emotional: `Nur für kurze Zeit bei ${poi.name}.`,
      factual: `${discountPct}% bei ${poi.name} · ${poi.distanceM} m`,
      discountPct,
      validForMin,
      active: true,
    });
  }

  return (
    <div className="space-y-4">
      <section className="glass flex items-center justify-between rounded-[var(--radius)] p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Offers</p>
          <h2 className="text-xl font-bold">Angebote</h2>
        </div>
        <button
          onClick={onCreateOffer}
          className="inline-flex items-center gap-1 rounded-full sunset-bg px-3 py-2 text-xs font-semibold text-primary-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Erstellen
        </button>
      </section>

      <section className="glass space-y-3 rounded-[var(--radius)] p-4">
        <h3 className="text-sm font-semibold">Neues Angebot</h3>
        <label className="grid gap-1 text-xs">
          Standort
          <select
            value={poiId}
            onChange={(e) => setPoiId(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {POIS.map((poi) => (
              <option key={poi.id} value={poi.id}>
                {poi.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs">
          Headline
          <input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="grid gap-1 text-xs">
            Rabatt %
            <input
              type="number"
              min={5}
              max={70}
              value={discountPct}
              onChange={(e) => setDiscountPct(Number(e.target.value))}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="grid gap-1 text-xs">
            Gültig (Min)
            <input
              type="number"
              min={10}
              max={180}
              value={validForMin}
              onChange={(e) => setValidForMin(Number(e.target.value))}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
        </div>
      </section>

      <section className="space-y-3">
        {items.map((offer) => {
          const paused = !offer.active;
          const poiName = poiMap.get(offer.poiId)?.name ?? offer.poiId;
          return (
            <article key={offer.id} className="glass rounded-[var(--radius)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">{offer.headline}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {poiName} · {offer.discountPct}% · {offer.validForMin} Min
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-[11px] ${
                    paused ? "bg-warning/20 text-foreground" : "bg-success/15 text-success"
                  }`}
                >
                  {paused ? "Pausiert" : "Aktiv"}
                </span>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => toggleMerchantOffer(offer.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs"
                >
                  {paused ? <PlayCircle className="h-3.5 w-3.5" /> : <PauseCircle className="h-3.5 w-3.5" />}
                  {paused ? "Fortsetzen" : "Pausieren"}
                </button>
              </div>
            </article>
          );
        })}
        {items.length === 0 && (
          <p className="rounded-[var(--radius)] border border-dashed border-border p-4 text-sm text-muted-foreground">
            Noch keine Merchant-Angebote erstellt.
          </p>
        )}
      </section>
    </div>
  );
}
