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
      startDate: '2026-06-06',
    });
    expect(r.dailyExpected).toBe(3);
    expect(r.totalInterest).toBe(50);
    expect(r.totalExpected).toBe(150);
    expect(r.durationDays).toBe(50);
    expect(r.endDate).toBe('2026-07-25');
  });

  it('normalizes monthly rate to daily', () => {
    const r = calculateLoan({
      principal: 10000,
      interestRate: 30,
      ratePeriod: 'month',
      duration: 30,
      durationUnit: 'days',
      startDate: '2026-06-06',
    });
    expect(r.durationDays).toBe(30);
    expect(r.dailyExpected).toBe(433.33);
    expect(r.totalInterest).toBe(3000);
    expect(r.totalExpected).toBe(13000);
  });

  it('uses calendar months when startDate provided', () => {
    const r = calculateLoan({
      principal: 1000,
      interestRate: 1,
      ratePeriod: 'day',
      duration: 2,
      durationUnit: 'months',
      startDate: '2026-02-15',
    });
    expect(r.durationDays).toBe(60);
    expect(r.endDate).toBe('2026-04-15');
    expect(r.totalInterest).toBe(600);
    expect(r.dailyExpected).toBe(26.67);
  });

  it('Feb 15 + 30 days vs 1 month produce different end dates and day counts', () => {
    const thirtyDays = calculateLoan({
      principal: 100,
      interestRate: 1,
      ratePeriod: 'day',
      duration: 30,
      durationUnit: 'days',
      startDate: '2026-02-15',
    });
    const oneMonth = calculateLoan({
      principal: 100,
      interestRate: 1,
      ratePeriod: 'day',
      duration: 1,
      durationUnit: 'months',
      startDate: '2026-02-15',
    });

    expect(thirtyDays.endDate).toBe('2026-03-16');
    expect(thirtyDays.durationDays).toBe(30);
    expect(oneMonth.endDate).toBe('2026-03-15');
    expect(oneMonth.durationDays).toBe(29);
    expect(thirtyDays.dailyExpected).not.toBe(oneMonth.dailyExpected);
  });

  it('uses calendar years when startDate provided', () => {
    const r = calculateLoan({
      principal: 100,
      interestRate: 365,
      ratePeriod: 'year',
      duration: 1,
      durationUnit: 'years',
      startDate: '2026-02-15',
    });
    expect(r.endDate).toBe('2027-02-15');
    expect(r.durationDays).toBe(366);
    expect(r.dailyRate).toBeCloseTo(0.01, 5);
    expect(r.totalInterest).toBe(366);
    expect(r.totalExpected).toBe(466);
    expect(r.dailyExpected).toBe(1.27);
  });

  it('returns zero daily payment when duration is zero', () => {
    const r = calculateLoan({
      principal: 100,
      interestRate: 1,
      ratePeriod: 'day',
      duration: 0,
      durationUnit: 'days',
      startDate: '2026-06-06',
    });
    expect(r.durationDays).toBe(0);
    expect(r.dailyExpected).toBe(0);
    expect(r.totalInterest).toBe(0);
    expect(r.totalExpected).toBe(100);
    expect(r.endDate).toBe('2026-06-06');
  });
});
