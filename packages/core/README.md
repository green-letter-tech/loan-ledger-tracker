# @lendledger/core

Shared loan math, types, and INR formatting for LendLedger. Used by `apps/mobile` and any future clients.

## What lives here

| Module | Purpose |
|--------|---------|
| `calculator.ts` | `calculateLoan()` — flat/simple interest, daily repayment spread |
| `dates.ts` | Calendar-aware duration, entry dates, rate normalization, period labels |
| `paymentSchedule.ts` | `buildPaymentSchedule()` — one entry per day / month / year with expected amount |
| `entryStatus.ts` | `deriveDailyEntryStatus()` — paid / partial / unpaid from received vs expected |
| `extendLoan.ts` | `computeOutstandingBalance()`, `resolveExtendDaily()`, `previewExtendLoan()` — keep / recalculate / custom modes |
| `money.ts` | `roundMoney()` — the one rounding rule (2 dp). Never inline `Math.round(x * 100) / 100` |
| `variance.ts` | `entryVariance()`, `deriveEntryDisplayStatus()`, `summarizeVariance()` — paid / overpaid / underpaid / unpaid for display |
| `recovery.ts` | `principalShare()`, `computeRecoverySplit()`, `sumRecoverySplits()` — proportional principal vs interest recovered |
| `refinance.ts` | `previewRefinance()` — remaining principal, arrears, interest waived, deduction, cash to hand |
| `format.ts` | `formatINR()` / `groupINR()` — Indian lakh grouping |
| `types.ts` | Input/output types for loan calculations |
| `repository-types.ts` | `LoanRepository` interface + domain types (`Loan`, `Loanee`, `DailyEntry`, `DashboardStats`, `OwnerSettings`) shared with the app |

## Recovery and refinance formulas

Recovery is **proportional**: every rupee collected splits in the loan's own principal-to-interest ratio, so neither is recovered "first".

```
totalExpected = Σ expected over the entry schedule   (not loan.totalExpected — extensions add entries)
share         = principal ÷ totalExpected
principalRecovered = min(principal, received × share)
interestRecovered  = min(totalInterest, received × (1 − share))
```

Refinance withholds enough of the new principal to settle the old loan:

```
remainingPrincipal = share × Σ expected over untouched days from today onward
interestWaived     = remainingExpected − remainingPrincipal
arrears            = Σ max(0, expected − received) over days already due
deduction          = remainingPrincipal + arrears   (lender may override)
cashToHand         = newPrincipal − deduction       (may be negative)
```

**Canonical example:** ₹100 over 120 days at ₹1/day, 80 days paid → 40 days remain → deduction **₹33.33**, interest waived ₹6.67, cash to hand ₹66.67 on a fresh ₹100 loan.

## Loan formula

```
dailyRate     = normalizeRate(interestRate, ratePeriod)   // day | month | year
durationDays  = inclusive calendar days from start → end
totalInterest = principal × dailyRate × durationDays
totalExpected = principal + totalInterest
dailyExpected = totalExpected ÷ durationDays
```

**Canonical example:** ₹100 principal, 1% per day, 50 days → ₹50 interest → ₹150 total → **₹3/day**.

### Rate normalization (unchanged)

- Per day → rate as entered
- Per month → rate ÷ 30
- Per year → rate ÷ 365

### Duration — calendar-aware (device calendar)

Uses local `Date` math on `YYYY-MM-DD` strings (no UTC off-by-one). **Requires `startDate`** when `durationUnit` is `months` or `years`.

| Unit | End date | Example (start 2026-02-15) |
|------|----------|------------------------------|
| **days** | start + (N − 1) days | 30 days → ends **2026-03-16** (30 payment days) |
| **months** | add N calendar months (clamp day) | 1 month → ends **2026-03-15** (29 days) |
| **years** | add N calendar years | 1 year → ends **2027-02-15** |

**Why this matters:** “30 days” and “1 month” from Feb 15 are different terms — avoids false delinquency from mismatched end dates.

Month-end clamp: Jan 31 + 1 month → Feb 28 (or Feb 29 in leap years).

### Helpers for Tasks 7–8 (SQLite / daily entries)

```typescript
computeEndDate(startDate, duration, durationUnit)  // last payment day
listEntryDates(startDate, durationDays)            // one ISO date per row
normalizeDurationDays(duration, unit, startDate)    // day count for interest
```

`end_date` in the database = `computeEndDate(...)` = last row in `listEntryDates(...)`.

## Scripts

```bash
# From repo root
npm run test:core
npm run typecheck --workspace=@lendledger/core

# From this package
npm run test:watch
```

## Adding behavior

Use TDD: add cases to `__tests__/`, run `npm run test:core`, implement in `src/`, re-run until green.
