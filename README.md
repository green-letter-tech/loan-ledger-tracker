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
  - ⏳ **Task 3** — `packages/core` setup (next)
- **Play Store MVP:** planned

Progress tracked in `docs/superpowers/plans/2026-06-06-lendledger-mvp1.md`.
