import { roundMoney } from './money';
import type { DailyEntry, Loan, LoanSettlement } from './repository-types';

/**
 * Every rupee collected is split between principal and interest in the same
 * ratio the loan itself has, so recovery is reported proportionally rather than
 * interest-first or principal-first.
 */
export interface RecoverySplit {
  principal: number;
  totalInterest: number;
  principalRecovered: number;
  interestRecovered: number;
  principalOutstanding: number;
  interestOutstanding: number;
  /** Collected above the total repayable — informational, never counted as recovery. */
  overpaidExcess: number;
}

type RecoveryLoan = Pick<Loan, 'principal'> & { settlement?: LoanSettlement | null };
type RecoveryEntry = Pick<DailyEntry, 'expectedAmount' | 'receivedAmount'>;

function sumExpected(entries: ReadonlyArray<RecoveryEntry>): number {
  return entries.reduce((sum, entry) => sum + entry.expectedAmount, 0);
}

function sumReceived(entries: ReadonlyArray<RecoveryEntry>): number {
  return entries.reduce((sum, entry) => sum + entry.receivedAmount, 0);
}

/**
 * Principal as a fraction of the total repayable. Derived from the entry schedule
 * rather than `loan.totalExpected` because extending a loan adds entries and
 * therefore shifts the ratio toward interest.
 */
export function principalShare(
  loan: RecoveryLoan,
  entries: ReadonlyArray<RecoveryEntry>,
): number {
  const totalExpected = sumExpected(entries);
  if (totalExpected <= 0) {
    return 0;
  }
  return Math.min(1, Math.max(0, loan.principal / totalExpected));
}

export function computeRecoverySplit(
  loan: RecoveryLoan,
  entries: ReadonlyArray<RecoveryEntry>,
): RecoverySplit {
  const principal = Math.max(0, roundMoney(loan.principal));
  const totalExpected = roundMoney(sumExpected(entries));
  const totalInterest = Math.max(0, roundMoney(totalExpected - principal));
  const received = roundMoney(sumReceived(entries));
  const share = principalShare(loan, entries);

  // Only what was actually owed can be credited; anything beyond is excess.
  const creditable = Math.min(received, totalExpected);
  const overpaidExcess = Math.max(0, roundMoney(received - totalExpected));

  let principalRecovered = Math.min(principal, roundMoney(creditable * share));
  let interestRecovered = Math.min(totalInterest, roundMoney(creditable * (1 - share)));

  const settlement = loan.settlement ?? null;
  if (settlement) {
    principalRecovered = Math.min(
      principal,
      roundMoney(principalRecovered + settlement.settlementPrincipal),
    );
    interestRecovered = Math.min(
      totalInterest,
      roundMoney(interestRecovered + settlement.settlementInterest),
    );
  }

  return {
    principal,
    totalInterest,
    principalRecovered,
    interestRecovered,
    principalOutstanding: Math.max(0, roundMoney(principal - principalRecovered)),
    // A settled loan has no interest still owed — the unpaid remainder was waived.
    interestOutstanding: settlement
      ? 0
      : Math.max(0, roundMoney(totalInterest - interestRecovered)),
    overpaidExcess,
  };
}

/** Add up recovery across several loans (dashboard cumulative view). */
export function sumRecoverySplits(splits: ReadonlyArray<RecoverySplit>): RecoverySplit {
  const total = splits.reduce<RecoverySplit>(
    (acc, split) => ({
      principal: acc.principal + split.principal,
      totalInterest: acc.totalInterest + split.totalInterest,
      principalRecovered: acc.principalRecovered + split.principalRecovered,
      interestRecovered: acc.interestRecovered + split.interestRecovered,
      principalOutstanding: acc.principalOutstanding + split.principalOutstanding,
      interestOutstanding: acc.interestOutstanding + split.interestOutstanding,
      overpaidExcess: acc.overpaidExcess + split.overpaidExcess,
    }),
    {
      principal: 0,
      totalInterest: 0,
      principalRecovered: 0,
      interestRecovered: 0,
      principalOutstanding: 0,
      interestOutstanding: 0,
      overpaidExcess: 0,
    },
  );

  return {
    principal: roundMoney(total.principal),
    totalInterest: roundMoney(total.totalInterest),
    principalRecovered: roundMoney(total.principalRecovered),
    interestRecovered: roundMoney(total.interestRecovered),
    principalOutstanding: roundMoney(total.principalOutstanding),
    interestOutstanding: roundMoney(total.interestOutstanding),
    overpaidExcess: roundMoney(total.overpaidExcess),
  };
}
