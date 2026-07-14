import type { DailyEntry, Loan, LoanRepository, Loanee } from '@lendledger/core';

export function computeLoanOutstanding(entries: DailyEntry[]): number {
  return entries.reduce(
    (sum, entry) => sum + Math.max(0, entry.expectedAmount - entry.receivedAmount),
    0,
  );
}

export function computeLoanProgress(entries: DailyEntry[]): { logged: number; total: number } {
  return {
    logged: entries.filter((entry) => entry.status === 'paid').length,
    total: entries.length,
  };
}

export interface LoanWithSummary {
  loan: Loan;
  outstanding: number;
  logged: number;
  total: number;
}

export interface LoaneeListItem {
  loanee: Loanee;
  activeLoans: number;
  outstanding: number;
}

export async function loadLoaneesWithStats(repository: LoanRepository): Promise<LoaneeListItem[]> {
  const [loanees, activeLoans, stats] = await Promise.all([
    repository.listLoanees(),
    repository.listActiveLoans(),
    repository.getDashboardStats(),
  ]);

  const activeCountByLoanee = new Map<string, number>();
  for (const loan of activeLoans) {
    activeCountByLoanee.set(loan.loaneeId, (activeCountByLoanee.get(loan.loaneeId) ?? 0) + 1);
  }

  const outstandingByLoanee = new Map(
    stats.donutByLoanee.map((slice) => [slice.loaneeId, slice.value]),
  );

  return loanees.map((loanee) => ({
    loanee,
    activeLoans: activeCountByLoanee.get(loanee.id) ?? 0,
    outstanding: outstandingByLoanee.get(loanee.id) ?? 0,
  }));
}

export async function loadLoaneeDetail(
  repository: LoanRepository,
  loaneeId: string,
): Promise<{ loanee: Loanee | null; loans: LoanWithSummary[] }> {
  const loanees = await repository.listLoanees();
  const loanee = loanees.find((entry) => entry.id === loaneeId) ?? null;
  if (!loanee) {
    return { loanee: null, loans: [] };
  }

  const activeLoans = (await repository.listActiveLoans()).filter(
    (loan) => loan.loaneeId === loaneeId,
  );

  const loans = await Promise.all(
    activeLoans.map(async (loan) => {
      const entries = await repository.getDailyEntries(loan.id);
      const { logged, total } = computeLoanProgress(entries);
      return {
        loan,
        outstanding: computeLoanOutstanding(entries),
        logged,
        total,
      };
    }),
  );

  return { loanee, loans };
}
