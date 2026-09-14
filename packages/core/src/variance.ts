import { roundMoney } from './money';
import type { DailyEntry } from './repository-types';

/**
 * How a recorded payment compares to what was due. Derived for display only —
 * the stored `DailyEntryStatus` stays `paid | unpaid | partial`.
 */
export type EntryDisplayStatus = 'paid' | 'overpaid' | 'underpaid' | 'unpaid';

type VarianceEntry = Pick<DailyEntry, 'expectedAmount' | 'receivedAmount'>;

/** Received minus expected. Zero when nothing was received. */
export function entryVariance(entry: VarianceEntry): number {
  const received = roundMoney(entry.receivedAmount);
  if (received <= 0) {
    return 0;
  }
  return roundMoney(received - roundMoney(entry.expectedAmount));
}

export function deriveEntryDisplayStatus(entry: VarianceEntry): EntryDisplayStatus {
  const received = roundMoney(entry.receivedAmount);
  const expected = roundMoney(entry.expectedAmount);

  if (received <= 0) {
    return 'unpaid';
  }
  // Nothing was due (e.g. a ₹0 custom extension), so any payment settles the day.
  if (expected <= 0) {
    return 'paid';
  }
  if (received > expected) {
    return 'overpaid';
  }
  if (received < expected) {
    return 'underpaid';
  }
  return 'paid';
}

export interface VarianceSummary {
  /** Total received above expectation, as a positive amount. */
  overpaidTotal: number;
  /** Total shortfall on part-paid days, as a positive amount. */
  underpaidTotal: number;
  overpaidDays: number;
  underpaidDays: number;
}

export function summarizeVariance(entries: ReadonlyArray<VarianceEntry>): VarianceSummary {
  let overpaidTotal = 0;
  let underpaidTotal = 0;
  let overpaidDays = 0;
  let underpaidDays = 0;

  for (const entry of entries) {
    switch (deriveEntryDisplayStatus(entry)) {
      case 'overpaid':
        overpaidTotal += entryVariance(entry);
        overpaidDays += 1;
        break;
      case 'underpaid':
        underpaidTotal += -entryVariance(entry);
        underpaidDays += 1;
        break;
      default:
        break;
    }
  }

  return {
    overpaidTotal: roundMoney(overpaidTotal),
    underpaidTotal: roundMoney(underpaidTotal),
    overpaidDays,
    underpaidDays,
  };
}
