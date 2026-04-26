import { CheckCircle2, AlertTriangle } from "lucide-react";

const rules = [
  { id: "rule-01", title: "Max discount 30%", detail: "Offers must not exceed the maximum discount.", ok: true },
  { id: "rule-02", title: "Minimum duration 30 min", detail: "Each offer must be available for at least 30 minutes.", ok: true },
  { id: "rule-03", title: "No overlapping slots", detail: "Time windows for the same audience must not overlap.", ok: false },
];

export default function MerchantRules() {
  return (
    <div className="space-y-4">
      <section className="glass rounded-[var(--radius)] p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Rules</p>
        <h2 className="mt-1 text-xl font-bold">
          <span className="sunset-text">Rules</span>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review rules before activating new offers.
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
