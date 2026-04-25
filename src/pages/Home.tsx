import { useMemo, useState } from "react";
import { fetchContext } from "@/mocks/context";
import { POIS } from "@/mocks/pois";
import { recommend } from "@/lib/recommend";
import { loadPrefs } from "@/lib/prefs";
import { OfferCard } from "@/components/wallet/OfferCard";
import { ContextStrip } from "@/components/wallet/ContextStrip";
import { TimeslotSelector } from "@/components/wallet/TimeslotSelector";
import { PrivacyBanner } from "@/components/wallet/PrivacyBanner";
import { Link } from "react-router-dom";

export default function Home() {
  const prefs = useMemo(() => loadPrefs(), []);
  const [slot, setSlot] = useState<15 | 30 | 60>(prefs.defaultTimeslot);
  const ctx = useMemo(() => ({ ...fetchContext(slot), timeslotMin: slot }), [slot]);
  const recs = useMemo(() => recommend(POIS, ctx, prefs), [ctx, prefs]);
  const top = recs[0];
  const rest = recs.slice(1, 4);

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">City Wallet</p>
        <h1 className="text-3xl font-bold leading-tight">
          <span className="sunset-text">Was passt</span> gerade?
        </h1>
      </header>

      <ContextStrip ctx={ctx} />
      <TimeslotSelector value={slot} onChange={setSlot} />

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
