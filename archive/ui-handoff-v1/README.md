# UI handoff v1 (superseded)

First interactive handoff of the LendLedger UI (Expo RN design system, single HTML + React via CDN). Approved as "semi-final" in June 2026 and used as the reference for Tasks 5–13 of the MVP1 plan.

**Superseded by:** `design/` (v2) at the repo root — adds the collection calendar, a `--bar-track` token for chart contrast, and minor Home/Onboarding tweaks. Everything else is identical.

Kept for the project history (blog material): this is what the app was first built against, and the diff to v2 documents the feedback loop from the first on-device tests.

## Preview

```bash
cd archive/ui-handoff-v1
./start-preview.sh          # → http://localhost:8765/LendLedger.html
```

Must be served over HTTP (not `file://`). See `design/README.md` for troubleshooting.
