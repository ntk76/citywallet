import { Link } from "react-router-dom";
import { TrendingUp, Ticket, Users, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";
import { listMerchantOffers } from "@/lib/merchant-offers";
import {
  confirmPaymentTransaction,
  listPaymentTransactions,
  type PaymentTransaction,
} from "@/lib/payment-transactions";

const stats = [
  { label: "Aktive Offers", value: "12", icon: Ticket },
  { label: "Einlösungen heute", value: "84", icon: TrendingUp },
  { label: "Neue Kunden", value: "27", icon: Users },
  { label: "Avg. Reaktionszeit", value: "3 min", icon: Clock3 },
];

export default function MerchantDashboard() {
  const [activeOffers, setActiveOffers] = useState(0);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);

  useEffect(() => {
    const refresh = () => {
      const active = listMerchantOffers().filter((offer) => offer.active).length;
      setActiveOffers(active);
      setPayments(listPaymentTransactions());
    };
    refresh();
    window.addEventListener("merchant-offers-updated", refresh);
    window.addEventListener("payments-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("merchant-offers-updated", refresh);
      window.removeEventListener("payments-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const pendingPayments = payments.filter((payment) => payment.status === "pending_merchant");
  const cards = stats.map((item) =>
    item.label === "Aktive Offers"
      ? { ...item, value: String(activeOffers) }
      : item.label === "Einlösungen heute"
        ? { ...item, value: String(payments.length) }
        : item.label === "Avg. Reaktionszeit"
          ? { ...item, value: `${pendingPayments.length} offen` }
          : item,
  );

  return (
    <div className="space-y-4">
      <section className="glass rounded-[var(--radius)] p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Merchant Dashboard</p>
        <h2 className="mt-1 text-2xl font-bold">
          <span className="sunset-text">Guten Abend</span>, City Partner
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Behalte Performance, Offers und Regeln an einem Ort.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        {cards.map(({ label, value, icon: Icon }) => (
          <article key={label} className="glass rounded-[var(--radius)] p-3">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <p className="mt-2 text-xl font-semibold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </article>
        ))}
      </section>

      <section className="glass space-y-2 rounded-[var(--radius)] p-4">
        <h3 className="text-sm font-semibold">Schnellzugriff</h3>
        <div className="flex gap-2">
          <Link to="/merchant/offers" className="rounded-full border border-border px-4 py-2 text-sm frosted">
            Offers verwalten
          </Link>
          <Link to="/merchant/rules" className="rounded-full border border-border px-4 py-2 text-sm frosted">
            Rules prüfen
          </Link>
        </div>
      </section>

      <section className="glass space-y-3 rounded-[var(--radius)] p-4">
        <h3 className="text-sm font-semibold">Zahlungen bestaetigen</h3>
        {pendingPayments.slice(0, 5).map((payment) => (
          <article key={payment.id} className="rounded-xl border border-border p-3">
            <p className="text-sm font-medium">{payment.poiName ?? "Unbekannter Ort"}</p>
            <p className="text-xs text-muted-foreground">
              {payment.totalEur.toFixed(2)} EUR · {payment.method} · {payment.transactionId}
            </p>
            <button
              onClick={() => confirmPaymentTransaction(payment.id)}
              className="mt-2 rounded-full sunset-bg px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              Zahlung bestaetigen
            </button>
          </article>
        ))}
        {pendingPayments.length === 0 && (
          <p className="text-xs text-muted-foreground">Keine offenen Zahlungsbestaetigungen.</p>
        )}
      </section>
    </div>
  );
}
