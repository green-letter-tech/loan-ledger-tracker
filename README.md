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
  - ⏳ **Task 10** — Onboarding flow (next)
- **Play Store MVP:** planned

Progress tracked in `docs/superpowers/plans/2026-06-06-lendledger-mvp1.md`.

### Core package (`@lendledger/core`)

Shared loan math and INR formatting — **calendar-aware** loan terms (months/years use device calendar + `startDate`). See `packages/core/README.md`.

```bash
npm run test:core    # 21 unit tests (calculator, dates, format, entryStatus)
npm run test:mobile  # 3 integration tests (LocalLoanRepository)
```

### Mobile theme preview

```bash
npm run mobile:web   # press w — tab shell + placeholder screens (onboarding on fresh install)
```

See `apps/mobile/src/navigation/README.md`. Calculator UI in Task 12; onboarding flow in Task 10.
