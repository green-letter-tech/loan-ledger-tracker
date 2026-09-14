# LendLedger

Daily-repayment lending tracker for small lenders in India. Local-first (SQLite on device), INR, light/dark, Android-first with iOS and web builds from the same Expo codebase.

**Canonical example:** ₹100 lent at 1%/day for 50 days → ₹150 total → **₹3/day**.

## Repository map

| Path | What it is |
|------|------------|
| `apps/mobile/` | Expo app (`@lendledger/mobile`) — screens, navigation, SQLite repository, reminders |
| `packages/core/` | `@lendledger/core` — pure TypeScript loan math, schedules, extend logic, INR formatting (Vitest) |
| `design/` | **Canonical UI handoff (v2)** — interactive HTML/JSX preview + `tokens.css` + screenshots |
| `docs/` | Spec, implementation plan, smoke-test checklist, release docs. **Start at `docs/README.md`** |
| `archive/` | Project history: early planning, Stitch prototype, handoff v1, retired mobile code |

## Quick start

```bash
npm install
npm run mobile            # Expo dev server (press i / a / w)
npm run mobile:web        # web preview at phone width
npm run test:core         # 29 unit tests — loan math
npm run test:mobile       # 39 tests — repository integration + screen helpers
npm run typecheck
```

Design preview:

```bash
cd design && ./start-preview.sh     # → http://localhost:8765/LendLedger.html
```

## Status (September 2026)

- **App:** MVP1 feature-complete on `feature/UI_implementation` — onboarding, calculator, create loan (days / months / years), loanees, loan detail with daily tracking, extend (keep / recalculate / custom), close, dashboard with charts, reminders, settings, privacy policy.
- **v1.1 (`feature/v1.1-bulk-refinance`, code complete, awaiting device testing):** payment variance (overpaid / underpaid), bulk update for a whole day's collections, principal-vs-interest recovery on loan detail and the dashboard, and refinance — a new loan whose proceeds settle the old one, with the deduction and cash-to-hand worked out for the lender. Plan and implementation record: `docs/superpowers/plans/2026-09-13-lendledger-v1.1-bulk-recovery-refinance.md`.
- **Testing:** preview APK shared with first Android testers; feedback round 1 (6 UX fixes) shipped. v1.1 needs a pass over §11–14 of the smoke-test checklist.
- **Next:** Play Store listing assets (Task 23) → production AAB → internal testing (Task 24). Detailed progress table in `docs/superpowers/plans/2026-06-06-lendledger-mvp1.md`.
- **Not in MVP1:** accounts, cloud sync, multi-device (Track B — see spec §3).

## Architecture in one paragraph

Screens never touch SQLite directly. They call the `LoanRepository` interface (defined in `packages/core`), which `apps/mobile/src/data/repositories/LocalLoanRepository.ts` implements over `expo-sqlite`. All money math lives in `packages/core` and is unit-tested; the app only formats and displays. Colours come from `useTheme().tokens`, which mirror `design/app/tokens.css`. That split is what lets a future cloud repository slot in without touching screens.

## Release

- EAS profiles and commands: `docs/release/eas-setup.md`
- Privacy policy: `docs/release/privacy-policy.md` (also in-app)
- Manual QA: `docs/superpowers/checklists/2026-06-14-mvp1-smoke-test.md`

## License

See `LICENSE`.
