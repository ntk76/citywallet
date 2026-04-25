import { Link } from "react-router-dom";
import { Wallet, Store, Sparkles } from "lucide-react";

const Index = () => {
  return (
    <main className="min-h-screen px-5 py-8 flex flex-col">
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl aurora-bg grid place-items-center glow">
            <Sparkles className="w-5 h-5 text-background" strokeWidth={2.5} />
          </div>
          <span className="font-mono text-sm tracking-tight">city.wallet</span>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
          PWA · MVP
        </span>
      </header>

      <section className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-mono mb-3">
          Generative Offers
        </p>
        <h1 className="text-5xl sm:text-6xl font-bold leading-[0.95] mb-5">
          Die Stadt <span className="aurora-text">spricht</span> mit deiner Wallet.
        </h1>
        <p className="text-muted-foreground text-base mb-10">
          Kontextbasierte Angebote, in Echtzeit aus Wetter, Tageszeit und Händlerregeln
          generiert. Demo-Modus, keine Tracker.
        </p>

        <div className="grid gap-3">
          <Link to="/consumer" className="block">
            <div className="glass rounded-2xl p-5 flex items-center gap-4 group hover:border-primary/50 transition">
              <div className="w-12 h-12 rounded-xl bg-primary/15 grid place-items-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">Als Konsument*in</div>
                <div className="text-sm text-muted-foreground">
                  Live-Angebot ansehen & einlösen
                </div>
              </div>
              <span className="text-primary font-mono text-sm group-hover:translate-x-1 transition">→</span>
            </div>
          </Link>

          <Link to="/merchant" className="block">
            <div className="glass rounded-2xl p-5 flex items-center gap-4 group hover:border-secondary/50 transition">
              <div className="w-12 h-12 rounded-xl bg-secondary/15 grid place-items-center">
                <Store className="w-6 h-6 text-secondary" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">Als Händler*in</div>
                <div className="text-sm text-muted-foreground">
                  Regeln setzen & Performance messen
                </div>
              </div>
              <span className="text-secondary font-mono text-sm group-hover:translate-x-1 transition">→</span>
            </div>
          </Link>
        </div>
      </section>

      <footer className="mt-10 text-center text-[11px] text-muted-foreground font-mono">
        On-Device-Personalisierung · nur Intent verlässt das Gerät
      </footer>
    </main>
  );
};

export default Index;
