import { Link } from "react-router-dom";
import { TrendingUp, Ticket, Users, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";
import { listMerchantOffers } from "@/lib/merchant-offers";
import { getMerchantHomePoi, isMockMerchantOffer, MOCK_MERCHANT } from "@/mocks/merchant";
import {
  confirmPaymentTransaction,
  listPaymentTransactions,
  type PaymentTransaction,
} from "@/lib/payment-transactions";

const stats = [
  { label: "Active offers", value: "12", icon: Ticket },
  { label: "Redemptions today", value: "84", icon: TrendingUp },
  { label: "New customers", value: "27", icon: Users },
  { label: "Pending confirmations", value: "0", icon: Clock3 },
];

export default function MerchantDashboard() {
  const [activeOffers, setActiveOffers] = useState(0);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);

  useEffect(() => {
    const refresh = () => {
      const active = listMerchantOffers().filter((offer) => offer.active && isMockMerchantOffer(offer)).length;
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
    item.label === "Active offers"
      ? { ...item, value: String(activeOffers) }
      : item.label === "Redemptions today"
        ? { ...item, value: String(payments.length) }
        : item.label === "Pending confirmations"
          ? { ...item, value: String(pendingPayments.length) }
          : item,
  );

  const homePoi = getMerchantHomePoi();

  return (
    <div className="space-y-4">
      <section className="glass rounded-[var(--radius)] p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Your business (demo)</p>
        <h2 className="mt-1 text-xl font-bold">
          <span className="sunset-text">{MOCK_MERCHANT.displayName}</span>
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">{MOCK_MERCHANT.tagline}</p>
        {homePoi && (
          <p className="mt-2 text-xs text-muted-foreground">
            Linked customer place: <span className="font-medium text-foreground">{homePoi.name}</span> (
            <code className="text-[11px]">{homePoi.id}</code>) — active offers surface there in the customer app.
          </p>
        )}
        {homePoi && (
          <Link
            to={`/detail/${homePoi.id}`}
            className="mt-2 inline-block text-xs font-medium text-primary underline"
          >
            Open customer view for this place →
          </Link>
        )}
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
        <h3 className="text-sm font-semibold">Shortcuts</h3>
        <div className="flex gap-2">
          <Link to="/merchant/offers" className="rounded-full border border-border px-4 py-2 text-sm frosted">
            Manage offers
          </Link>
          <Link to="/merchant/rules" className="rounded-full border border-border px-4 py-2 text-sm frosted">
            Check rules
          </Link>
        </div>
      </section>

      <section className="glass space-y-3 rounded-[var(--radius)] p-4">
        <h3 className="text-sm font-semibold">Confirm payments</h3>
        {pendingPayments.slice(0, 5).map((payment) => (
          <article key={payment.id} className="rounded-xl border border-border p-3">
            <p className="text-sm font-medium">{payment.poiName ?? "Unknown place"}</p>
            <p className="text-xs text-muted-foreground">
              {payment.totalEur.toFixed(2)} EUR · {payment.method} · ref {payment.transactionId}
            </p>
            <button
              onClick={() => confirmPaymentTransaction(payment.id)}
              className="mt-2 rounded-full sunset-bg px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              Confirm payment
            </button>
          </article>
        ))}
        {pendingPayments.length === 0 && (
          <p className="text-xs text-muted-foreground">No pending payment confirmations.</p>
        )}
      </section>
    </div>
  );
}
