import type { DailyEntry, DailyEntryStatus } from '@lendledger/core';
import { formatISODateLocal, type ISODateString } from '@lendledger/core';

import { computeLoanOutstanding, computeLoanProgress } from './loanSummary';

export type EntryFilter = 'All' | 'Paid' | 'Unpaid' | 'Partial';

const FILTER_TO_STATUS: Record<Exclude<EntryFilter, 'All'>, DailyEntryStatus> = {
  Paid: 'paid',
  Unpaid: 'unpaid',
  Partial: 'partial',
};

function sortEntriesNewestFirst(entries: DailyEntry[]): DailyEntry[] {
  return entries.slice().sort((a, b) => b.entryDate.localeCompare(a.entryDate));
}

function sortEntriesOldestFirst(entries: DailyEntry[]): DailyEntry[] {
  return entries.slice().sort((a, b) => a.entryDate.localeCompare(b.entryDate));
}

function sortEntriesForFilter(entries: DailyEntry[], filter: EntryFilter): DailyEntry[] {
  return filter === 'Paid' ? sortEntriesNewestFirst(entries) : sortEntriesOldestFirst(entries);
}

export function formatEntryDateShort(iso: ISODateString): string {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function dailyStatusToPill(status: DailyEntryStatus): 'Paid' | 'Unpaid' | 'Partial' {
  switch (status) {
    case 'paid':
      return 'Paid';
    case 'unpaid':
      return 'Unpaid';
    case 'partial':
      return 'Partial';
    default: {
      const _exhaustive: never = status;
      throw new Error(`Unhandled status: ${_exhaustive}`);
    }
  }
}

/** Which payment the owner should action next (today, overdue, or next upcoming). */
export function resolveCurrentEntry(
  entries: DailyEntry[],
  todayIso: ISODateString = formatISODateLocal(new Date()),
): DailyEntry | null {
  if (entries.length === 0) {
    return null;
  }

  const exactToday = entries.find((entry) => entry.entryDate === todayIso);
  if (exactToday && exactToday.status !== 'paid') {
    return exactToday;
  }

  const overdue = entries
    .filter((entry) => entry.entryDate < todayIso && entry.status !== 'paid')
    .sort((a, b) => b.entryDate.localeCompare(a.entryDate));
  if (overdue[0]) {
    return overdue[0];
  }

  const upcoming = entries
    .filter((entry) => entry.entryDate > todayIso && entry.status !== 'paid')
    .sort((a, b) => a.entryDate.localeCompare(b.entryDate));
  if (upcoming[0]) {
    return upcoming[0];
  }

  return null;
}

export function currentEntrySectionLabel(
  entry: DailyEntry,
  todayIso: ISODateString = formatISODateLocal(new Date()),
): string {
  if (entry.entryDate === todayIso) {
    return 'Today';
  }
  if (entry.entryDate > todayIso) {
    return 'Upcoming';
  }
  return 'Due now';
}

export function filterHistoryEntries(
  entries: DailyEntry[],
  filter: EntryFilter,
  _todayIso: ISODateString = formatISODateLocal(new Date()),
  excludeEntryId?: string | null,
): DailyEntry[] {
  const pool = entries.filter((entry) => {
    if (excludeEntryId && entry.id === excludeEntryId) {
      return false;
    }
    return true;
  });

  const filtered =
    filter === 'All'
      ? pool
      : pool.filter((entry) => entry.status === FILTER_TO_STATUS[filter]);

  return sortEntriesForFilter(filtered, filter);
}

export function splitEntriesForDisplay(
  entries: DailyEntry[],
  todayIso: ISODateString = formatISODateLocal(new Date()),
): { current: DailyEntry | null; history: DailyEntry[] } {
  const current = resolveCurrentEntry(entries, todayIso);
  const history = filterHistoryEntries(entries, 'All', todayIso, current?.id);
  return { current, history };
}

/** @deprecated Use splitEntriesForDisplay */
export const splitEntriesByToday = splitEntriesForDisplay;

export function computeCollected(entries: DailyEntry[]): number {
  return entries.reduce((sum, entry) => sum + entry.receivedAmount, 0);
}

export function computeOverpaymentCredit(entries: DailyEntry[]): number {
  return entries.reduce(
    (sum, entry) => sum + Math.max(0, entry.receivedAmount - entry.expectedAmount),
    0,
  );
}

export function countUnpaidDays(entries: DailyEntry[]): number {
  return entries.filter((entry) => entry.status === 'unpaid').length;
}

export function countPartialDays(entries: DailyEntry[]): number {
  return entries.filter((entry) => entry.status === 'partial').length;
}

export function buildLoanDetailSummary(entries: DailyEntry[]) {
  const { logged, total } = computeLoanProgress(entries);
  return {
    outstanding: computeLoanOutstanding(entries),
    collected: computeCollected(entries),
    overpaymentCredit: computeOverpaymentCredit(entries),
    unpaidDays: countUnpaidDays(entries),
    logged,
    total,
    progressPct: total > 0 ? Math.round((logged / total) * 100) : 0,
  };
}
