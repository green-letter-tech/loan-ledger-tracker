import {
  deriveEntryDisplayStatus,
  roundMoney,
  type BulkEntryUpdate,
  type DatedEntry,
  type EntryDisplayStatus,
} from '@lendledger/core';

/**
 * One editable line on the bulk update screen. A checked row means "paid the
 * full expected amount"; unchecked rows carry a free-text amount instead.
 */
export interface BulkRow {
  loanId: string;
  loaneeName: string;
  /** Distinguishes two loans belonging to the same loanee. */
  loanLabel: string;
  expected: number;
  /** What is already stored for the day, so we only submit real changes. */
  original: number;
  checked: boolean;
  amountText: string;
}

const AMOUNT_RE = /^\d*\.?\d*$/;

/** Parses a typed amount. Returns NaN for anything that is not a plain number. */
export function parseAmount(text: string): number {
  const trimmed = text.trim();
  if (trimmed === '') {
    return 0;
  }
  if (!AMOUNT_RE.test(trimmed)) {
    return Number.NaN;
  }
  const value = Number(trimmed);
  return Number.isFinite(value) && value >= 0 ? roundMoney(value) : Number.NaN;
}

export function initialRows(items: ReadonlyArray<DatedEntry>): BulkRow[] {
  return items.map((item) => {
    const expected = roundMoney(item.entry.expectedAmount);
    const original = roundMoney(item.entry.receivedAmount);
    const paidInFull = original >= expected && original > 0;
    return {
      loanId: item.loan.id,
      loaneeName: item.loanee.name,
      loanLabel: `${item.loan.principal} principal`,
      expected,
      original,
      checked: paidInFull,
      // Keep an existing part payment visible so it can be corrected in place.
      amountText: paidInFull ? '' : String(original),
    };
  });
}

export function toggleSelectAll(rows: ReadonlyArray<BulkRow>, on: boolean): BulkRow[] {
  return rows.map((row) =>
    on ? { ...row, checked: true, amountText: '' } : { ...row, checked: false, amountText: '0' },
  );
}

export function toggleRow(rows: ReadonlyArray<BulkRow>, loanId: string): BulkRow[] {
  return rows.map((row) => {
    if (row.loanId !== loanId) {
      return row;
    }
    if (row.checked) {
      // Unchecking falls back to any part payment already recorded, else zero.
      const fallback = row.original > 0 && row.original < row.expected ? row.original : 0;
      return { ...row, checked: false, amountText: String(fallback) };
    }
    return { ...row, checked: true, amountText: '' };
  });
}

export function setRowAmount(
  rows: ReadonlyArray<BulkRow>,
  loanId: string,
  amountText: string,
): BulkRow[] {
  return rows.map((row) =>
    row.loanId === loanId ? { ...row, checked: false, amountText } : row,
  );
}

/** The amount a row would save. NaN when the typed text is not a valid number. */
export function resolveAmount(row: BulkRow): number {
  return row.checked ? row.expected : parseAmount(row.amountText);
}

export function isRowValid(row: BulkRow): boolean {
  return !Number.isNaN(resolveAmount(row));
}

export function hasInvalidRow(rows: ReadonlyArray<BulkRow>): boolean {
  return rows.some((row) => !isRowValid(row));
}

/** Only rows whose amount actually differs from what is stored. */
export function diffRows(rows: ReadonlyArray<BulkRow>): BulkEntryUpdate[] {
  const updates: BulkEntryUpdate[] = [];
  for (const row of rows) {
    const amount = resolveAmount(row);
    if (!Number.isNaN(amount) && amount !== row.original) {
      updates.push({ loanId: row.loanId, receivedAmount: amount });
    }
  }
  return updates;
}

export type BulkSummary = Record<EntryDisplayStatus, number>;

/** How the pending changes break down, for the confirmation step. */
export function summarizeRows(rows: ReadonlyArray<BulkRow>): BulkSummary {
  const summary: BulkSummary = { paid: 0, overpaid: 0, underpaid: 0, unpaid: 0 };
  for (const row of rows) {
    const amount = resolveAmount(row);
    if (Number.isNaN(amount) || amount === row.original) {
      continue;
    }
    summary[
      deriveEntryDisplayStatus({ expectedAmount: row.expected, receivedAmount: amount })
    ] += 1;
  }
  return summary;
}

export function describeSummary(summary: BulkSummary): string {
  const parts: string[] = [];
  if (summary.paid > 0) parts.push(`${summary.paid} paid`);
  if (summary.overpaid > 0) parts.push(`${summary.overpaid} overpaid`);
  if (summary.underpaid > 0) parts.push(`${summary.underpaid} underpaid`);
  if (summary.unpaid > 0) parts.push(`${summary.unpaid} cleared to unpaid`);
  return parts.join(' · ');
}
