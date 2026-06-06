/** Indian lakh/crore grouping. Ported from `Lend Ledger/app/lib.jsx`. */
export function groupINR(n: number): string {
  const neg = n < 0;
  const s = Math.abs(Math.round(n)).toString();
  let last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  if (rest) {
    last3 = ',' + last3;
  }
  const groupedRest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return (neg ? '-' : '') + groupedRest + last3;
}

/** Format amount as INR. Set `paise` to show two decimal places. */
export function formatINR(n: number, paise = false): string {
  const whole = groupINR(n);
  if (!paise) {
    return '₹' + whole;
  }
  const fractional = Math.abs(n) % 1;
  const cents = Math.round(fractional * 100)
    .toString()
    .padStart(2, '0');
  return '₹' + whole + '.' + cents;
}
