# Loan repository

`LoanRepository` interface lives in `@lendledger/core`; MVP1 implementation is `LocalLoanRepository` (expo-sqlite).

## Factory

```typescript
import { createLocalLoanRepository } from './LoanRepository';

const repo = await createLocalLoanRepository();
const loan = await repo.createLoan({ ... });
```

## `createLoan` flow

1. `calculateLoan()` from `@lendledger/core` (calendar-aware `startDate`)
2. Insert `loans` row with `end_date` from calculator
3. `buildPaymentSchedule(startDate, duration, durationUnit)` → one `daily_entries` row per payment period (daily, monthly, or yearly)

## `extendLoan(loanId, days, mode, customTotal?)`

Appends `days` new `daily_entries` after `end_date`. The per-day amount comes from `resolveExtendDaily()` in core:

| Mode | New daily amount |
|------|------------------|
| `keep_daily` | Unchanged |
| `recalculate` | Outstanding balance ÷ new days |
| `custom` | `customTotal` ÷ new days |

## Tests

```bash
npm run test:mobile
```

Integration tests use isolated `lendledger-test-*.db` files via `src/test-utils/createTestRepository.ts` (file-backed SQLite shim in `src/test-utils/expo-sqlite-node.ts`).
