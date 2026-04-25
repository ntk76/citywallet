import { Button } from "@/components/ui/button";

const SLOTS: Array<15 | 30 | 60> = [15, 30, 60];

export function TimeslotSelector({
  value,
  onChange,
}: {
  value: 15 | 30 | 60;
  onChange: (v: 15 | 30 | 60) => void;
}) {
  return (
    <div className="flex items-center gap-2" role="radiogroup" aria-label="Zeitfenster">
      <span className="text-xs text-muted-foreground mr-1">Ich habe</span>
      {SLOTS.map((s) => (
        <Button
          key={s}
          type="button"
          role="radio"
          aria-checked={value === s}
          variant={value === s ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(s)}
          className={value === s ? "sunset-bg text-primary-foreground border-0" : ""}
        >
          {s} Min
        </Button>
      ))}
    </div>
  );
}
