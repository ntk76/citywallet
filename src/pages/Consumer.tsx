import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Cloud, Clock, MapPin, Sparkles, RefreshCw } from "lucide-react";
import PageShell from "@/components/PageShell";
import PrivacyBanner from "@/components/PrivacyBanner";
import {
  readContext,
  WEATHER_LABEL,
  WEATHER_EMOJI,
  DAYPART_LABEL,
} from "@/lib/context";
import { generateOffer, type GenerativeOffer } from "@/lib/offer";
import { loadRules } from "@/lib/merchant";
import { saveRedemption } from "@/lib/redeem";

export default function Consumer() {
  const [tick, setTick] = useState(0);
  const ctx = useMemo(() => readContext(), [tick]);
  const rules = useMemo(() => loadRules(), [tick]);
  const [offer, setOffer] = useState<GenerativeOffer | null>(null);

  useEffect(() => {
    const o = generateOffer(ctx, rules);
    setOffer(o);
    saveRedemption({
      token: o.token,
      product: o.product,
      discountPct: o.discountPct,
      merchantName: rules.merchantName,
      intentTag: o.intentTag,
      createdAt: Date.now(),
      status: "pending",
    });
  }, [ctx, rules]);

  return (
    <PageShell
      title="Wallet"
      rightSlot={
        <button
          onClick={() => setTick((t) => t + 1)}
          aria-label="Neu generieren"
          className="w-10 h-10 rounded-xl glass grid place-items-center hover:border-primary/40 transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      }
    >
      {/* Context chips */}
      <section className="mb-5">
        <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-muted-foreground mb-2">
          Live-Kontext
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip icon={<Clock className="w-3.5 h-3.5" />}>
            {DAYPART_LABEL[ctx.dayPart]} ·{" "}
            {ctx.now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
          </Chip>
          <Chip icon={<Cloud className="w-3.5 h-3.5" />}>
            {WEATHER_EMOJI[ctx.weather]} {WEATHER_LABEL[ctx.weather]} · {ctx.temperatureC}°C
          </Chip>
          <Chip icon={<MapPin className="w-3.5 h-3.5" />}>{ctx.neighborhood}</Chip>
        </div>
      </section>

      {/* Generative Offer */}
      {offer && (
        <article className="glass rounded-3xl p-6 mb-5 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full aurora-bg opacity-20 blur-3xl" />
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg aurora-bg grid place-items-center">
              <Sparkles className="w-3.5 h-3.5 text-background" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-primary">
              Generativ · {rules.merchantName}
            </span>
          </div>

          <h2 className="text-2xl font-bold leading-tight mb-2">{offer.title}</h2>
          <p className="text-muted-foreground text-sm mb-5">{offer.body}</p>

          <div className="flex items-end gap-3 mb-5">
            <div className="text-6xl font-bold aurora-text leading-none">
              {offer.discountPct}%
            </div>
            <div className="pb-1">
              <div className="text-xs text-muted-foreground">auf</div>
              <div className="text-sm font-semibold">{offer.product}</div>
            </div>
          </div>

          <div className="space-y-1.5 mb-6">
            {offer.reason.map((r, i) => (
              <div key={i} className="flex gap-2 items-center text-xs text-muted-foreground">
                <span className="w-1 h-1 rounded-full bg-primary" />
                <span className="font-mono">{r}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono mb-4">
            <span>
              gültig bis{" "}
              {offer.validUntil.toLocaleTimeString("de-DE", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span>intent: {offer.intentTag}</span>
          </div>

          <Link
            to={`/redeem/${offer.token}`}
            className="block w-full text-center aurora-bg text-background font-semibold py-4 rounded-2xl glow pulse-ring"
          >
            Jetzt einlösen
          </Link>
        </article>
      )}

      <PrivacyBanner />
    </PageShell>
  );
}

function Chip({ children, icon }: { children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <span className="glass rounded-full px-3 py-1.5 text-xs flex items-center gap-1.5 font-mono">
      {icon}
      {children}
    </span>
  );
}
