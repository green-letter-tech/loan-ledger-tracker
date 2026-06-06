import { describe, it, expect } from 'vitest';

import {
  addCalendarDays,
  addCalendarMonths,
  computeEndDate,
  inclusiveDaysBetween,
  listEntryDates,
  normalizeDurationDays,
  parseISODateLocal,
} from '../src/dates';

describe('calendar duration', () => {
  it('30 days from Feb 15 ends Mar 16 (not Mar 15)', () => {
    const start = '2026-02-15';
    expect(computeEndDate(start, 30, 'days')).toBe('2026-03-16');
    expect(normalizeDurationDays(30, 'days', start)).toBe(30);
    const entries = listEntryDates(start, 30);
    expect(entries).toHaveLength(30);
    expect(entries[0]).toBe('2026-02-15');
    expect(entries[29]).toBe('2026-03-16');
  });

  it('1 calendar month from Feb 15 ends Mar 15 (29 inclusive days)', () => {
    const start = '2026-02-15';
    expect(computeEndDate(start, 1, 'months')).toBe('2026-03-15');
    expect(normalizeDurationDays(1, 'months', start)).toBe(29);
    expect(listEntryDates(start, 29).at(-1)).toBe('2026-03-15');
  });

  it('clamps Jan 31 + 1 month to Feb 28 in non-leap year', () => {
    expect(addCalendarMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(computeEndDate('2026-01-31', 1, 'months')).toBe('2026-02-28');
  });

  it('clamps Jan 31 + 1 month to Feb 29 in leap year', () => {
    expect(addCalendarMonths('2024-01-31', 1)).toBe('2024-02-29');
  });

  it('2 calendar months from Feb 15 ends Apr 15', () => {
    const start = '2026-02-15';
    expect(computeEndDate(start, 2, 'months')).toBe('2026-04-15');
    expect(normalizeDurationDays(2, 'months', start)).toBe(60);
  });

  it('1 calendar year from Feb 15 2026 ends Feb 15 2027', () => {
    const start = '2026-02-15';
    expect(computeEndDate(start, 1, 'years')).toBe('2027-02-15');
    const days = inclusiveDaysBetween(parseISODateLocal(start), parseISODateLocal('2027-02-15'));
    expect(normalizeDurationDays(1, 'years', start)).toBe(days);
    expect(days).toBe(366);
  });

  it('requires startDate for months and years', () => {
    expect(() => normalizeDurationDays(1, 'months')).toThrow(/startDate is required/);
    expect(() => normalizeDurationDays(1, 'years')).toThrow(/startDate is required/);
  });
});

describe('addCalendarDays', () => {
  it('crosses month boundaries', () => {
    expect(addCalendarDays('2026-02-15', 1)).toBe('2026-02-16');
    expect(addCalendarDays('2026-02-28', 1)).toBe('2026-03-01');
  });
});
