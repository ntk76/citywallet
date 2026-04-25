import { CheckCircle2, AlertTriangle } from "lucide-react";

const rules = [
  { id: "rule-01", title: "Rabatt max. 30%", detail: "Offers dürfen den Maximalrabatt nicht überschreiten.", ok: true },
  { id: "rule-02", title: "Mindestlaufzeit 30 Min", detail: "Jedes Angebot muss mindestens 30 Minuten verfügbar sein.", ok: true },
  { id: "rule-03", title: "Keine doppelten Slots", detail: "Zeitfenster für dieselbe Zielgruppe dürfen sich nicht überschneiden.", ok: false },
];

export default function MerchantRules() {
  return (
    <div className="space-y-4">
      <section className="glass rounded-[var(--radius)] p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Rules</p>
        <h2 className="mt-1 text-xl font-bold">
          <span className="sunset-text">Regelwerk</span>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Prüfe Regeln vor der Aktivierung neuer Offers.
        </p>
      </section>

      <section className="space-y-3">
        {rules.map((rule) => (
          <article key={rule.id} className="glass rounded-[var(--radius)] p-4">
            <div className="flex items-start gap-3">
              {rule.ok ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 text-warning" />
              )}
              <div>
                <h3 className="text-sm font-semibold">{rule.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{rule.detail}</p>
                <p className="mt-2 text-[11px] text-muted-foreground">{rule.id}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
