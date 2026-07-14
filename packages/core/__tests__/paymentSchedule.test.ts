import { describe, expect, it } from 'vitest';

import { buildPaymentSchedule } from '../src/paymentSchedule';

describe('buildPaymentSchedule', () => {
  it('splits total repayable across monthly payment dates', () => {
    const schedule = buildPaymentSchedule('2026-02-15', 3, 'months', 150);
    expect(schedule.entryDates).toEqual(['2026-02-15', '2026-03-15', '2026-04-15']);
    expect(schedule.expectedPerEntry).toBe(50);
  });
});
