import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, XCircle, Loader2, Smartphone } from "lucide-react";
import PageShell from "@/components/PageShell";
import { getRedemption, simulateRedeem, type RedemptionRecord } from "@/lib/redeem";

type UIState = "idle" | "validating" | "redeemed" | "failed" | "missing";

export default function Redeem() {
  const { token = "" } = useParams();
  const [record, setRecord] = useState<RedemptionRecord | undefined>(undefined);
  const [state, setState] = useState<UIState>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const r = getRedemption(token);
    setRecord(r);
    if (!r) setState("missing");
    else if (r.status === "redeemed") setState("redeemed");
    else if (r.status === "failed") setState("failed");
  }, [token]);

  async function handleValidate() {
    setState("validating");
    const res = await simulateRedeem(token);
    setMessage(res.message);
    setState(res.ok ? "redeemed" : "failed");
    setRecord(getRedemption(token));
  }

  if (state === "missing") {
    return (
      <PageShell title="Token unbekannt" back="/consumer">
        <div className="glass rounded-2xl p-6 text-center">
          <XCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Dieser Token existiert nicht oder ist abgelaufen.
          </p>
          <Link to="/consumer" className="text-primary font-mono text-sm">
            ← zurück zur Wallet
          </Link>
        </div>
      </PageShell>
    );
  }

  if (!record) return null;

  const url = `${window.location.origin}/redeem/${record.token}`;

  return (
    <PageShell title="Einlösen" back="/consumer">
      <div className="glass rounded-3xl p-6 text-center mb-4 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-56 h-56 rounded-full aurora-bg opacity-15 blur-3xl" />

        <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-primary mb-1">
          {record.merchantName}
        </div>
        <div className="text-3xl font-bold mb-1 aurora-text">{record.discountPct}%</div>
        <div className="text-sm text-muted-foreground mb-6">auf {record.product}</div>

        {state === "redeemed" ? (
          <div className="py-8">
            <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-3 glow rounded-full" />
            <div className="text-xl font-bold mb-1">Redeemed</div>
            <div className="text-sm text-muted-foreground">
              {message || "Token erfolgreich eingelöst."}
            </div>
          </div>
        ) : state === "failed" ? (
          <div className="py-8">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-3" />
            <div className="text-xl font-bold mb-1">Fehlgeschlagen</div>
            <div className="text-sm text-muted-foreground mb-4">
              {message || "Bitte erneut versuchen."}
            </div>
            <button
              onClick={handleValidate}
              className="px-5 py-2.5 rounded-xl bg-muted text-foreground text-sm font-medium"
            >
              Erneut versuchen
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white p-4 rounded-2xl inline-block mb-5">
              <QRCodeSVG value={url} size={180} level="M" />
            </div>
            <div className="font-mono text-xs text-muted-foreground mb-5 break-all">
              {record.token}
            </div>

            <button
              onClick={handleValidate}
              disabled={state === "validating"}
              className="w-full aurora-bg text-background font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {state === "validating" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Validiere…
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4" /> Im Laden einlösen (Simulation)
                </>
              )}
            </button>
          </>
        )}
      </div>

      <div className="text-[11px] text-muted-foreground font-mono text-center">
        intent · {record.intentTag}
      </div>
    </PageShell>
  );
}
