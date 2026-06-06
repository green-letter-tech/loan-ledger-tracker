# LendLedger — canonical UI design

**This is the approved semi-final UI** for the LendLedger app. Keep this folder intact; Expo implementation should match these screens and tokens.

This folder is an **interactive design handoff** (not the production Expo app). It must be opened through a **local web server** — opening `LendLedger.html` directly (`file://`) will not load the React screens.

## Quick start

From this folder:

```bash
./start-preview.sh
```

Then open in Brave:

**http://localhost:8765/LendLedger.html**

If you see `Address already in use`, the preview may already be running — try opening that URL directly. The script will also auto-pick the next free port (8766, 8767, …).

Or pick a port manually:

```bash
./start-preview.sh 9000
```

## What you should see

- Dark workspace with **LendLedger** title bar
- Toggles: **Mobile / Desktop**, **Light / Dark**
- Phone mockup with dashboard, calculator, loanees, settings
- **Tweaks** panel (bottom-right) for accent, font, radius, sample data

## If it still fails

1. Open DevTools → **Console** (Cmd+Option+J) and check for red errors
2. Disable Brave Shields for `localhost` (can block `unpkg.com` React/Babel CDN)
3. Confirm the URL is `http://localhost:8765/...` not `file:///...`
