import { computeEndDate, normalizeDailyRate, normalizeDurationDays } from './dates';
import type { ISODateString, LoanCalculationInput, LoanCalculationResult } from './types';

function resolveStartDate(input: LoanCalculationInput): ISODateString | null {
  return input.startDate ?? null;
}

export function calculateLoan(input: LoanCalculationInput): LoanCalculationResult {
  const startDate = resolveStartDate(input);
  const durationDays = normalizeDurationDays(
    input.duration,
    input.durationUnit,
    startDate ?? undefined,
  );

  let endDate: ISODateString | null = null;
  if (startDate && durationDays > 0) {
    endDate = computeEndDate(startDate, input.duration, input.durationUnit);
  } else if (startDate && durationDays === 0) {
    endDate = startDate;
  }

  const dailyRate = normalizeDailyRate(input.interestRate, input.ratePeriod);
  const totalInterest = input.principal * dailyRate * durationDays;
  const totalExpected = input.principal + totalInterest;
  const dailyExpected =
    durationDays > 0 ? Math.round((totalExpected / durationDays) * 100) / 100 : 0;

  return {
    principal: input.principal,
    interestRate: input.interestRate,
    ratePeriod: input.ratePeriod,
    durationDays,
    dailyRate,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalExpected: Math.round(totalExpected * 100) / 100,
    dailyExpected,
    startDate,
    endDate,
  };
}
