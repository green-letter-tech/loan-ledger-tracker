import type { Loan } from '@lendledger/core';

/** e.g. `1% / day`. */
export function formatRateLabel(loan: Pick<Loan, 'interestRate' | 'ratePeriod'>): string {
  return `${loan.interestRate}% / ${loan.ratePeriod}`;
}

/** e.g. `120 days`, `3 months`, `1 year`. */
export function formatTermLabel(loan: Pick<Loan, 'durationCount' | 'durationUnit'>): string {
  const unit = loan.durationCount === 1 ? loan.durationUnit.replace(/s$/, '') : loan.durationUnit;
  return `${loan.durationCount} ${unit}`;
}

/** Combined hero line, e.g. `1% / day · 120 days`. */
export function formatTermsSummary(
  loan: Pick<Loan, 'interestRate' | 'ratePeriod' | 'durationCount' | 'durationUnit'>,
): string {
  return `${formatRateLabel(loan)} · ${formatTermLabel(loan)}`;
}
