import { describe, expect, it } from 'vitest';

import {
  buildLoanDetailSummary,
  computeOverpaymentCredit,
  filterHistoryEntries,
  resolveCurrentEntry,
  splitEntriesForDisplay,
} from '../loanDetail';

describe('loanDetail', () => {
  const entries = [
    {
      id: '1',
      loanId: 'l1',
      entryDate: '2026-06-01',
      expectedAmount: 21,
      receivedAmount: 21,
      status: 'paid' as const,
    },
    {
      id: '2',
      loanId: 'l1',
      entryDate: '2026-06-02',
      expectedAmount: 21,
      receivedAmount: 25,
      status: 'paid' as const,
    },
    {
      id: '3',
      loanId: 'l1',
      entryDate: '2026-06-03',
      expectedAmount: 21,
      receivedAmount: 0,
      status: 'unpaid' as const,
    },
  ];

  it('computes overpayment credit from received above expected', () => {
    expect(computeOverpaymentCredit(entries)).toBe(4);
  });

  it('builds loan detail summary totals', () => {
    const summary = buildLoanDetailSummary(entries);
    expect(summary.collected).toBe(46);
    expect(summary.outstanding).toBe(21);
    expect(summary.logged).toBe(2);
    expect(summary.unpaidDays).toBe(1);
  });

  it('pins the exact today entry as current', () => {
    const allEntries = [
      ...entries,
      {
        id: '4',
        loanId: 'l1',
        entryDate: '2026-06-14',
        expectedAmount: 21,
        receivedAmount: 0,
        status: 'unpaid' as const,
      },
    ];
    const split = splitEntriesForDisplay(allEntries, '2026-06-14');
    expect(split.current?.entryDate).toBe('2026-06-14');
    expect(split.history).toHaveLength(3);
    expect(split.history.map((entry) => entry.entryDate)).toEqual([
      '2026-06-01',
      '2026-06-02',
      '2026-06-03',
    ]);
  });

  it('shows the next upcoming payment when today has no exact entry', () => {
    const monthly = [
      {
        id: 'm1',
        loanId: 'l2',
        entryDate: '2026-06-15',
        expectedAmount: 500,
        receivedAmount: 0,
        status: 'unpaid' as const,
      },
      {
        id: 'm2',
        loanId: 'l2',
        entryDate: '2026-07-15',
        expectedAmount: 500,
        receivedAmount: 0,
        status: 'unpaid' as const,
      },
    ];

    expect(resolveCurrentEntry(monthly, '2026-06-14')?.entryDate).toBe('2026-06-15');
  });

  it('populates Paid history from full loan entries', () => {
    const current = resolveCurrentEntry(entries, '2026-06-20');
    const filtered = filterHistoryEntries(entries, 'Paid', '2026-06-20', current?.id);
    expect(filtered).toHaveLength(2);
    expect(filtered.map((entry) => entry.entryDate)).toEqual(['2026-06-02', '2026-06-01']);
  });

  it('includes a paid today entry in Paid history', () => {
    const loanEntries = [
      {
        id: 'today',
        loanId: 'l4',
        entryDate: '2026-06-14',
        expectedAmount: 21,
        receivedAmount: 21,
        status: 'paid' as const,
      },
      {
        id: 'next',
        loanId: 'l4',
        entryDate: '2026-06-15',
        expectedAmount: 21,
        receivedAmount: 0,
        status: 'unpaid' as const,
      },
    ];
    const current = resolveCurrentEntry(loanEntries, '2026-06-14');
    expect(current?.entryDate).toBe('2026-06-15');
    const filtered = filterHistoryEntries(loanEntries, 'Paid', '2026-06-14', current?.id);
    expect(filtered.map((entry) => entry.entryDate)).toEqual(['2026-06-14']);
  });

  it('sorts Unpaid history oldest first', () => {
    const unpaidEntries = [
      ...entries,
      {
        id: '4',
        loanId: 'l1',
        entryDate: '2026-06-10',
        expectedAmount: 21,
        receivedAmount: 0,
        status: 'unpaid' as const,
      },
    ];
    const filtered = filterHistoryEntries(unpaidEntries, 'Unpaid', '2026-06-20');
    expect(filtered.map((entry) => entry.entryDate)).toEqual(['2026-06-03', '2026-06-10']);
  });

  it('populates Unpaid history including future installments', () => {
    const monthly = [
      {
        id: 'p1',
        loanId: 'l3',
        entryDate: '2026-05-15',
        expectedAmount: 500,
        receivedAmount: 500,
        status: 'paid' as const,
      },
      {
        id: 'p2',
        loanId: 'l3',
        entryDate: '2026-06-15',
        expectedAmount: 500,
        receivedAmount: 0,
        status: 'unpaid' as const,
      },
      {
        id: 'p3',
        loanId: 'l3',
        entryDate: '2026-07-15',
        expectedAmount: 500,
        receivedAmount: 0,
        status: 'unpaid' as const,
      },
    ];
    const current = resolveCurrentEntry(monthly, '2026-06-14');
    const filtered = filterHistoryEntries(monthly, 'Unpaid', '2026-06-14', current?.id);
    expect(filtered.map((entry) => entry.entryDate)).toEqual(['2026-07-15']);
  });

  it('shows all non-active entries in All filter including paid', () => {
    const current = resolveCurrentEntry(entries, '2026-06-20');
    const filtered = filterHistoryEntries(entries, 'All', '2026-06-20', current?.id);
    expect(filtered).toHaveLength(2);
    expect(filtered.map((entry) => entry.entryDate)).toEqual(['2026-06-01', '2026-06-02']);
  });

  it('includes early-paid future entries in Paid history', () => {
    const loanEntries = [
      {
        id: 'future-paid',
        loanId: 'l5',
        entryDate: '2026-06-15',
        expectedAmount: 500,
        receivedAmount: 500,
        status: 'paid' as const,
      },
      {
        id: 'next',
        loanId: 'l5',
        entryDate: '2026-07-15',
        expectedAmount: 500,
        receivedAmount: 0,
        status: 'unpaid' as const,
      },
    ];
    const current = resolveCurrentEntry(loanEntries, '2026-06-14');
    const filtered = filterHistoryEntries(loanEntries, 'Paid', '2026-06-14', current?.id);
    expect(filtered.map((entry) => entry.entryDate)).toEqual(['2026-06-15']);
  });
});
