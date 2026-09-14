/**
 * Display formatting helpers.
 *
 * Timestamps are formatted by hand rather than with `Intl.DateTimeFormat`. The
 * shell is rendered on the server and hydrated on the client, and `Intl` output
 * depends on the ICU data shipped with each runtime — a difference in month
 * abbreviations or separators would surface as a hydration mismatch. This
 * formatter is deterministic and always reports UTC.
 */

const MONTH_ABBREVIATIONS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function formatTimestamp(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  const day = date.getUTCDate();
  const month = MONTH_ABBREVIATIONS[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${day} ${month} ${year}, ${hours}:${minutes} UTC`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours} hr` : `${hours} hr ${remainder} min`;
}
