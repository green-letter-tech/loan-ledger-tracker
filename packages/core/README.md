# @lendledger/core

Shared loan math, types, and INR formatting for LendLedger. Used by `apps/mobile` and any future clients.

## What lives here

| Module | Purpose |
|--------|---------|
| `calculator.ts` | `calculateLoan()` — flat/simple interest, daily repayment spread |
| `dates.ts` | Normalize rate period and duration unit to daily values |
| `format.ts` | `formatINR()` / `groupINR()` — Indian lakh grouping |
| `types.ts` | Input/output types for loan calculations |

## Loan formula (spec §7)

```
dailyRate     = normalizeRate(interestRate, ratePeriod)   // day | month | year
durationDays  = normalizeDuration(duration, durationUnit) // days | months | years
totalInterest = principal × dailyRate × durationDays
totalExpected = principal + totalInterest
dailyExpected = totalExpected ÷ durationDays
```

**Canonical example:** ₹100 principal, 1% per day, 50 days → ₹50 interest → ₹150 total → **₹3/day**.

Rate normalization matches the approved UI handoff (`Lend Ledger/app/screens-core.jsx`):

- Per day → rate as entered
- Per month → rate ÷ 30
- Per year → rate ÷ 365

Duration normalization:

- Days → as entered
- Months → × 30
- Years → × 365

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
