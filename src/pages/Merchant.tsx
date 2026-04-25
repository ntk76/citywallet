import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import { loadRules, saveRules, computeKPIs } from "@/lib/merchant";
import type { MerchantRules, GoalKind } from "@/lib/offer";
import { listRedemptions } from "@/lib/redeem";
import { Save, TrendingUp, Eye, MousePointerClick, Euro } from "lucide-react";

const GOALS: { value: GoalKind; label: string }[] = [
  { value: "footfall", label: "Mehr Besuche" },
  { value: "clear_stock", label: "Lager räumen" },
  { value: "reward_loyal", label: "Stammkunden" },
  { value: "new_customers", label: "Neukunden" },
];

const CATEGORIES: MerchantRules["category"][] = [
  "cafe",
  "bakery",
  "restaurant",
  "bookstore",
  "boutique",
];

const TRIGGER_LABELS: Record<keyof MerchantRules["triggers"], string> = {
  rainy: "Regen",
  morning: "Morgens",
  evening: "Abends",
  cold: "Kälte",
  hot: "Hitze",
};

export default function Merchant() {
  const [rules, setRules] = useState<MerchantRules>(loadRules());
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [redeemedCount, setRedeemedCount] = useState(0);

  useEffect(() => {
    setRedeemedCount(listRedemptions().filter((r) => r.status === "redeemed").length);
  }, []);

  const kpis = computeKPIs(rules, redeemedCount);

  function update<K extends keyof MerchantRules>(k: K, v: MerchantRules[K]) {
    setRules((r) => ({ ...r, [k]: v }));
  }

  function toggleTrigger(key: keyof MerchantRules["triggers"]) {
    setRules((r) => ({ ...r, triggers: { ...r.triggers, [key]: !r.triggers[key] } }));
  }

  function handleSave() {
    saveRules(rules);
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 1800);
  }

  return (
    <PageShell title="Merchant Console">
      {/* KPIs */}
      <section className="mb-6">
        <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-muted-foreground mb-2 flex items-center gap-2">
          <TrendingUp className="w-3 h-3" /> Performance · 24h
        </div>
        <div className="grid grid-cols-2 gap-3">
          <KPI icon={<Eye className="w-4 h-4" />} label="Impressions" value={kpis.impressions.toString()} />
          <KPI
            icon={<MousePointerClick className="w-4 h-4" />}
            label="Redemptions"
            value={kpis.redemptions.toString()}
          />
          <KPI label="CTR" value={`${kpis.ctrPct}%`} accent />
          <KPI icon={<Euro className="w-4 h-4" />} label="Umsatz" value={`€${kpis.revenueEUR}`} />
        </div>
      </section>

      {/* Rules form */}
      <section className="glass rounded-2xl p-5 space-y-5">
        <div>
          <Label>Händlername</Label>
          <input
            value={rules.merchantName}
            onChange={(e) => update("merchantName", e.target.value)}
            className="w-full bg-muted/40 rounded-xl px-3 py-2.5 text-sm border border-border focus:border-primary outline-none transition"
          />
        </div>

        <div>
          <Label>Kategorie</Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <PillButton
                key={c}
                active={rules.category === c}
                onClick={() => update("category", c)}
              >
                {c}
              </PillButton>
            ))}
          </div>
        </div>

        <div>
          <Label>Highlight-Produkt</Label>
          <input
            value={rules.highlightProduct}
            onChange={(e) => update("highlightProduct", e.target.value)}
            className="w-full bg-muted/40 rounded-xl px-3 py-2.5 text-sm border border-border focus:border-primary outline-none transition"
          />
        </div>

        <div>
          <Label>Ziel</Label>
          <div className="grid grid-cols-2 gap-2">
            {GOALS.map((g) => (
              <PillButton key={g.value} active={rules.goal === g.value} onClick={() => update("goal", g.value)}>
                {g.label}
              </PillButton>
            ))}
          </div>
        </div>

        <div>
          <Label>
            Rabatt-Spanne: {rules.minDiscountPct}% – {rules.maxDiscountPct}%
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <RangeField
              label="min"
              value={rules.minDiscountPct}
              max={rules.maxDiscountPct}
              onChange={(v) => update("minDiscountPct", v)}
            />
            <RangeField
              label="max"
              value={rules.maxDiscountPct}
              max={50}
              onChange={(v) => update("maxDiscountPct", Math.max(v, rules.minDiscountPct))}
            />
          </div>
        </div>

        <div>
          <Label>Kontext-Trigger</Label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(rules.triggers) as Array<keyof MerchantRules["triggers"]>).map((k) => (
              <PillButton key={k} active={rules.triggers[k]} onClick={() => toggleTrigger(k)}>
                {TRIGGER_LABELS[k]}
              </PillButton>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full aurora-bg text-background font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 glow"
        >
          <Save className="w-4 h-4" />
          {savedAt ? "Gespeichert ✓" : "Regeln speichern"}
        </button>
      </section>
    </PageShell>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-[0.18em] font-mono text-muted-foreground mb-2">
      {children}
    </div>
  );
}

function PillButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-mono border transition ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-muted/30 text-muted-foreground border-border hover:border-primary/40"
      }`}
    >
      {children}
    </button>
  );
}

function RangeField({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="flex justify-between text-[10px] font-mono text-muted-foreground mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </label>
  );
}

function KPI({
  icon,
  label,
  value,
  accent,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-mono text-muted-foreground mb-2">
        {icon}
        {label}
      </div>
      <div className={`text-2xl font-bold ${accent ? "aurora-text" : ""}`}>{value}</div>
    </div>
  );
}
