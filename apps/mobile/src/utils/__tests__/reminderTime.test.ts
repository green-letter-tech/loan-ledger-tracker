import { describe, expect, it } from 'vitest';

import { formatReminderTime24To12, parseReminderTimeInput } from '../reminderTime';

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

describe('parseReminderTimeInput', () => {
  it('parses 12-hour input', () => {
    expect(parseReminderTimeInput('7:00 PM')).toBe('19:00');
    expect(parseReminderTimeInput('9:00 am')).toBe('09:00');
    expect(parseReminderTimeInput('12:00 AM')).toBe('00:00');
  });

  it('parses 24-hour input', () => {
    expect(parseReminderTimeInput('19:00')).toBe('19:00');
    expect(parseReminderTimeInput('9:05')).toBe('09:05');
  });

  it('returns null for invalid input', () => {
    expect(parseReminderTimeInput('invalid')).toBeNull();
    expect(parseReminderTimeInput('25:00')).toBeNull();
  });
});
