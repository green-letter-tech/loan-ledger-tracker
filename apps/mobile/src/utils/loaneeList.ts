import type { LoaneeListItem } from './loanSummary';

export type LoaneeSortKey = 'name' | 'outstanding' | 'activeLoans';

export function filterLoaneeItems(
  items: LoaneeListItem[],
  query: string,
): LoaneeListItem[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return items;
  }

  return items.filter(({ loanee }) => {
    const name = loanee.name.toLowerCase();
    const phone = (loanee.phone ?? '').toLowerCase();
    return name.includes(needle) || phone.includes(needle);
  });
}

export function sortLoaneeItems(
  items: LoaneeListItem[],
  sort: LoaneeSortKey,
): LoaneeListItem[] {
  const next = [...items];
  next.sort((a, b) => {
    switch (sort) {
      case 'outstanding':
        return b.outstanding - a.outstanding || a.loanee.name.localeCompare(b.loanee.name);
      case 'activeLoans':
        return b.activeLoans - a.activeLoans || a.loanee.name.localeCompare(b.loanee.name);
      case 'name':
      default:
        return a.loanee.name.localeCompare(b.loanee.name, undefined, { sensitivity: 'base' });
    }
  });
  return next;
}

export function filterAndSortLoaneeItems(
  items: LoaneeListItem[],
  query: string,
  sort: LoaneeSortKey,
): LoaneeListItem[] {
  return sortLoaneeItems(filterLoaneeItems(items, query), sort);
}
