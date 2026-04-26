import { useState } from "react";
import { categoryMeta, type Category } from "@/mocks/pois";
import {
  DEFAULT_PREFS,
  loadPrefs,
  savePrefs,
  type Diet,
  type PaymentProfile,
  type Preferences,
  type PaymentMethod,
} from "@/lib/prefs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { TIMESLOT_OPTIONS, type TimeslotMinutes } from "@/lib/timeslot";

export default function Preferences() {
  const [p, setP] = useState<Preferences>(() => loadPrefs());
  const [profileLabel, setProfileLabel] = useState("Mein Wallet");
  const [profileMethod, setProfileMethod] = useState<PaymentMethod>(p.preferredPaymentMethod);
  const [profileDetails, setProfileDetails] = useState("");
  const paymentOptions: Array<{ id: PaymentMethod; label: string }> = [
    { id: "applepay", label: "Apple Pay" },
    { id: "googlepay", label: "Google Pay" },
    { id: "paypal", label: "PayPal" },
    { id: "card", label: "Kreditkarte" },
    { id: "cash", label: "Bar vor Ort" },
  ];

  const update = (patch: Partial<Preferences>) => setP((cur) => ({ ...cur, ...patch }));
  const updateWeight = (c: Category, v: number) =>
    setP((cur) => ({ ...cur, weights: { ...cur.weights, [c]: v } }));
  const togglePaymentMethod = (method: PaymentMethod, checked: boolean) =>
    setP((cur) => {
      const next = checked
        ? Array.from(new Set([...cur.paymentMethods, method]))
        : cur.paymentMethods.filter((m) => m !== method);

      const safeNext: PaymentMethod[] = (next.length > 0 ? next : ["cash"]) as PaymentMethod[];
      const preferred = safeNext.includes(cur.preferredPaymentMethod)
        ? cur.preferredPaymentMethod
        : safeNext[0];

      return { ...cur, paymentMethods: safeNext, preferredPaymentMethod: preferred };
    });
  const addPaymentProfile = () =>
    setP((cur) => {
      const profile: PaymentProfile = {
        id: `pp-${Math.random().toString(36).slice(2, 10)}`,
        method: profileMethod,
        label: profileLabel.trim() || "Zahlprofil",
        details: profileDetails.trim() || undefined,
      };
      const nextProfiles = [profile, ...cur.paymentProfiles];
      return {
        ...cur,
        paymentProfiles: nextProfiles,
        preferredPaymentProfileId: cur.preferredPaymentProfileId ?? profile.id,
      };
    });
  const removePaymentProfile = (id: string) =>
    setP((cur) => {
      const nextProfiles = cur.paymentProfiles.filter((profile) => profile.id !== id);
      return {
        ...cur,
        paymentProfiles: nextProfiles,
        preferredPaymentProfileId:
          cur.preferredPaymentProfileId === id ? nextProfiles[0]?.id : cur.preferredPaymentProfileId,
      };
    });

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
          <div className="flex flex-wrap gap-2">
            {TIMESLOT_OPTIONS.map(({ value: s, label }) => (
              <Button
                key={s}
                size="sm"
                variant={p.defaultTimeslot === s ? "default" : "outline"}
                onClick={() => update({ defaultTimeslot: s as TimeslotMinutes })}
                className={`rounded-full ${p.defaultTimeslot === s ? "sunset-bg text-primary-foreground border-0" : ""}`}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-3 glass rounded-[var(--radius)] p-4">
        <h2 className="font-semibold">Bezahlen in der App</h2>
        <p className="text-xs text-muted-foreground">
          Wähle, welche Zahlungsmethoden dir beim Checkout angeboten werden.
        </p>
        <div className="space-y-2">
          {paymentOptions.map((option) => (
            <div key={option.id} className="flex items-center justify-between">
              <Label htmlFor={`pay-${option.id}`} className="text-sm">
                {option.label}
              </Label>
              <Switch
                id={`pay-${option.id}`}
                checked={p.paymentMethods.includes(option.id)}
                onCheckedChange={(v) => togglePaymentMethod(option.id, v)}
              />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Standard-Zahlungsart</Label>
          <div className="flex flex-wrap gap-2">
            {paymentOptions
              .filter((option) => p.paymentMethods.includes(option.id))
              .map((option) => (
                <Button
                  key={option.id}
                  size="sm"
                  variant={p.preferredPaymentMethod === option.id ? "default" : "outline"}
                  onClick={() => update({ preferredPaymentMethod: option.id })}
                  className={`rounded-full ${p.preferredPaymentMethod === option.id ? "sunset-bg text-primary-foreground border-0" : ""}`}
                >
                  {option.label}
                </Button>
              ))}
          </div>
        </div>
        <div className="space-y-2 border-t border-border/60 pt-2">
          <Label className="text-xs">Gespeicherte Zahlungsprofile</Label>
          <div className="grid gap-2">
            <Input
              value={profileLabel}
              onChange={(e) => setProfileLabel(e.target.value)}
              placeholder="Bezeichnung, z.B. Privatkarte"
            />
            <select
              value={profileMethod}
              onChange={(e) => setProfileMethod(e.target.value as PaymentMethod)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              {paymentOptions
                .filter((option) => p.paymentMethods.includes(option.id))
                .map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
            </select>
            <Input
              value={profileDetails}
              onChange={(e) => setProfileDetails(e.target.value)}
              placeholder="Details, z.B. **** 4242"
            />
            <Button size="sm" variant="outline" onClick={addPaymentProfile}>
              Zahlungsprofil hinzufügen
            </Button>
          </div>
          <div className="space-y-2">
            {p.paymentProfiles.map((profile) => (
              <div key={profile.id} className="flex items-center justify-between rounded-xl border border-border p-2">
                <button
                  onClick={() => update({ preferredPaymentProfileId: profile.id, preferredPaymentMethod: profile.method })}
                  className="text-left"
                >
                  <p className="text-sm font-medium">{profile.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {paymentOptions.find((opt) => opt.id === profile.method)?.label}
                    {profile.details ? ` · ${profile.details}` : ""}
                  </p>
                </button>
                <div className="flex items-center gap-2">
                  {p.preferredPaymentProfileId === profile.id && (
                    <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] text-success">Standard</span>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => removePaymentProfile(profile.id)}>
                    Entfernen
                  </Button>
                </div>
              </div>
            ))}
            {p.paymentProfiles.length === 0 && (
              <p className="text-xs text-muted-foreground">Noch keine Zahlungsprofile gespeichert.</p>
            )}
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
