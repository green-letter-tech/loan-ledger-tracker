# LendLedger docs — story index

This folder (plus `archive/` and `design/`) holds the full record of how LendLedger was built: the problem, the decisions, the plan, the design iterations, the release path. It is organised so the Medium series can be written straight from it after MVP1 ships.

## Reading order

| # | Stage | Where | Blog angle |
|---|-------|-------|------------|
| 1 | **Problem & first framing** | `archive/early-planning/` — requirements chat export + first plan | Who lends ₹100 at 1%/day, why spreadsheets fail them, why local-first |
| 2 | **Spec** | `superpowers/specs/2026-05-25-lendledger-design.md` | Success criteria, scope cuts (no auth, no cloud), canonical loan math (§7), lifecycle rules (§8) |
| 3 | **Design: generated → designed** | `archive/stitch-design-references/` → `archive/stitch-prototype-v2/` → `archive/ui-handoff-v1/` → `design/` | Stitch screenshots, why the Tailwind export was dropped, building a token-driven HTML handoff, v1→v2 diff |
| 4 | **Architecture & plan** | `superpowers/plans/2026-06-06-lendledger-mvp1.md` | Monorepo, `core` vs `mobile`, repository interface, foundation-first 24-task plan, progress table with commit hashes |
| 5 | **Build log** | `git log` on `feature/UI_implementation` (one commit per task) + per-folder READMEs in `apps/mobile/src/*/README.md`, `packages/core/README.md` | TDD on loan math, calendar-aware durations, SQLite migrations, hand-rolled charts, notifications |
| 6 | **QA** | `superpowers/checklists/2026-06-14-mvp1-smoke-test.md` | What a manual smoke test for a finance app looks like |
| 7 | **Release** | `release/eas-setup.md`, `release/privacy-policy.md` | EAS profiles, sideloading an APK to testers over WhatsApp, iOS without a paid Apple account, Play Store listing |
| 8 | **Feedback round 1** | plan → "Post-MVP feedback round 1 — 2026-09" | Six things real users hit in week one and how each was fixed |
| 9 | **Cleanup & what's next** | plan → "Repo cleanup — 2026-09-13"; spec §3 Track B | Removing dead code, keeping history, planning cloud sync |

## Folder layout

```
docs/
├── README.md                      ← this index
├── superpowers/
│   ├── specs/     2026-05-25-lendledger-design.md      product + technical spec
│   ├── plans/     2026-06-06-lendledger-mvp1.md        24-task plan, progress table, feedback log
│   └── checklists/2026-06-14-mvp1-smoke-test.md       manual QA
└── release/
    ├── eas-setup.md               build profiles + commands
    └── privacy-policy.md          Play Store privacy text (mirrored in-app)
```

Attached screenshots and mockups from working sessions are saved as `docs/*.png` (see `.cursor/rules/save-attached-images.mdc`).

## Key decisions worth a paragraph each

- **Local-first, no login** — spec §3/§5. Target users won't create accounts; SQLite on device with a `LoanRepository` seam for a later cloud implementation.
- **Calendar-aware terms** — `packages/core/src/dates.ts`. "30 days" ≠ "1 month" from Feb 15; avoids false delinquency.
- **Payment schedule per unit** — `paymentSchedule.ts` + DB migration v2. Daily loans get one row per day; monthly/yearly get one row per period.
- **Pinned "next due" row, not "today"** — lets a borrower pay early while future rows stay locked (feedback round 1, item 6).
- **Extend: keep / recalculate / custom** — `extendLoan.ts` → `resolveExtendDaily`. Custom total was a direct tester request.
- **Tokens over hex** — every colour flows from `design/app/tokens.css` → `theme/tokens.ts`. Chart contrast bug was fixed by adding a token (`barTrack`), not by patching a component.
- **Hand-rolled charts** — line chart is raw `react-native-svg`; donut still uses `react-native-gifted-charts`. Consolidating to one library is an open improvement.

## Screenshots

- Design reference captures: `design/screenshots/`
- Early Stitch direction: `archive/stitch-design-references/`
- v1 handoff captures: `archive/ui-handoff-v1/screenshots/`
- Device screenshots for the Play Store listing: to be added under `docs/release/` in Task 23
