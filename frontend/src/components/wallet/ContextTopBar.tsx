import { Cloud, CloudRain, Snowflake, Sun, Sunrise } from "lucide-react";
import type { ContextSignals } from "@/mocks/context";
import type { TimeslotMinutes } from "@/lib/timeslot";
import { formatTimeslotLabel } from "@/lib/timeslot";
import { TimeslotSelector } from "@/components/wallet/TimeslotSelector";

export function ContextTopBar({
  ctx,
  slot,
  onSlotChange,
}: {
  ctx: ContextSignals;
  slot: TimeslotMinutes;
  onSlotChange: (v: TimeslotMinutes) => void;
}) {
  const Icon =
    ctx.weather.condition === "rain"
      ? CloudRain
      : ctx.weather.condition === "cold"
        ? Snowflake
        : ctx.weather.condition === "cloudy"
          ? Cloud
          : ctx.partOfDay === "morning"
            ? Sunrise
            : Sun;

  return (
    <section className="glass space-y-3 rounded-[var(--radius)] p-4">
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="frosted inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5">
          <Icon className="h-3.5 w-3.5" />
          {ctx.weather.label} · {ctx.weather.temperatureC}°C
        </span>
        <span className="frosted inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5">
          🕒 {String(ctx.hour).padStart(2, "0")}:{String(ctx.minute).padStart(2, "0")}
        </span>
        <span className="frosted inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5">
          📍 Stuttgart · Mitte
        </span>
        <span className="frosted inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-medium">
          ⏱ Time: {formatTimeslotLabel(slot)}
        </span>
      </div>
      <div className="flex flex-col gap-2 border-t border-border/60 pt-3">
        <p className="text-xs font-medium text-muted-foreground">How much time do you have?</p>
        <TimeslotSelector value={slot} onChange={onSlotChange} />

      </div>
    </section>
  );
}
