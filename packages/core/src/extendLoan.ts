import { addCalendarDays } from './dates';
import type { DailyEntry, ExtendLoanMode } from './repository-types';
import type { ISODateString } from './types';

export function computeOutstandingBalance(
  entries: ReadonlyArray<Pick<DailyEntry, 'expectedAmount' | 'receivedAmount'>>,
): number {
  return entries.reduce(
    (sum, entry) => sum + Math.max(0, entry.expectedAmount - entry.receivedAmount),
    0,
  );
}

export function computeRecalculateDaily(outstanding: number, extensionDays: number): number {
  if (extensionDays <= 0) {
    throw new Error('Extension days must be positive');
  }
  return Math.round((outstanding / extensionDays) * 100) / 100;
}

export interface ExtendLoanPreviewInput {
  endDate: ISODateString;
  dailyExpected: number;
  extensionDays: number;
  mode: ExtendLoanMode;
  outstanding: number;
  /** Total amount to spread across the new days when mode is 'custom'. */
  customTotal?: number;
}

export interface ExtendLoanPreview {
  newEndDate: ISODateString;
  newDailyExpected: number;
  additionalDays: number;
}

/** Resolve the daily expected amount for the extension days based on mode. */
export function resolveExtendDaily(input: {
  mode: ExtendLoanMode;
  dailyExpected: number;
  extensionDays: number;
  outstanding: number;
  customTotal?: number;
}): number {
  const { mode, dailyExpected, extensionDays, outstanding, customTotal } = input;

  if (extensionDays <= 0) {
    throw new Error('Extension days must be positive');
  }

  switch (mode) {
    case 'keep_daily':
      return dailyExpected;
    case 'recalculate':
      return computeRecalculateDaily(outstanding, extensionDays);
    case 'custom':
      return computeRecalculateDaily(Math.max(0, customTotal ?? 0), extensionDays);
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unhandled extend mode: ${_exhaustive}`);
    }
  }
}

export function previewExtendLoan(input: ExtendLoanPreviewInput): ExtendLoanPreview {
  const { endDate, dailyExpected, extensionDays, mode, outstanding, customTotal } = input;

  if (extensionDays <= 0) {
    throw new Error('Extension days must be positive');
  }

  const newDailyExpected = resolveExtendDaily({
    mode,
    dailyExpected,
    extensionDays,
    outstanding,
    customTotal,
  });

  return {
    newEndDate: addCalendarDays(endDate, extensionDays),
    newDailyExpected,
    additionalDays: extensionDays,
  };
}
