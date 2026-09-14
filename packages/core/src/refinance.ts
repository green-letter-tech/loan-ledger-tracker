import { roundMoney } from './money';
import { principalShare } from './recovery';
import type { DailyEntry, Loan } from './repository-types';
import type { ISODateString } from './types';

type RefinanceEntry = Pick<DailyEntry, 'entryDate' | 'expectedAmount' | 'receivedAmount'>;

export interface RefinancePreviewInput {
  oldLoan: Pick<Loan, 'principal'>;
  entries: ReadonlyArray<RefinanceEntry>;
  today: ISODateString;
  newPrincipal: number;
  /** Lender's final call on the deduction; defaults to `suggestedDeduction`. */
  deductionOverride?: number;
}

export interface RefinancePreview {
  totalEntries: number;
  /** Untouched entries dated today or later. */
  remainingEntries: number;
  remainingExpected: number;
  remainingPrincipal: number;
  /** Future interest the lender gives up by ending the term early. */
  interestWaived: number;
  arrearsDays: number;
  arrears: number;
  arrearsPrincipal: number;
  arrearsInterest: number;
  suggestedDeduction: number;
  deduction: number;
  /** Negative means the loanee owes the lender before the new loan starts. */
  cashToHand: number;
  settlementPrincipal: number;
  settlementInterest: number;
}

/**
 * Works out how much of a new loan's principal must be withheld to settle the
 * loan it replaces, so the lender knows the actual cash to hand over.
 *
 * For a plain daily loan with no missed days this reduces to the lender's rule
 * of thumb: (principal / total days) × remaining days.
 */
export function previewRefinance(input: RefinancePreviewInput): RefinancePreview {
  const { oldLoan, entries, today, newPrincipal, deductionOverride } = input;

  if (!Number.isFinite(newPrincipal) || newPrincipal < 0) {
    throw new Error('New principal must be a non-negative number');
  }
  if (
    deductionOverride !== undefined &&
    (!Number.isFinite(deductionOverride) || deductionOverride < 0)
  ) {
    throw new Error('Deduction must be a non-negative number');
  }

  const share = principalShare(oldLoan, entries);

  // A day is "remaining" only if nothing has been collected for it. Anything
  // part-paid is arrears instead, so no entry is counted twice.
  const remaining = entries.filter(
    (entry) => entry.entryDate >= today && roundMoney(entry.receivedAmount) <= 0,
  );
  const remainingExpected = roundMoney(
    remaining.reduce((sum, entry) => sum + entry.expectedAmount, 0),
  );
  const remainingPrincipal = roundMoney(remainingExpected * share);
  const interestWaived = Math.max(0, roundMoney(remainingExpected - remainingPrincipal));

  const arrearsEntries = entries.filter((entry) => {
    const shortfall = roundMoney(entry.expectedAmount) - roundMoney(entry.receivedAmount);
    if (shortfall <= 0) {
      return false;
    }
    // Past days always count; today counts only when part-paid (an untouched
    // today is already in `remaining`).
    return entry.entryDate < today || roundMoney(entry.receivedAmount) > 0;
  });
  const arrears = roundMoney(
    arrearsEntries.reduce(
      (sum, entry) => sum + Math.max(0, entry.expectedAmount - entry.receivedAmount),
      0,
    ),
  );
  const arrearsPrincipal = roundMoney(arrears * share);
  const arrearsInterest = Math.max(0, roundMoney(arrears - arrearsPrincipal));

  const suggestedDeduction = roundMoney(remainingPrincipal + arrears);
  const deduction = deductionOverride === undefined ? suggestedDeduction : roundMoney(deductionOverride);

  // Keep the principal/interest split proportional to whatever figure the
  // lender settles on, so the two parts always sum back to `deduction`.
  const basePrincipal = roundMoney(remainingPrincipal + arrearsPrincipal);
  let settlementPrincipal: number;
  let settlementInterest: number;
  if (deduction === suggestedDeduction) {
    settlementPrincipal = basePrincipal;
    settlementInterest = arrearsInterest;
  } else if (suggestedDeduction > 0) {
    const scale = deduction / suggestedDeduction;
    settlementPrincipal = roundMoney(basePrincipal * scale);
    settlementInterest = Math.max(0, roundMoney(deduction - settlementPrincipal));
  } else {
    // Nothing was outstanding, so treat a manual deduction as principal repayment.
    settlementPrincipal = deduction;
    settlementInterest = 0;
  }

  return {
    totalEntries: entries.length,
    remainingEntries: remaining.length,
    remainingExpected,
    remainingPrincipal,
    interestWaived,
    arrearsDays: arrearsEntries.length,
    arrears,
    arrearsPrincipal,
    arrearsInterest,
    suggestedDeduction,
    deduction,
    cashToHand: roundMoney(newPrincipal - deduction),
    settlementPrincipal,
    settlementInterest,
  };
}
