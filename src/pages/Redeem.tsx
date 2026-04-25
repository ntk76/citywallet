import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { redeemToken, type RedeemResult } from "@/mocks/redeem";
import { fetchPoi } from "@/mocks/pois";
import { CheckCircle2, XCircle } from "lucide-react";

export default function Redeem() {
  const [params] = useSearchParams();
  const tokenFromUrl = params.get("token") ?? "";
  const poiId = params.get("poi") ?? "";
  const pct = params.get("pct");
  const poi = poiId ? fetchPoi(poiId) : undefined;

  const [token, setToken] = useState(tokenFromUrl || generateToken());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RedeemResult | null>(null);

  const qrPayload = useMemo(
    () => JSON.stringify({ t: token, poi: poiId || null, pct: pct ? Number(pct) : null }),
    [token, poiId, pct],
  );

  async function submit() {
    setLoading(true);
    setResult(null);
    const r = await redeemToken(token);
    setResult(r);
    setLoading(false);
  }

  function newToken() {
    setToken(generateToken());
    setResult(null);
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold"><span className="sunset-text">Einlösen</span></h1>
        <p className="text-xs text-muted-foreground">
          {poi ? `Für ${poi.name}${pct ? ` · ${pct}% Rabatt` : ""}` : "Zeige dem Händler den QR-Code."}
        </p>
      </header>

      <div className="glass rounded-[var(--radius)] p-6 flex flex-col items-center gap-4">
        <div className="rounded-2xl bg-white p-4">
          <QRCodeSVG value={qrPayload} size={208} level="M" />
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Token</p>
          <p className="font-mono text-lg tracking-widest">{token}</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Manuell prüfen</label>
        <div className="flex gap-2">
          <Input value={token} onChange={(e) => setToken(e.target.value.toUpperCase())} className="font-mono" />
          <Button variant="outline" onClick={newToken}>Neu</Button>
        </div>
        <Button
          onClick={submit}
          disabled={loading}
          className="w-full sunset-bg text-primary-foreground border-0"
        >
          {loading ? "Prüfe…" : "Simulations-Checkout"}
        </Button>
      </div>

      {result && (
        <div
          className={`flex items-start gap-3 rounded-[var(--radius)] p-4 ${
            result.success ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          }`}
          role="status"
        >
          {result.success ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          <div>
            <p className="font-semibold">{result.success ? "Eingelöst" : "Fehlgeschlagen"}</p>
            <p className="text-sm opacity-80">{result.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function generateToken() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}
