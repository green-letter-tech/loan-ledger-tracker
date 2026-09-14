import { describe, expect, it } from 'vitest';

import { deriveEntryDisplayStatus, entryVariance, summarizeVariance } from '../src/variance';

function entry(expectedAmount: number, receivedAmount: number) {
  return { expectedAmount, receivedAmount };
}

describe('entryVariance', () => {
  it('is zero when the day is paid exactly', () => {
    expect(entryVariance(entry(100, 100))).toBe(0);
  });

  it('is positive when overpaid', () => {
    expect(entryVariance(entry(100, 120))).toBe(20);
  });

  it('is negative when underpaid', () => {
    expect(entryVariance(entry(100, 70))).toBe(-30);
  });

  it('is zero when nothing was received', () => {
    expect(entryVariance(entry(100, 0))).toBe(0);
  });

  it('rounds to paise', () => {
    expect(entryVariance(entry(33.33, 33.335))).toBe(0.01);
  });
});

describe('deriveEntryDisplayStatus', () => {
  it('classifies the four cases', () => {
    expect(deriveEntryDisplayStatus(entry(100, 0))).toBe('unpaid');
    expect(deriveEntryDisplayStatus(entry(100, 70))).toBe('underpaid');
    expect(deriveEntryDisplayStatus(entry(100, 100))).toBe('paid');
    expect(deriveEntryDisplayStatus(entry(100, 120))).toBe('overpaid');
  });

  it('treats an amount equal after paise rounding as paid', () => {
    expect(deriveEntryDisplayStatus(entry(33.333, 33.33))).toBe('paid');
  });

  it('treats a payment on a zero-expected day as paid', () => {
    expect(deriveEntryDisplayStatus(entry(0, 50))).toBe('paid');
  });

  it('treats a zero-expected day with no payment as unpaid', () => {
    expect(deriveEntryDisplayStatus(entry(0, 0))).toBe('unpaid');
  });
});

describe('summarizeVariance', () => {
  it('totals overpaid and underpaid separately as positive amounts', () => {
    const summary = summarizeVariance([
      entry(100, 120),
      entry(100, 110),
      entry(100, 70),
      entry(100, 100),
      entry(100, 0),
    ]);

    expect(summary).toEqual({
      overpaidTotal: 30,
      underpaidTotal: 30,
      overpaidDays: 2,
      underpaidDays: 1,
    });
  });

  it('returns zeros for an empty schedule', () => {
    expect(summarizeVariance([])).toEqual({
      overpaidTotal: 0,
      underpaidTotal: 0,
      overpaidDays: 0,
      underpaidDays: 0,
    });
  });

  it('excludes zero-expected days from both totals', () => {
    expect(summarizeVariance([entry(0, 50)])).toEqual({
      overpaidTotal: 0,
      underpaidTotal: 0,
      overpaidDays: 0,
      underpaidDays: 0,
    });
  });

  it('accumulates repeating decimals without drift', () => {
    const summary = summarizeVariance([
      entry(33.33, 33.34),
      entry(33.33, 33.34),
      entry(33.33, 33.34),
    ]);
    expect(summary.overpaidTotal).toBe(0.03);
    expect(summary.overpaidDays).toBe(3);
  });
});
