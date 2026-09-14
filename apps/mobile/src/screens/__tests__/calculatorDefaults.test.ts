import { describe, expect, it } from 'vitest';

import { calculateLoan, formatINR } from '@lendledger/core';

/** Default calculator values should match plan Task 12 acceptance example. */
describe('calculator screen defaults', () => {
  it('100 INR at 1%/day for 50 days shows ₹3.00/day', () => {
    const result = calculateLoan({
      principal: 100,
      interestRate: 1,
      ratePeriod: 'day',
      duration: 50,
      durationUnit: 'days',
      startDate: '2026-06-06',
    });

    expect(result.dailyExpected).toBe(3);
    expect(formatINR(result.dailyExpected, true)).toBe('₹3.00');
    expect(result.totalExpected).toBe(150);
    expect(result.totalInterest).toBe(50);
  });
});
