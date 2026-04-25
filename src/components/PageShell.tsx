import { Link } from "react-router-dom";
import { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

interface Props {
  title: string;
  back?: string;
  children: ReactNode;
  rightSlot?: ReactNode;
}

export default function PageShell({ title, back = "/", children, rightSlot }: Props) {
  return (
    <main className="min-h-screen px-5 pt-6 pb-12 max-w-md mx-auto">
      <header className="flex items-center justify-between mb-6">
        <Link
          to={back}
          className="w-10 h-10 rounded-xl glass grid place-items-center hover:border-primary/40 transition"
          aria-label="Zurück"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-base font-semibold tracking-tight">{title}</h1>
        <div className="w-10 h-10 grid place-items-center">{rightSlot}</div>
      </header>
      {children}
    </main>
  );
}
