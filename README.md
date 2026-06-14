# LendLedger

Cross-platform (Web and Android) lending tracker for SMBs — daily repayment, INR, local-first MVP.

## UI design (canonical)

The approved semi-final UI lives in **`Lend Ledger/`**. This is the reference for Expo implementation.

```bash
cd "Lend Ledger"
./start-preview.sh
```

Open **http://localhost:8765/LendLedger.html** in your browser (Mobile + Light/Dark toggles, Tweaks panel).

Design tokens: `Lend Ledger/app/tokens.css`

## Product spec

`docs/superpowers/specs/2026-05-25-lendledger-design.md`

## Implementation plan (MVP1)

`docs/superpowers/plans/2026-06-06-lendledger-mvp1.md` — step-by-step build guide (foundation-first, Play Store publish)

## Archive

Earlier Stitch prototypes and reference screenshots are in **`archive/`** (not used for implementation).

## Status

- **UI design:** semi-final (`Lend Ledger/`)
- **MVP1 implementation:** in progress on `feature/UI_implementation`
  - ✅ **Task 1** — monorepo workspace root (`package.json`, `tsconfig.base.json`)
  - ✅ **Task 2** — Expo app scaffold (`apps/mobile`, `npm run mobile:web`)
  - ✅ **Task 3** — `packages/core` setup (`npm run test:core`)
  - ✅ **Task 4** — loan calculator + INR formatters (9 unit tests; see `packages/core/README.md`)
  - ✅ **Task 5** — design tokens + ThemeProvider
  - ✅ **Task 6** — UI primitives (Card, PillButton, Avatar, … — see `apps/mobile/src/components/ui/`)
  - ✅ **Task 7** — SQLite schema & migrations (`apps/mobile/src/data/db/`)
  - ✅ **Task 8** — LoanRepository + LocalLoanRepository (`apps/mobile/src/data/repositories/`)
  - ✅ **Task 9** — Tab + stack navigation (`apps/mobile/src/navigation/`)
  - ✅ **Task 10** — Onboarding flow (welcome + reminders)
  - ✅ **Task 11** — Settings screen (theme, reminders, about)
  - ✅ **Task 12** — Calculator screen (live `@lendledger/core` math)
  - ⏳ **Task 13** — Create loan flow (next)
- **Play Store MVP:** planned

Progress tracked in `docs/superpowers/plans/2026-06-06-lendledger-mvp1.md`.

### Core package (`@lendledger/core`)

Shared loan math and INR formatting — **calendar-aware** loan terms (months/years use device calendar + `startDate`). See `packages/core/README.md`.

```bash
npm run test:core    # 21 unit tests (calculator, dates, format, entryStatus)
npm run test:mobile  # 7 tests (repository, reminderTime, calculator defaults)
```

### Mobile theme preview

```bash
npm run mobile:web   # press w — calculator tab shows live ₹3/day example
```

See `apps/mobile/src/navigation/README.md`. Create-loan flow in Task 13.
