export type RatePeriod = 'day' | 'month' | 'year';

export type DurationUnit = 'days' | 'months' | 'years';

/** ISO calendar date `YYYY-MM-DD` in local device semantics (no time zone shift). */
export type ISODateString = string;

export interface LoanCalculationInput {
  principal: number;
  interestRate: number;
  ratePeriod: RatePeriod;
  duration: number;
  durationUnit: DurationUnit;
  /**
   * Loan start date. Required when `durationUnit` is `months` or `years`.
   * Optional for `days` (used to compute `endDate` when provided).
   */
  startDate?: ISODateString;
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
  startDate: ISODateString | null;
  endDate: ISODateString | null;
}
