import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { redeemToken, type RedeemResult } from "@/mocks/redeem";
import { payInvoice, type PayResult } from "@/mocks/payments";
import { addPaymentTransaction } from "@/lib/payment-transactions";
import { fetchPoi } from "@/mocks/pois";
import { CheckCircle2, XCircle } from "lucide-react";
import { loadPrefs, type PaymentMethod } from "@/lib/prefs";

export default function Redeem() {
  const [params] = useSearchParams();
  const tokenFromUrl = params.get("token") ?? "";
  const poiId = params.get("poi") ?? "";
  const pct = params.get("pct");
  const poi = poiId ? fetchPoi(poiId) : undefined;

  const [token, setToken] = useState(tokenFromUrl || generateToken());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RedeemResult | null>(null);
  const prefs = useMemo(() => loadPrefs(), []);
  const [amount, setAmount] = useState("24.90");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    prefs.preferredPaymentMethod,
  );
  const [payLoading, setPayLoading] = useState(false);
  const [payResult, setPayResult] = useState<PayResult | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string>(prefs.preferredPaymentProfileId ?? "");

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

  async function submitPayment() {
    const amountValue = Number(amount.replace(",", "."));
    const discountPct = pct ? Number(pct) : 0;
    const discountEur = Number(((amountValue * discountPct) / 100).toFixed(2));
    const totalEur = Number((amountValue - discountEur).toFixed(2));
    setPayLoading(true);
    setPayResult(null);
    const r = await payInvoice(paymentMethod, totalEur);
    setPayResult(r);
    if (r.success && r.transactionId) {
      addPaymentTransaction({
        transactionId: r.transactionId,
        poiId: poi?.id,
        poiName: poi?.name,
        method: paymentMethod,
        amountEur: amountValue,
        discountEur,
        totalEur,
        status: "pending_merchant",
      });
    }
    setPayLoading(false);
  }

  const paymentLabels: Record<PaymentMethod, string> = {
    applepay: "Apple Pay",
    googlepay: "Google Pay",
    paypal: "PayPal",
    card: "Card",
    cash: "Cash on site",
  };
  const amountValue = Number(amount.replace(",", ".")) || 0;
  const discountPct = pct ? Number(pct) : 0;
  const discountEur = Number(((amountValue * discountPct) / 100).toFixed(2));
  const totalEur = Number((amountValue - discountEur).toFixed(2));

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold"><span className="sunset-text">Redeem</span></h1>
        <p className="text-xs text-muted-foreground">
          {poi ? `For ${poi.name}${pct ? ` · ${pct}% off` : ""}` : "Show the merchant this QR code."}
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
        <label className="text-xs text-muted-foreground">Verify manually</label>
        <div className="flex gap-2">
          <Input value={token} onChange={(e) => setToken(e.target.value.toUpperCase())} className="font-mono" />
          <Button variant="outline" onClick={newToken}>New</Button>
        </div>
        <Button
          onClick={submit}
          disabled={loading}
          className="w-full sunset-bg text-primary-foreground border-0"
        >
          {loading ? "Checking…" : "Simulated checkout"}
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
            <p className="font-semibold">{result.success ? "Redeemed" : "Failed"}</p>
            <p className="text-sm opacity-80">{result.message}</p>
          </div>
        </div>
      )}

      <section className="space-y-3 glass rounded-[var(--radius)] p-4">
        <div>
          <h2 className="text-base font-semibold">Pay invoice</h2>
          <p className="text-xs text-muted-foreground">
            Redeem the offer and settle the bill in one flow.
          </p>
        </div>

        {prefs.paymentMethods.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No payment method enabled. <Link to="/preferences" className="underline">Turn on in profile</Link>.
          </p>
        ) : (
          <>
            <label className="text-xs text-muted-foreground">
              Amount (EUR)
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1"
                inputMode="decimal"
              />
            </label>
            {discountPct > 0 && (
              <div className="rounded-xl frosted p-3 text-sm">
                <p className="font-medium">Split Payment</p>
                <p className="text-muted-foreground">Invoice: {amountValue.toFixed(2)} EUR</p>
                <p className="text-success">Discount ({discountPct}%): -{discountEur.toFixed(2)} EUR</p>
                <p className="mt-1 font-semibold">To pay: {totalEur.toFixed(2)} EUR</p>
              </div>
            )}
            {prefs.paymentProfiles.length > 0 && (
              <label className="text-xs text-muted-foreground">
                Saved payment profile
                <select
                  value={selectedProfileId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    setSelectedProfileId(nextId);
                    const profile = prefs.paymentProfiles.find((p) => p.id === nextId);
                    if (profile) setPaymentMethod(profile.method);
                  }}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="">No profile</option>
                  {prefs.paymentProfiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.label} ({paymentLabels[profile.method]})
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="flex flex-wrap gap-2">
              {prefs.paymentMethods.map((method) => (
                <Button
                  key={method}
                  size="sm"
                  variant={paymentMethod === method ? "default" : "outline"}
                  onClick={() => setPaymentMethod(method)}
                  className={`rounded-full ${paymentMethod === method ? "sunset-bg text-primary-foreground border-0" : ""}`}
                >
                  {paymentLabels[method]}
                </Button>
              ))}
            </div>
            <Button
              onClick={submitPayment}
              disabled={payLoading}
              className="w-full sunset-bg text-primary-foreground border-0"
            >
              {payLoading ? "Paying…" : `Pay with ${paymentLabels[paymentMethod]}`}
            </Button>
          </>
        )}
      </section>

      {payResult && (
        <div
          className={`flex items-start gap-3 rounded-[var(--radius)] p-4 ${
            payResult.success ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          }`}
          role="status"
        >
          {payResult.success ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          <div>
            <p className="font-semibold">{payResult.success ? "Payment successful" : "Payment failed"}</p>
            <p className="text-sm opacity-80">
              {payResult.message}
              {payResult.transactionId ? ` · ${payResult.transactionId}` : ""}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function generateToken() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}
