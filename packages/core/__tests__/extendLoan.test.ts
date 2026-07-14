import { describe, expect, it } from 'vitest';

import {
  computeOutstandingBalance,
  computeRecalculateDaily,
  previewExtendLoan,
} from '../src/extendLoan';

describe('extendLoan', () => {
  const entries = [
    { expectedAmount: 21, receivedAmount: 21 },
    { expectedAmount: 21, receivedAmount: 10 },
    { expectedAmount: 21, receivedAmount: 0 },
  ];

  it('computes outstanding balance from entries', () => {
    expect(computeOutstandingBalance(entries)).toBe(32);
  });

  it('recalculates daily amount from outstanding and extension days', () => {
    expect(computeRecalculateDaily(320, 20)).toBe(16);
    expect(computeRecalculateDaily(100, 3)).toBe(33.33);
  });

  it('previews keep-daily extension', () => {
    const preview = previewExtendLoan({
      endDate: '2026-07-25',
      dailyExpected: 21,
      extensionDays: 20,
      mode: 'keep_daily',
      outstanding: 320,
    });

    expect(preview).toEqual({
      newEndDate: '2026-08-14',
      newDailyExpected: 21,
      additionalDays: 20,
    });
  });

  it('previews recalculate extension', () => {
    const preview = previewExtendLoan({
      endDate: '2026-07-25',
      dailyExpected: 21,
      extensionDays: 20,
      mode: 'recalculate',
      outstanding: 320,
    });

    expect(preview).toEqual({
      newEndDate: '2026-08-14',
      newDailyExpected: 16,
      additionalDays: 20,
    });
  });
});
