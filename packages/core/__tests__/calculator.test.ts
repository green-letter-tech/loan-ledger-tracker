import { describe, it, expect } from 'vitest';

import { calculateLoan } from '../src/calculator';

describe('calculateLoan', () => {
  it('computes canonical example: 100 INR, 1%/day, 50 days → ₹3/day', () => {
    const r = calculateLoan({
      principal: 100,
      interestRate: 1,
      ratePeriod: 'day',
      duration: 50,
      durationUnit: 'days',
    });
    expect(r.dailyExpected).toBe(3);
    expect(r.totalInterest).toBe(50);
    expect(r.totalExpected).toBe(150);
    expect(r.durationDays).toBe(50);
  });

  it('normalizes monthly rate to daily', () => {
    const r = calculateLoan({
      principal: 10000,
      interestRate: 30,
      ratePeriod: 'month',
      duration: 30,
      durationUnit: 'days',
    });
    expect(r.durationDays).toBe(30);
    expect(r.dailyExpected).toBeGreaterThan(0);
    // 30%/month → 1%/day on ₹10,000 for 30 days → ₹4,333.33/day total spread
    expect(r.dailyExpected).toBe(433.33);
    expect(r.totalInterest).toBe(3000);
    expect(r.totalExpected).toBe(13000);
  });

  it('normalizes duration in months to days', () => {
    const r = calculateLoan({
      principal: 1000,
      interestRate: 1,
      ratePeriod: 'day',
      duration: 2,
      durationUnit: 'months',
    });
    expect(r.durationDays).toBe(60);
    expect(r.totalInterest).toBe(600);
    expect(r.dailyExpected).toBe(26.67);
  });

  it('normalizes yearly rate and duration', () => {
    const r = calculateLoan({
      principal: 100,
      interestRate: 365,
      ratePeriod: 'year',
      duration: 1,
      durationUnit: 'years',
    });
    expect(r.durationDays).toBe(365);
    expect(r.dailyRate).toBeCloseTo(0.01, 5);
    expect(r.totalInterest).toBe(365);
    expect(r.totalExpected).toBe(465);
    expect(r.dailyExpected).toBe(1.27);
  });

  it('returns zero daily payment when duration is zero', () => {
    const r = calculateLoan({
      principal: 100,
      interestRate: 1,
      ratePeriod: 'day',
      duration: 0,
      durationUnit: 'days',
    });
    expect(r.durationDays).toBe(0);
    expect(r.dailyExpected).toBe(0);
    expect(r.totalInterest).toBe(0);
    expect(r.totalExpected).toBe(100);
  });
});
