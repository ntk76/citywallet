import { NavLink, Outlet } from "react-router-dom";
import { Home, Map, List, Sliders, QrCode } from "lucide-react";

const tabs = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/explore/list", label: "Liste", icon: List },
  { to: "/explore/map", label: "Karte", icon: Map },
  { to: "/preferences", label: "Profil", icon: Sliders },
  { to: "/redeem", label: "QR", icon: QrCode },
];

export function AppShell() {
  return (
    <div className="min-h-screen pb-24">
      <main className="mx-auto max-w-md px-4 pt-6 animate-fade-up">
        <Outlet />
      </main>

      <nav
        aria-label="Hauptnavigation"
        className="fixed bottom-3 left-1/2 z-50 w-[min(100%-1.5rem,28rem)] -translate-x-1/2 rounded-full glass px-2 py-2"
      >
        <ul className="flex items-center justify-between">
          {tabs.map(({ to, label, icon: Icon, end }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end={end as boolean | undefined}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 rounded-full px-2 py-1.5 text-xs font-medium transition ${
                    isActive
                      ? "sunset-bg text-primary-foreground glow"
                      : "text-muted-foreground hover:text-foreground"
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
