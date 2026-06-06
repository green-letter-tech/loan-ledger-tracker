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

Duration normalization (loan **term math only**):

- Days → as entered
- Months → × **30** (fixed; not calendar months)
- Years → × **365** (fixed; not leap-year aware)

### Calendar vs fixed duration (important)

| Layer | Uses calendar? | Notes |
|-------|----------------|-------|
| **Calculator / `durationDays`** | No | 2 months = 60 days always; Feb 28/29 and 31-day months are ignored |
| **Daily entry rows** (Tasks 7–8) | Yes | One row per real calendar day from `start_date` for `durationDays` count |

Example: “2 months” → 60 days of interest math → 60 consecutive calendar dates when the loan is saved (e.g. Jan 31 start crosses into March; still 60 rows).

This matches `Lend Ledger/app/screens-core.jsx` and spec §7. Changing to true calendar months would be a product decision, not a bug fix.

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
