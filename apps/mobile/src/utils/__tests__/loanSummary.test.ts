import { describe, expect, it } from 'vitest';

import {
  computeLoanOutstanding,
  computeLoanProgress,
} from '../loanSummary';

describe('loanSummary', () => {
  it('computes outstanding from unpaid and partial entries', () => {
    const outstanding = computeLoanOutstanding([
      {
        id: '1',
        loanId: 'l1',
        entryDate: '2026-06-01',
        expectedAmount: 21,
        receivedAmount: 21,
        status: 'paid',
      },
      {
        id: '2',
        loanId: 'l1',
        entryDate: '2026-06-02',
        expectedAmount: 21,
        receivedAmount: 10,
        status: 'partial',
      },
      {
        id: '3',
        loanId: 'l1',
        entryDate: '2026-06-03',
        expectedAmount: 21,
        receivedAmount: 0,
        status: 'unpaid',
      },
    ]);

    expect(outstanding).toBe(32);
  });

  it('counts paid entries as logged progress', () => {
    const progress = computeLoanProgress([
      {
        id: '1',
        loanId: 'l1',
        entryDate: '2026-06-01',
        expectedAmount: 3,
        receivedAmount: 3,
        status: 'paid',
      },
      {
        id: '2',
        loanId: 'l1',
        entryDate: '2026-06-02',
        expectedAmount: 3,
        receivedAmount: 1,
        status: 'partial',
      },
      {
        id: '3',
        loanId: 'l1',
        entryDate: '2026-06-03',
        expectedAmount: 3,
        receivedAmount: 0,
        status: 'unpaid',
      },
    ]);

    expect(progress).toEqual({ logged: 1, total: 3 });
  });
});
