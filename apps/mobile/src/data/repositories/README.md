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
3. `listEntryDates(startDate, durationDays)` → one `daily_entries` row per calendar day

## Tests

```bash
npm run test:mobile
```

Uses isolated `lendledger-test-*.db` files via `createTestRepository()`.
