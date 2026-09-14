import type { DonutSlice, Loan, LoanRepository, Loanee } from '@lendledger/core';

import { computeLoanOutstanding, computeLoanProgress } from './loanSummary';

export interface ActiveLoanCard {
  loan: Loan;
  loanee: Loanee | null;
  logged: number;
  total: number;
  outstanding: number;
}

export async function loadActiveLoanCards(
  repository: LoanRepository,
): Promise<ActiveLoanCard[]> {
  const [activeLoans, loanees] = await Promise.all([
    repository.listActiveLoans(),
    repository.listLoanees(),
  ]);

  const loaneeById = new Map(loanees.map((loanee) => [loanee.id, loanee]));

  return Promise.all(
    activeLoans.map(async (loan) => {
      const entries = await repository.getDailyEntries(loan.id);
      const { logged, total } = computeLoanProgress(entries);
      return {
        loan,
        loanee: loaneeById.get(loan.loaneeId) ?? null,
        logged,
        total,
        outstanding: computeLoanOutstanding(entries),
      };
    }),
  );
}

export function donutSlicesWithColors(
  slices: DonutSlice[],
  colors: readonly string[],
): Array<DonutSlice & { color: string }> {
  return slices.map((slice, index) => ({
    ...slice,
    color: colors[index % colors.length] ?? colors[0] ?? '#287CCF',
  }));
}
