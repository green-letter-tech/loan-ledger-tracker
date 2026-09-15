import { describe, expect, it } from 'vitest';

import { buildReminderBody, parseReminderTime24, resolveScheduledTimes } from '../remindersLogic';

describe('reminders service helpers', () => {
  it('maps frequency presets to scheduled times', () => {
    const times = ['21:00', '09:00', '13:30', '18:00'];

    expect(resolveScheduledTimes('once_daily', times)).toEqual(['09:00']);
    expect(resolveScheduledTimes('twice_daily', times)).toEqual(['09:00', '13:30']);
    expect(resolveScheduledTimes('three_times_daily', times)).toEqual(['09:00', '13:30', '18:00']);
    expect(resolveScheduledTimes('custom', times)).toEqual(['09:00', '13:30', '18:00', '21:00']);
  });

  it('parses valid 24-hour reminder times', () => {
    expect(parseReminderTime24('19:00')).toEqual({ hour: 19, minute: 0 });
    expect(parseReminderTime24('07:30')).toEqual({ hour: 7, minute: 30 });
  });

  it('rejects invalid reminder times', () => {
    expect(parseReminderTime24('25:00')).toBeNull();
    expect(parseReminderTime24('bad')).toBeNull();
  });

  it('builds overdue-aware reminder bodies', () => {
    expect(buildReminderBody(0)).toBe("Update today's collections in LendLedger");
    expect(buildReminderBody(1)).toBe('1 unpaid day needs attention — update collections');
    expect(buildReminderBody(3)).toBe('3 unpaid days need attention — update collections');
  });
});
