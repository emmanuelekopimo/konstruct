// All dates in business logic are plain "YYYY-MM-DD" strings (UTC calendar days).

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** Today's date. KONSTRUCT_TODAY=YYYY-MM-DD pins it for demos and tests. */
export function getToday(env: Record<string, string | undefined> = process.env): string {
  const pinned = env.KONSTRUCT_TODAY;
  if (pinned && ISO.test(pinned)) return pinned;
  return new Date().toISOString().slice(0, 10);
}

export function addDays(day: string, n: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-10-04" -> "4 Oct 2026" */
export function formatDay(day: string): string {
  const [y, mo, d] = day.split("-").map(Number);
  return `${d} ${MONTHS[mo - 1]} ${y}`;
}

/** Human "today", "yesterday", "5 days ago". */
export function relativeDay(day: string, today: string): string {
  const n = daysBetween(day, today);
  if (n <= 0) return "today";
  if (n === 1) return "yesterday";
  if (n < 60) return `${n} days ago`;
  return formatDay(day);
}
