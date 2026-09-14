import type { ReminderFrequency } from '@lendledger/core';

export function resolveScheduledTimes(
  frequency: ReminderFrequency,
  reminderTimes: string[],
): string[] {
  const sorted = [...reminderTimes].sort();
  switch (frequency) {
    case 'once_daily':
      return sorted.slice(0, 1);
    case 'twice_daily':
      return sorted.slice(0, 2);
    case 'three_times_daily':
      return sorted.slice(0, 3);
    case 'custom':
      return sorted;
    default: {
      const _exhaustive: never = frequency;
      throw new Error(`Unhandled reminder frequency: ${_exhaustive}`);
    }
  }
}

export function parseReminderTime24(time24: string): { hour: number; minute: number } | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time24.trim());
  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) {
    return null;
  }

  return { hour, minute };
}
