import { describe, expect, it } from 'vitest';

import type { LoaneeListItem } from '../loanSummary';
import { filterAndSortLoaneeItems, filterLoaneeItems, sortLoaneeItems } from '../loaneeList';

function item(
  name: string,
  opts: { phone?: string | null; activeLoans?: number; outstanding?: number } = {},
): LoaneeListItem {
  return {
    loanee: {
      id: name,
      ownerId: 'owner',
      name,
      phone: opts.phone ?? null,
      notes: null,
      avatarHue: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    activeLoans: opts.activeLoans ?? 0,
    outstanding: opts.outstanding ?? 0,
  };
}

describe('loaneeList', () => {
  const items = [
    item('Priya', { phone: '98765', activeLoans: 1, outstanding: 500 }),
    item('Amit', { phone: '11111', activeLoans: 2, outstanding: 1200 }),
    item('Zara', { phone: null, activeLoans: 0, outstanding: 0 }),
  ];

  it('filters by name or phone', () => {
    expect(filterLoaneeItems(items, 'pri').map((row) => row.loanee.name)).toEqual(['Priya']);
    expect(filterLoaneeItems(items, '111').map((row) => row.loanee.name)).toEqual(['Amit']);
    expect(filterLoaneeItems(items, '  ').length).toBe(3);
  });

  it('sorts by name, outstanding, and active loans', () => {
    expect(sortLoaneeItems(items, 'name').map((row) => row.loanee.name)).toEqual([
      'Amit',
      'Priya',
      'Zara',
    ]);
    expect(sortLoaneeItems(items, 'outstanding').map((row) => row.loanee.name)).toEqual([
      'Amit',
      'Priya',
      'Zara',
    ]);
    expect(sortLoaneeItems(items, 'activeLoans').map((row) => row.loanee.name)).toEqual([
      'Amit',
      'Priya',
      'Zara',
    ]);
  });

  it('filters then sorts', () => {
    expect(
      filterAndSortLoaneeItems(items, 'mit', 'outstanding').map((row) => row.loanee.name),
    ).toEqual(['Amit']);
  });
});
