import { describe, expect, it } from 'vitest';

import { formatReminderTime24To12 } from '../reminderTime';

describe('formatReminderTime24To12', () => {
  it('formats evening time as 7:00 PM', () => {
    expect(formatReminderTime24To12('19:00')).toBe('7:00 PM');
  });

  it('formats morning time as 9:00 AM', () => {
    expect(formatReminderTime24To12('09:00')).toBe('9:00 AM');
  });

  it('returns input when format is invalid', () => {
    expect(formatReminderTime24To12('invalid')).toBe('invalid');
  });
});
