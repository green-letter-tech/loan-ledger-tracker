import type { ReminderFrequency } from '@lendledger/core';

export const REMINDER_FREQUENCY_OPTIONS: ReadonlyArray<{
  value: ReminderFrequency;
  label: string;
}> = [
  { value: 'once_daily', label: 'Once daily' },
  { value: 'twice_daily', label: 'Twice daily' },
  { value: 'three_times_daily', label: 'Three times daily' },
  { value: 'custom', label: 'Custom' },
] as const;

export const DEFAULT_REMINDER_TIMES = ['19:00'] as const;
