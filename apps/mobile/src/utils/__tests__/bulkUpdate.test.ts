import { describe, expect, it } from 'vitest';

import type { DatedEntry } from '@lendledger/core';

import {
  describeSummary,
  diffRows,
  hasInvalidRow,
  initialRows,
  parseAmount,
  resolveAmount,
  setRowAmount,
  summarizeRows,
  toggleRow,
  toggleSelectAll,
  type BulkRow,
} from '../bulkUpdate';

function datedEntry(
  loanId: string,
  loaneeName: string,
  expected: number,
  received: number,
): DatedEntry {
  return {
    loan: {
      id: loanId,
      ownerId: 'o1',
      loaneeId: `${loanId}-loanee`,
      principal: 100,
      interestRate: 1,
      ratePeriod: 'day',
      durationUnit: 'days',
      durationCount: 10,
      durationDays: 10,
      dailyExpected: expected,
      totalExpected: expected * 10,
      startDate: '2026-06-01',
      endDate: '2026-06-10',
      status: 'active',
      createdAt: '2026-06-01T00:00:00.000Z',
      closedAt: null,
      closedReason: null,
      refinancedFromLoanId: null,
      refinancedToLoanId: null,
      settlement: null,
    },
    loanee: {
      id: `${loanId}-loanee`,
      ownerId: 'o1',
      name: loaneeName,
      phone: null,
      notes: null,
      avatarHue: 254,
      createdAt: '2026-06-01T00:00:00.000Z',
    },
    entry: {
      id: `${loanId}-entry`,
      loanId,
      entryDate: '2026-06-03',
      expectedAmount: expected,
      receivedAmount: received,
      status: received <= 0 ? 'unpaid' : received >= expected ? 'paid' : 'partial',
    },
  };
}

function row(overrides: Partial<BulkRow> = {}): BulkRow {
  return {
    loanId: 'l1',
    loaneeName: 'Anita',
    loanLabel: '100 principal',
    expected: 10,
    original: 0,
    checked: false,
    amountText: '0',
    ...overrides,
  };
}

describe('parseAmount', () => {
  it('accepts plain numbers and trims whitespace', () => {
    expect(parseAmount('12')).toBe(12);
    expect(parseAmount('  12 ')).toBe(12);
    expect(parseAmount('12.50')).toBe(12.5);
    expect(parseAmount('.5')).toBe(0.5);
  });

  it('treats empty text as zero', () => {
    expect(parseAmount('')).toBe(0);
    expect(parseAmount('   ')).toBe(0);
  });

  it('rejects malformed input', () => {
    expect(parseAmount('1.2.3')).toBeNaN();
    expect(parseAmount('-5')).toBeNaN();
    expect(parseAmount('abc')).toBeNaN();
    expect(parseAmount('1e5')).toBeNaN();
  });
});

describe('initialRows', () => {
  it('pre-checks days already paid in full and keeps part payments editable', () => {
    const rows = initialRows([
      datedEntry('l1', 'Anita', 10, 10),
      datedEntry('l2', 'Bhaskar', 10, 4),
      datedEntry('l3', 'Chandra', 10, 0),
    ]);

    expect(rows[0]).toMatchObject({ checked: true, amountText: '' });
    expect(rows[1]).toMatchObject({ checked: false, amountText: '4' });
    expect(rows[2]).toMatchObject({ checked: false, amountText: '' });
  });

  it('produces no pending changes when reopened unchanged', () => {
    const rows = initialRows([
      datedEntry('l1', 'Anita', 10, 10),
      datedEntry('l2', 'Bhaskar', 10, 4),
      datedEntry('l3', 'Chandra', 10, 0),
    ]);
    expect(diffRows(rows)).toEqual([]);
  });
});

describe('selection', () => {
  it('select all checks every row', () => {
    const rows = toggleSelectAll([row(), row({ loanId: 'l2' })], true);
    expect(rows.every((item) => item.checked)).toBe(true);
    expect(diffRows(rows)).toEqual([
      { loanId: 'l1', receivedAmount: 10 },
      { loanId: 'l2', receivedAmount: 10 },
    ]);
  });

  it('unselect all clears every row to zero', () => {
    const rows = toggleSelectAll([row({ checked: true, original: 10 })], false);
    expect(rows[0]).toMatchObject({ checked: false, amountText: '' });
    expect(diffRows(rows)).toEqual([{ loanId: 'l1', receivedAmount: 0 }]);
  });

  it('unchecking a row falls back to its recorded part payment', () => {
    const rows = toggleRow([row({ checked: true, original: 4 })], 'l1');
    expect(rows[0].amountText).toBe('4');
  });

  it('unchecking a fully paid row falls back to zero', () => {
    const rows = toggleRow([row({ checked: true, original: 10 })], 'l1');
    expect(rows[0].amountText).toBe('');
  });

  it('typing an amount unchecks the row', () => {
    const rows = setRowAmount([row({ checked: true })], 'l1', '6');
    expect(rows[0]).toMatchObject({ checked: false, amountText: '6' });
    expect(resolveAmount(rows[0])).toBe(6);
  });

  it('leaves other rows untouched', () => {
    const rows = toggleRow([row(), row({ loanId: 'l2' })], 'l2');
    expect(rows[0].checked).toBe(false);
    expect(rows[1].checked).toBe(true);
  });
});

describe('validation and diff', () => {
  it('flags a malformed amount', () => {
    expect(hasInvalidRow([row({ amountText: '1.2.3' })])).toBe(true);
    expect(hasInvalidRow([row({ amountText: '12' })])).toBe(false);
  });

  it('excludes invalid rows from the diff', () => {
    const rows = [row({ amountText: 'abc' }), row({ loanId: 'l2', amountText: '5' })];
    expect(diffRows(rows)).toEqual([{ loanId: 'l2', receivedAmount: 5 }]);
  });

  it('allows an amount above expected', () => {
    expect(diffRows([row({ amountText: '25' })])).toEqual([
      { loanId: 'l1', receivedAmount: 25 },
    ]);
  });

  it('skips rows that already hold the same amount', () => {
    expect(diffRows([row({ original: 5, amountText: '5' })])).toEqual([]);
  });
});

describe('summarizeRows', () => {
  it('counts pending changes by outcome', () => {
    const summary = summarizeRows([
      row({ loanId: 'a', checked: true }),
      row({ loanId: 'b', amountText: '25' }),
      row({ loanId: 'c', amountText: '4' }),
      row({ loanId: 'd', original: 10, amountText: '0' }),
      row({ loanId: 'e', original: 7, amountText: '7' }),
    ]);

    expect(summary).toEqual({ paid: 1, overpaid: 1, underpaid: 1, unpaid: 1 });
    expect(describeSummary(summary)).toBe(
      '1 paid · 1 overpaid · 1 underpaid · 1 cleared to unpaid',
    );
  });

  it('describes an empty summary as an empty string', () => {
    expect(describeSummary(summarizeRows([]))).toBe('');
  });
});
