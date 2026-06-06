import type { DurationUnit, RatePeriod } from './types';

/** Convert UI rate (percent) to decimal daily rate. Spec §7; matches `Lend Ledger/app/screens-core.jsx`. */
export function normalizeDailyRate(interestRate: number, ratePeriod: RatePeriod): number {
  const ratePercentPerDay =
    ratePeriod === 'day'
      ? interestRate
      : ratePeriod === 'month'
        ? interestRate / 30
        : interestRate / 365;

  return ratePercentPerDay / 100;
}

/**
 * Convert duration to days for loan math (not calendar months).
 * Fixed factors match the approved handoff calculator: 1 month = 30 days, 1 year = 365 days.
 * Does not vary for 28/29/30/31-day months or leap years — see `packages/core/README.md`.
 */
export function normalizeDurationDays(duration: number, durationUnit: DurationUnit): number {
  switch (durationUnit) {
    case 'days':
      return duration;
    case 'months':
      return duration * 30;
    case 'years':
      return duration * 365;
    default: {
      const _exhaustive: never = durationUnit;
      throw new Error(`Unhandled duration unit: ${_exhaustive}`);
    }
  }
}
