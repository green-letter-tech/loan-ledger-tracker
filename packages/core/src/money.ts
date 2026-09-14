/**
 * Single rounding rule for every money value in LendLedger: 2 decimal places (paise).
 * Use this everywhere instead of inlining `Math.round(x * 100) / 100`.
 */
export function roundMoney(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.round(value * 100) / 100;
}
