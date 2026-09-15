import type { PaymentMode } from '@lendledger/core';

export const PAYMENT_MODE_OPTIONS: ReadonlyArray<{ label: string; value: PaymentMode }> = [
  { label: 'Cash', value: 'cash' },
  { label: 'UPI', value: 'upi' },
  { label: 'Bank', value: 'bank' },
  { label: 'Other', value: 'other' },
];

export function formatPaymentMode(mode: PaymentMode | null | undefined): string | null {
  if (!mode) {
    return null;
  }
  const match = PAYMENT_MODE_OPTIONS.find((option) => option.value === mode);
  return match?.label ?? mode;
}
