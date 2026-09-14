import { describe, expect, it } from 'vitest';

import { computeRecoverySplit, principalShare, sumRecoverySplits } from '../src/recovery';

/** `paidCount` entries fully paid, the rest untouched. */
function schedule(count: number, expectedAmount: number, paidCount: number) {
  return Array.from({ length: count }, (_, index) => ({
    expectedAmount,
    receivedAmount: index < paidCount ? expectedAmount : 0,
  }));
}

describe('principalShare', () => {
  it('is principal over the total repayable', () => {
    // ₹100 -> ₹150 over 50 days
    expect(principalShare({ principal: 100 }, schedule(50, 3, 0))).toBeCloseTo(2 / 3, 10);
  });

  it('is zero when there are no entries', () => {
    expect(principalShare({ principal: 100 }, [])).toBe(0);
  });

  it('never exceeds 1 when the schedule is smaller than the principal', () => {
    expect(principalShare({ principal: 100 }, schedule(10, 1, 0))).toBe(1);
  });
});

describe('computeRecoverySplit', () => {
  it('splits collections proportionally (canonical ₹100 -> ₹150)', () => {
    const split = computeRecoverySplit({ principal: 100 }, schedule(50, 3, 10));

    expect(split.principal).toBe(100);
    expect(split.totalInterest).toBe(50);
    expect(split.principalRecovered).toBe(20);
    expect(split.interestRecovered).toBe(10);
    expect(split.principalOutstanding).toBe(80);
    expect(split.interestOutstanding).toBe(40);
    expect(split.overpaidExcess).toBe(0);
  });

  it('returns zeros for a loan with no entries', () => {
    expect(computeRecoverySplit({ principal: 100 }, [])).toEqual({
      principal: 100,
      totalInterest: 0,
      principalRecovered: 0,
      interestRecovered: 0,
      principalOutstanding: 100,
      interestOutstanding: 0,
      overpaidExcess: 0,
    });
  });

  it('fully recovers principal and interest when every day is paid', () => {
    const split = computeRecoverySplit({ principal: 100 }, schedule(50, 3, 50));
    expect(split.principalRecovered).toBe(100);
    expect(split.interestRecovered).toBe(50);
    expect(split.principalOutstanding).toBe(0);
    expect(split.interestOutstanding).toBe(0);
  });

  it('recomputes the share after an extension adds entries', () => {
    // 50 days at ₹3 extended by 10 more: total repayable 180, so interest grows.
    const extended = [...schedule(50, 3, 50), ...schedule(10, 3, 0)];
    const split = computeRecoverySplit({ principal: 100 }, extended);

    expect(split.totalInterest).toBe(80);
    // ₹150 collected against a 100/180 principal share.
    expect(split.principalRecovered).toBe(83.33);
    expect(split.interestRecovered).toBe(66.67);
  });

  it('caps recovery at the amount owed and reports the excess separately', () => {
    const entries = [...schedule(49, 3, 49), { expectedAmount: 3, receivedAmount: 23 }];
    const split = computeRecoverySplit({ principal: 100 }, entries);

    expect(split.principalRecovered).toBe(100);
    expect(split.interestRecovered).toBe(50);
    expect(split.overpaidExcess).toBe(20);
  });

  it('counts a refinance settlement as recovered and leaves no interest outstanding', () => {
    const entries = [...schedule(80, 1, 80), ...schedule(40, 1, 0)];
    const split = computeRecoverySplit(
      {
        principal: 100,
        settlement: {
          deduction: 33.33,
          settlementPrincipal: 33.33,
          settlementInterest: 0,
          interestWaived: 6.67,
        },
      },
      entries,
    );

    // 80 days collected (₹80 -> ₹66.67 principal) plus the ₹33.33 settlement.
    expect(split.principalRecovered).toBe(100);
    expect(split.principalOutstanding).toBe(0);
    expect(split.interestRecovered).toBe(13.33);
    expect(split.interestOutstanding).toBe(0);
  });
});

describe('sumRecoverySplits', () => {
  it('adds splits across loans', () => {
    const a = computeRecoverySplit({ principal: 100 }, schedule(50, 3, 10));
    const b = computeRecoverySplit({ principal: 200 }, schedule(50, 6, 10));
    const total = sumRecoverySplits([a, b]);

    expect(total.principal).toBe(300);
    expect(total.principalRecovered).toBe(60);
    expect(total.interestRecovered).toBe(30);
  });

  it('returns zeros for no loans', () => {
    expect(sumRecoverySplits([]).principal).toBe(0);
  });
});
