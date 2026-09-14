import type { DurationUnit, ISODateString, RatePeriod } from '@lendledger/core';

/** Passed from Calculator → CreateLoan (Task 12 → 13). */
export type CalculatorSnapshot = {
  principal: number;
  interestRate: number;
  ratePeriod: RatePeriod;
  duration: number;
  durationUnit: DurationUnit;
  startDate: ISODateString;
  durationDays: number;
  dailyExpected: number;
  totalExpected: number;
  totalInterest: number;
  endDate: ISODateString | null;
};
