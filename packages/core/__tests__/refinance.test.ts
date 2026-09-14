import { describe, expect, it } from 'vitest';

import { addCalendarDays } from '../src/dates';
import { previewRefinance } from '../src/refinance';

const START = '2026-01-01';

/**
 * Canonical case from the product brief: ₹100 over 120 days at ₹1/day.
 * `paidDays` counts fully paid days from the start.
 */
function dailyLoan(paidDays: number, days = 120) {
  return Array.from({ length: days }, (_, index) => ({
    entryDate: addCalendarDays(START, index),
    expectedAmount: 1,
    receivedAmount: index < paidDays ? 1 : 0,
  }));
}

/** The day after `paidDays` fully paid days. */
function dayAfter(paidDays: number) {
  return addCalendarDays(START, paidDays);
}

describe('previewRefinance', () => {
  it('deducts remaining principal using (principal / days) x remaining days', () => {
    const preview = previewRefinance({
      oldLoan: { principal: 100 },
      entries: dailyLoan(80),
      today: dayAfter(80),
      newPrincipal: 100,
    });

    expect(preview.remainingEntries).toBe(40);
    expect(preview.remainingExpected).toBe(40);
    expect(preview.remainingPrincipal).toBe(33.33);
    expect(preview.interestWaived).toBe(6.67);
    expect(preview.arrears).toBe(0);
    expect(preview.suggestedDeduction).toBe(33.33);
    expect(preview.deduction).toBe(33.33);
    expect(preview.cashToHand).toBe(66.67);
    expect(preview.settlementPrincipal).toBe(33.33);
    expect(preview.settlementInterest).toBe(0);
  });

  it('adds unpaid past days to the deduction', () => {
    // 80 days elapsed but only 75 collected -> 5 days of arrears.
    const entries = dailyLoan(75);
    const preview = previewRefinance({
      oldLoan: { principal: 100 },
      entries,
      today: dayAfter(80),
      newPrincipal: 100,
    });

    expect(preview.arrearsDays).toBe(5);
    expect(preview.arrears).toBe(5);
    expect(preview.remainingEntries).toBe(40);
    expect(preview.remainingPrincipal).toBe(33.33);
    expect(preview.suggestedDeduction).toBe(38.33);
    expect(preview.cashToHand).toBe(61.67);
    // Arrears carry interest; remaining days do not.
    expect(preview.arrearsPrincipal).toBe(4.17);
    expect(preview.arrearsInterest).toBe(0.83);
    expect(preview.settlementPrincipal).toBe(37.5);
    expect(preview.settlementInterest).toBe(0.83);
  });

  it('counts a part-paid today as arrears, not as a remaining day', () => {
    const entries = dailyLoan(80);
    entries[80] = { entryDate: dayAfter(80), expectedAmount: 1, receivedAmount: 0.4 };

    const preview = previewRefinance({
      oldLoan: { principal: 100 },
      entries,
      today: dayAfter(80),
      newPrincipal: 100,
    });

    expect(preview.remainingEntries).toBe(39);
    expect(preview.arrearsDays).toBe(1);
    expect(preview.arrears).toBe(0.6);
  });

  it('excludes a fully paid today from both remaining and arrears', () => {
    const preview = previewRefinance({
      oldLoan: { principal: 100 },
      entries: dailyLoan(81),
      today: dayAfter(80),
      newPrincipal: 100,
    });

    expect(preview.remainingEntries).toBe(39);
    expect(preview.arrearsDays).toBe(0);
  });

  it('treats an overdue tail past the end date as pure arrears', () => {
    const preview = previewRefinance({
      oldLoan: { principal: 100 },
      entries: dailyLoan(110),
      today: addCalendarDays(START, 200),
      newPrincipal: 100,
    });

    expect(preview.remainingEntries).toBe(0);
    expect(preview.remainingPrincipal).toBe(0);
    expect(preview.interestWaived).toBe(0);
    expect(preview.arrearsDays).toBe(10);
    expect(preview.suggestedDeduction).toBe(10);
  });

  it('scales the settlement split when the lender lowers the deduction', () => {
    const preview = previewRefinance({
      oldLoan: { principal: 100 },
      entries: dailyLoan(75),
      today: dayAfter(80),
      newPrincipal: 100,
      deductionOverride: 19.165,
    });

    expect(preview.suggestedDeduction).toBe(38.33);
    expect(preview.deduction).toBe(19.17);
    expect(preview.settlementPrincipal).toBe(18.75);
    expect(preview.settlementInterest).toBe(0.42);
    expect(preview.cashToHand).toBe(80.83);
  });

  it('records nothing settled when the lender waives the deduction entirely', () => {
    const preview = previewRefinance({
      oldLoan: { principal: 100 },
      entries: dailyLoan(80),
      today: dayAfter(80),
      newPrincipal: 100,
      deductionOverride: 0,
    });

    expect(preview.deduction).toBe(0);
    expect(preview.settlementPrincipal).toBe(0);
    expect(preview.settlementInterest).toBe(0);
    expect(preview.interestWaived).toBe(6.67);
    expect(preview.cashToHand).toBe(100);
  });

  it('accepts a deduction above the suggestion', () => {
    const preview = previewRefinance({
      oldLoan: { principal: 100 },
      entries: dailyLoan(80),
      today: dayAfter(80),
      newPrincipal: 100,
      deductionOverride: 40,
    });

    expect(preview.deduction).toBe(40);
    expect(preview.settlementPrincipal).toBe(40);
    expect(preview.cashToHand).toBe(60);
  });

  it('returns a negative cash figure when the new principal is smaller than the deduction', () => {
    const preview = previewRefinance({
      oldLoan: { principal: 100 },
      entries: dailyLoan(80),
      today: dayAfter(80),
      newPrincipal: 20,
    });

    expect(preview.cashToHand).toBe(-13.33);
  });

  it('handles a brand-new loan with nothing collected yet', () => {
    const preview = previewRefinance({
      oldLoan: { principal: 100 },
      entries: dailyLoan(0),
      today: START,
      newPrincipal: 150,
    });

    expect(preview.remainingEntries).toBe(120);
    expect(preview.arrears).toBe(0);
    expect(preview.suggestedDeduction).toBe(100);
    expect(preview.cashToHand).toBe(50);
  });

  it('rejects invalid amounts', () => {
    expect(() =>
      previewRefinance({
        oldLoan: { principal: 100 },
        entries: dailyLoan(80),
        today: dayAfter(80),
        newPrincipal: Number.NaN,
      }),
    ).toThrow(/non-negative/);

    expect(() =>
      previewRefinance({
        oldLoan: { principal: 100 },
        entries: dailyLoan(80),
        today: dayAfter(80),
        newPrincipal: 100,
        deductionOverride: -1,
      }),
    ).toThrow(/non-negative/);
  });
});
