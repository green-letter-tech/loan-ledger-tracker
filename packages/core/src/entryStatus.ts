export type DailyEntryStatus = 'paid' | 'unpaid' | 'partial';

/** Derive row status from expected vs received (spec §8). Overpayment counts as paid. */
export function deriveDailyEntryStatus(
  expectedAmount: number,
  receivedAmount: number,
): DailyEntryStatus {
  if (receivedAmount <= 0) {
    return 'unpaid';
  }
  if (receivedAmount >= expectedAmount) {
    return 'paid';
  }
  return 'partial';
}
