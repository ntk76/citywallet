export type TimeslotMinutes = 30 | 60 | 120 | 720 | 1440;

const ALLOWED = new Set<TimeslotMinutes>([30, 60, 120, 720, 1440]);

export const TIMESLOT_OPTIONS: Array<{ value: TimeslotMinutes; label: string }> = [
  { value: 30, label: "30 Min" },
  { value: 60, label: "60 Min" },
  { value: 120, label: "2 h" },
  { value: 720, label: "1/2 Tag" },
  { value: 1440, label: "Ganzer Tag" },
];

export function normalizeTimeslot(value: unknown): TimeslotMinutes {
  const n = typeof value === "string" ? Number(value) : typeof value === "number" ? value : NaN;
  if (n === 15) return 30;
  if (ALLOWED.has(n as TimeslotMinutes)) return n as TimeslotMinutes;
  return 30;
}

export function formatTimeslotLabel(m: TimeslotMinutes): string {
  const opt = TIMESLOT_OPTIONS.find((o) => o.value === m);
  return opt?.label ?? `${m} Min`;
}
