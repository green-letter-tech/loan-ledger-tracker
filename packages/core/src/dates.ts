import type { DurationUnit, ISODateString, RatePeriod } from './types';

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Parse `YYYY-MM-DD` as local calendar date (avoids UTC off-by-one). */
export function parseISODateLocal(iso: string): Date {
  if (!ISO_DATE_RE.test(iso)) {
    throw new Error(`Invalid ISO date: ${iso}`);
  }
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Format local calendar date as `YYYY-MM-DD`. */
export function formatISODateLocal(date: Date): ISODateString {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Inclusive day count between two calendar dates (DST-safe). */
export function inclusiveDaysBetween(start: Date, end: Date): number {
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  if (endUtc < startUtc) {
    return 0;
  }
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((endUtc - startUtc) / msPerDay) + 1;
}

export function addCalendarDays(iso: ISODateString, days: number): ISODateString {
  const date = parseISODateLocal(iso);
  date.setDate(date.getDate() + days);
  return formatISODateLocal(date);
}

/** Add calendar months; clamp day to last day of target month (Jan 31 + 1 mo → Feb 28). */
export function addCalendarMonths(iso: ISODateString, months: number): ISODateString {
  const date = parseISODateLocal(iso);
  const targetMonthIndex = date.getMonth() + months;
  const targetYear = date.getFullYear() + Math.floor(targetMonthIndex / 12);
  const normalizedMonth = ((targetMonthIndex % 12) + 12) % 12;
  const daysInTargetMonth = new Date(targetYear, normalizedMonth + 1, 0).getDate();
  const day = Math.min(date.getDate(), daysInTargetMonth);
  return formatISODateLocal(new Date(targetYear, normalizedMonth, day));
}

export function addCalendarYears(iso: ISODateString, years: number): ISODateString {
  return addCalendarMonths(iso, years * 12);
}

/** End date for a loan term (inclusive last payment day). */
export function computeEndDate(
  startDate: ISODateString,
  duration: number,
  durationUnit: DurationUnit,
): ISODateString {
  if (duration <= 0) {
    return startDate;
  }

  switch (durationUnit) {
    case 'days':
      return addCalendarDays(startDate, duration - 1);
    case 'months':
      return addCalendarMonths(startDate, duration);
    case 'years':
      return addCalendarYears(startDate, duration);
    default: {
      const _exhaustive: never = durationUnit;
      throw new Error(`Unhandled duration unit: ${_exhaustive}`);
    }
  }
}

/**
 * Calendar-aware day count for loan math and daily entry generation.
 * `months` / `years` require `startDate`.
 */
export function normalizeDurationDays(
  duration: number,
  durationUnit: DurationUnit,
  startDate?: ISODateString,
): number {
  if (duration <= 0) {
    return 0;
  }

  switch (durationUnit) {
    case 'days':
      return duration;
    case 'months':
    case 'years': {
      if (!startDate) {
        throw new Error(`startDate is required for duration unit "${durationUnit}"`);
      }
      const endDate = computeEndDate(startDate, duration, durationUnit);
      return inclusiveDaysBetween(parseISODateLocal(startDate), parseISODateLocal(endDate));
    }
    default: {
      const _exhaustive: never = durationUnit;
      throw new Error(`Unhandled duration unit: ${_exhaustive}`);
    }
  }
}

/**
 * Payment due dates for a loan term.
 * - `days`: one entry per calendar day (duration = day count)
 * - `months` / `years`: one entry per period (duration = period count)
 */
export function listEntryDates(
  startDate: ISODateString,
  duration: number,
  durationUnit: DurationUnit,
): ISODateString[] {
  if (duration <= 0) {
    return [];
  }

  switch (durationUnit) {
    case 'days': {
      const dates: ISODateString[] = [];
      for (let i = 0; i < duration; i += 1) {
        dates.push(addCalendarDays(startDate, i));
      }
      return dates;
    }
    case 'months': {
      const dates: ISODateString[] = [];
      for (let i = 0; i < duration; i += 1) {
        dates.push(addCalendarMonths(startDate, i));
      }
      return dates;
    }
    case 'years': {
      const dates: ISODateString[] = [];
      for (let i = 0; i < duration; i += 1) {
        dates.push(addCalendarYears(startDate, i));
      }
      return dates;
    }
    default: {
      const _exhaustive: never = durationUnit;
      throw new Error(`Unhandled duration unit: ${_exhaustive}`);
    }
  }
}

/** Evenly split total repayable across scheduled payment dates. */
export function computeExpectedPerEntry(totalExpected: number, entryCount: number): number {
  if (entryCount <= 0) {
    return 0;
  }
  return Math.round((totalExpected / entryCount) * 100) / 100;
}

export function paymentPeriodLabel(durationUnit: DurationUnit): string {
  switch (durationUnit) {
    case 'days':
      return 'Daily payment';
    case 'months':
      return 'Monthly payment';
    case 'years':
      return 'Yearly payment';
    default: {
      const _exhaustive: never = durationUnit;
      throw new Error(`Unhandled duration unit: ${_exhaustive}`);
    }
  }
}

export function paymentProgressLabel(durationUnit: DurationUnit): string {
  switch (durationUnit) {
    case 'days':
      return 'days logged';
    case 'months':
      return 'months logged';
    case 'years':
      return 'years logged';
    default: {
      const _exhaustive: never = durationUnit;
      throw new Error(`Unhandled duration unit: ${_exhaustive}`);
    }
  }
}

/** Convert UI rate (percent) to decimal daily rate. */
export function normalizeDailyRate(interestRate: number, ratePeriod: RatePeriod): number {
  const ratePercentPerDay =
    ratePeriod === 'day'
      ? interestRate
      : ratePeriod === 'month'
        ? interestRate / 30
        : interestRate / 365;

  return ratePercentPerDay / 100;
}
