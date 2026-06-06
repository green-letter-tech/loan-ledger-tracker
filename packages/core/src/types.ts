export type RatePeriod = 'day' | 'month' | 'year';

export type DurationUnit = 'days' | 'months' | 'years';

export interface LoanCalculationInput {
  principal: number;
  interestRate: number;
  ratePeriod: RatePeriod;
  duration: number;
  durationUnit: DurationUnit;
}

export interface LoanCalculationResult {
  principal: number;
  interestRate: number;
  ratePeriod: RatePeriod;
  durationDays: number;
  dailyRate: number;
  totalInterest: number;
  totalExpected: number;
  dailyExpected: number;
}
