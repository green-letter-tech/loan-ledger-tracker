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
}

export interface ExtendLoanPreview {
  newEndDate: ISODateString;
  newDailyExpected: number;
  additionalDays: number;
}

export function previewExtendLoan(input: ExtendLoanPreviewInput): ExtendLoanPreview {
  const { endDate, dailyExpected, extensionDays, mode, outstanding } = input;

  if (extensionDays <= 0) {
    throw new Error('Extension days must be positive');
  }

  const newDailyExpected =
    mode === 'keep_daily'
      ? dailyExpected
      : computeRecalculateDaily(outstanding, extensionDays);

  return {
    newEndDate: addCalendarDays(endDate, extensionDays),
    newDailyExpected,
    additionalDays: extensionDays,
  };
}
