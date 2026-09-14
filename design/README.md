# LendLedger — canonical UI design (v2)

**This is the approved UI handoff** the Expo app (`apps/mobile`) is built to match. Keep this folder intact; when app and design disagree, the design is the reference unless a decision in `docs/` says otherwise.

This is an **interactive design handoff** (single HTML + React/Babel via CDN), not the production app. It must be served over HTTP — opening `LendLedger.html` directly (`file://`) will not load the React screens.

## What's here

| Path | Purpose |
|------|---------|
| `LendLedger.html` | Entry point — phone / desktop frame, Light / Dark toggle, Tweaks panel |
| `app/tokens.css` | **Design tokens** (oklch). Ported to `apps/mobile/src/theme/tokens.ts` as hex |
| `app/lib.jsx` | Shared primitives: `formatINR`, icons, `Card`, `PillButton`, `Segmented`, `StatusPill`, charts, sample data |
| `app/screens-core*.jsx` | Tab screens: Home/Dashboard, Calculator, Loanees, Settings |
| `app/screens-stack*.jsx` | Stack screens: Onboarding, Create loan, Loan detail, Extend loan, Custom amount sheet, Close dialog |
| `app/calendar.jsx` | Collection calendar (heatmap) — new in v2 |
| `app/desktop.jsx` | Desktop/sidebar layout (Track B, not in MVP1) |
| `app/tweaks-panel.jsx` | Live design tweaks (accent, font, radius, empty vs populated) |
| `screenshots/` | Reference captures (home, calendar light/dark/desktop) |

## v2 vs v1

v2 supersedes `archive/ui-handoff-v1/`. Changes: collection calendar (`calendar.jsx`), dedicated `--bar-track` token so "Expected" bars contrast in both themes, small copy/spacing tweaks in Home and Onboarding, and calendar screenshots.

## Preview

```bash
cd design
./start-preview.sh          # → http://localhost:8765/LendLedger.html
./start-preview.sh 9000     # custom port
```

If the page is blank: open DevTools → Console; disable Brave Shields for `localhost` (blocks `unpkg.com`); confirm the URL is `http://localhost:…` not `file://`.

## Sample data

`lib.jsx` anchors sample loans to `TODAY = 25 May 2026`. This is design-time data only — the app uses the device date and SQLite.
