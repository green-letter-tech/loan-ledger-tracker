import { describe, it, expect } from 'vitest';

import { formatINR, groupINR } from '../src/format';

describe('groupINR', () => {
  it('groups lakh-style for large numbers', () => {
    expect(groupINR(150000)).toBe('1,50,000');
    expect(groupINR(10000000)).toBe('1,00,00,000');
  });

  it('handles negatives', () => {
    expect(groupINR(-2500)).toBe('-2,500');
  });
});

describe('formatINR', () => {
  it('prefixes rupee symbol', () => {
    expect(formatINR(150)).toBe('₹150');
    expect(formatINR(150000)).toBe('₹1,50,000');
  });

  it('shows paise when requested', () => {
    expect(formatINR(3, true)).toBe('₹3.00');
    expect(formatINR(433.33, true)).toBe('₹433.33');
  });
});
