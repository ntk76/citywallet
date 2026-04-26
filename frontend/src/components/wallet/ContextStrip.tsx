import { Cloud, CloudRain, Snowflake, Sun, Sunrise } from "lucide-react";
import type { ContextSignals } from "@/mocks/context";

export function ContextStrip({ ctx }: { ctx: ContextSignals }) {
  const Icon =
    ctx.weather.condition === "rain" ? CloudRain :
    ctx.weather.condition === "cold" ? Snowflake :
    ctx.weather.condition === "cloudy" ? Cloud :
    ctx.partOfDay === "morning" ? Sunrise : Sun;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="frosted inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5">
        <Icon className="h-3.5 w-3.5" />
        {ctx.weather.label} · {ctx.weather.temperatureC}°C
      </span>
      <span className="frosted inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5">
        🕒 {String(ctx.hour).padStart(2, "0")}:{String(ctx.minute).padStart(2, "0")} · {labelOfDay(ctx.partOfDay)}
      </span>
      <span className="frosted inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5">
        📍 Muenchen · Balanstrasse 73
      </span>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 ${
          ctx.source === "backend"
            ? "border-success/40 bg-success/10 text-success"
            : "border-warning/40 bg-warning/20 text-foreground"
        }`}
      >
        {ctx.source === "backend" ? "Live Backend" : "Mock Fallback"}
      </span>
    </div>
  );
}

function labelOfDay(p: ContextSignals["partOfDay"]) {
  return ({ morning: "Morgen", midday: "Mittag", afternoon: "Nachmittag", evening: "Abend", night: "Nacht" } as const)[p];
}
