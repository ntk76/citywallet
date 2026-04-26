import { Button } from "@/components/ui/button";
import { TIMESLOT_OPTIONS, type TimeslotMinutes } from "@/lib/timeslot";

export function TimeslotSelector({
  value,
  onChange,
}: {
  value: TimeslotMinutes;
  onChange: (v: TimeslotMinutes) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Zeitfenster">
      {TIMESLOT_OPTIONS.map(({ value: v, label }) => (
        <Button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          variant={value === v ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(v)}
          className={`shrink-0 rounded-full ${value === v ? "sunset-bg text-primary-foreground border-0" : ""}`}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
