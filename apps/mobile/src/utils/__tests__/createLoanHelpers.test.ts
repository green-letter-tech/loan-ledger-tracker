import { describe, expect, it } from 'vitest';

import { formatStartDateLabel, isValidISODate } from '../formatStartDate';
import { getLoaneeInitials } from '../loanee';

describe('formatStartDate', () => {
  it('marks today in the label', () => {
    expect(formatStartDateLabel('2026-06-14', '2026-06-14')).toMatch(/^Today,/);
  });

  it('validates ISO dates', () => {
    expect(isValidISODate('2026-06-14')).toBe(true);
    expect(isValidISODate('2026-13-01')).toBe(false);
  });
});

describe('getLoaneeInitials', () => {
  it('returns two letters from full name', () => {
    expect(getLoaneeInitials('Ravi Kumar')).toBe('RK');
  });
});
