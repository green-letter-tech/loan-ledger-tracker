import { computeExpectedPerEntry, listEntryDates } from './dates';
import type { DurationUnit, ISODateString } from './types';

export interface PaymentSchedule {
  entryDates: ISODateString[];
  expectedPerEntry: number;
}

export function buildPaymentSchedule(
  startDate: ISODateString,
  duration: number,
  durationUnit: DurationUnit,
  totalExpected: number,
): PaymentSchedule {
  const entryDates = listEntryDates(startDate, duration, durationUnit);
  return {
    entryDates,
    expectedPerEntry: computeExpectedPerEntry(totalExpected, entryDates.length),
  };
}
