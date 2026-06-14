import { formatISODateLocal, parseISODateLocal, type ISODateString } from '@lendledger/core';

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidISODate(iso: string): boolean {
  if (!ISO_DATE_RE.test(iso)) {
    return false;
  }

  const [year, month, day] = iso.split('-').map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  try {
    const parsed = parseISODateLocal(iso);
    return formatISODateLocal(parsed) === iso;
  } catch {
    return false;
  }
}

/** e.g. "Today, 14 Jun 2026" when iso matches today. */
export function formatStartDateLabel(iso: ISODateString, todayIso?: ISODateString): string {
  const today = todayIso ?? formatISODateLocal(new Date());
  const date = parseISODateLocal(iso);
  const formatted = date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return iso === today ? `Today, ${formatted}` : formatted;
}
