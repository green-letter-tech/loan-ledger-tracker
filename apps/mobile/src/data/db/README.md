# Local SQLite (`expo-sqlite`)

MVP1 on-device storage. Repository layer (Task 8) reads/writes through these tables.

## Files

| File | Role |
|------|------|
| `schema.ts` | TypeScript row types + `SCHEMA_VERSION` |
| `migrations.ts` | v1 DDL + `seedDefaultOwner()` |
| `client.ts` | `initializeDatabase()`, singleton accessor |
| `uuid.ts` | Local UUID generation for primary keys |

## Tables (v1)

- `owners` — MVP1: one row seeded on first launch
- `owner_settings` — theme, reminders, onboarding flag
- `loanees` — borrowers
- `loans` — terms snapshot (`duration_days`, `end_date` from calendar-aware core)
- `daily_entries` — one row per payment day (`UNIQUE(loan_id, entry_date)`)

Migrations use `PRAGMA user_version`. `PRAGMA foreign_keys = ON` on every open.

## Usage

```typescript
import { initializeDatabase, getDatabase } from '../data/db/client';

const { ownerId } = await initializeDatabase();
const db = getDatabase();
```

`App.tsx` calls `initializeDatabase()` on startup (dev preview shows status).

## Next

Task 8 — `LocalLoanRepository` implements CRUD + `createLoan` (generates `daily_entries` via `@lendledger/core` `listEntryDates`).
