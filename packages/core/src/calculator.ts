import { normalizeDailyRate, normalizeDurationDays } from './dates';
import type { LoanCalculationInput, LoanCalculationResult } from './types';

export function calculateLoan(input: LoanCalculationInput): LoanCalculationResult {
  const durationDays = normalizeDurationDays(input.duration, input.durationUnit);
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
  };
}
