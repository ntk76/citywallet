import { useState } from "react";
import { categoryMeta, type Category } from "@/mocks/pois";
import { DEFAULT_PREFS, loadPrefs, savePrefs, type Diet, type Preferences } from "@/lib/prefs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Preferences() {
  const [p, setP] = useState<Preferences>(() => loadPrefs());

  const update = (patch: Partial<Preferences>) => setP((cur) => ({ ...cur, ...patch }));
  const updateWeight = (c: Category, v: number) =>
    setP((cur) => ({ ...cur, weights: { ...cur.weights, [c]: v } }));

  const save = () => {
    savePrefs(p);
    toast.success("Präferenzen gespeichert");
  };
  const reset = () => {
    setP(DEFAULT_PREFS);
    savePrefs(DEFAULT_PREFS);
    toast("Auf Standard zurückgesetzt");
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold"><span className="sunset-text">Profil</span></h1>
        <p className="text-xs text-muted-foreground">Lokal gespeichert. Kein Tracking.</p>
      </header>

      <section className="space-y-3 glass rounded-[var(--radius)] p-4">
        <h2 className="font-semibold">Kategorien</h2>
        {(Object.keys(categoryMeta) as Category[]).map((c) => (
          <div key={c} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>{categoryMeta[c].emoji} {categoryMeta[c].label}</span>
              <span className="text-xs text-muted-foreground">{Math.round((p.weights[c] ?? 0) * 100)}%</span>
            </div>
            <Slider
              value={[(p.weights[c] ?? 0) * 100]}
              max={100}
              step={5}
              onValueChange={(v) => updateWeight(c, v[0] / 100)}
            />
          </div>
        ))}
      </section>

      <section className="space-y-3 glass rounded-[var(--radius)] p-4">
        <h2 className="font-semibold">Budget & Reichweite</h2>
        <div>
          <div className="flex items-center justify-between text-sm">
            <span>Budget-Level</span><span className="text-xs text-muted-foreground">{"€".repeat(p.budget)}</span>
          </div>
          <Slider value={[p.budget]} min={1} max={3} step={1} onValueChange={(v) => update({ budget: v[0] as 1|2|3 })} />
        </div>
        <div>
          <div className="flex items-center justify-between text-sm">
            <span>Radius</span><span className="text-xs text-muted-foreground">{p.radiusM} m</span>
          </div>
          <Slider value={[p.radiusM]} min={300} max={5000} step={100} onValueChange={(v) => update({ radiusM: v[0] })} />
        </div>
      </section>

      <section className="space-y-3 glass rounded-[var(--radius)] p-4">
        <h2 className="font-semibold">Vorlieben</h2>
        <div className="space-y-2">
          <Label className="text-xs">Ernährung</Label>
          <div className="flex flex-wrap gap-2">
            {(["none","vegetarian","vegan","glutenfree"] as Diet[]).map((d) => (
              <Button
                key={d}
                size="sm"
                variant={p.diet === d ? "default" : "outline"}
                onClick={() => update({ diet: d })}
                className={`rounded-full ${p.diet === d ? "sunset-bg text-primary-foreground border-0" : ""}`}
              >
                {d === "none" ? "Egal" : d === "vegetarian" ? "Vegetarisch" : d === "vegan" ? "Vegan" : "Glutenfrei"}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="indoor" className="text-sm">Indoor bei Regen bevorzugen</Label>
          <Switch id="indoor" checked={p.indoorWhenRain} onCheckedChange={(v) => update({ indoorWhenRain: v })} />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Standard-Zeitfenster</Label>
          <div className="flex gap-2">
            {[15, 30, 60].map((s) => (
              <Button
                key={s}
                size="sm"
                variant={p.defaultTimeslot === s ? "default" : "outline"}
                onClick={() => update({ defaultTimeslot: s as 15|30|60 })}
                className={`rounded-full ${p.defaultTimeslot === s ? "sunset-bg text-primary-foreground border-0" : ""}`}
              >
                {s} Min
              </Button>
            ))}
          </div>
        </div>
      </section>

      <div className="flex gap-2">
        <Button onClick={save} className="flex-1 sunset-bg text-primary-foreground border-0">Speichern</Button>
        <Button onClick={reset} variant="outline">Reset</Button>
      </div>
    </div>
  );
}
