import { useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, BadgePercent, ShieldCheck } from "lucide-react";
import { MOCK_MERCHANT } from "@/mocks/merchant";

const tabs = [
  { to: "/merchant/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/merchant/offers", label: "Offers", icon: BadgePercent },
  { to: "/merchant/rules", label: "Rules", icon: ShieldCheck },
];

export function MerchantShell() {
  useEffect(() => {
    const previous = document.title;
    document.title = `Merchant · ${MOCK_MERCHANT.displayName}`;
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="merchant-theme min-h-screen pb-24">
      <header className="sticky top-0 z-20">
        <div className="mx-auto mt-3 flex w-[min(100%-1.5rem,28rem)] items-center justify-between rounded-full glass px-4 py-2.5">
          <div>
            <h1 className="text-sm font-semibold leading-tight">
              <span className="sunset-text">{MOCK_MERCHANT.displayName}</span>
            </h1>
            <p className="text-[11px] text-muted-foreground">Partner console</p>
          </div>
          <span className="rounded-full frosted px-2 py-1 text-xs text-muted-foreground">
            Demo
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pt-5 animate-fade-up">
        <Outlet />
      </main>

      <nav
        aria-label="Merchant navigation"
        className="fixed bottom-3 left-1/2 z-50 w-[min(100%-1.5rem,28rem)] -translate-x-1/2 rounded-full border border-border/70 bg-background/90 px-2 py-2 shadow-soft backdrop-blur"
      >
        <ul className="flex items-center justify-between">
          {tabs.map(({ to, label, icon: Icon }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 rounded-full px-2 py-1.5 text-xs font-medium transition ${
                    isActive ? "sunset-bg text-primary-foreground glow" : "text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
