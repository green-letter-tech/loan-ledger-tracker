import { describe, it, expect } from 'vitest';

import { deriveDailyEntryStatus } from '../src/entryStatus';

describe('deriveDailyEntryStatus', () => {
  it('marks unpaid when nothing received', () => {
    expect(deriveDailyEntryStatus(100, 0)).toBe('unpaid');
  });

  it('marks paid when exact or overpaid', () => {
    expect(deriveDailyEntryStatus(100, 100)).toBe('paid');
    expect(deriveDailyEntryStatus(100, 150)).toBe('paid');
  });

  it('marks partial when between 0 and expected', () => {
    expect(deriveDailyEntryStatus(100, 50)).toBe('partial');
  });
});
