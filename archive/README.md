# Archive — project history

Everything here is **kept on purpose** as source material for the LendLedger build story (Medium series) and as a record of decisions. Nothing in `archive/` is compiled, tested, or referenced by the app.

The live design reference is **`design/`** at the repo root; the live docs index is **`docs/README.md`**.

## Contents (chronological)

| Folder | Period | Contents | Why it's here |
|--------|--------|----------|---------------|
| `early-planning/` | May 2026 | First requirements chat export and the initial implementation plan | Shows the original problem framing before the spec was written |
| `stitch-design-references/` | 25 May 2026 | 8 Google Stitch screenshots + the prompt used to generate them | The first visual direction; palette was extracted from these |
| `stitch-prototype-v2/` | late May 2026 | Vite + React + Tailwind prototype exported from Stitch (`lending-tracker (1)`) | Abandoned in favour of a hand-built handoff; useful to contrast "generated" vs "designed" |
| `ui-handoff-v1/` | June 2026 | First interactive HTML/JSX handoff — what Tasks 5–13 were built against | Superseded by `design/` (v2) after the first tester feedback round |
| `mobile-unused/` | June → Sep 2026 | `DevPreviewScreen`, `StackPlaceholderScreen`, `EmptyState` from early app scaffolding | Dead code with zero imports, moved out of `apps/mobile/src` during the Sept 2026 cleanup |

Each folder has its own `README.md` with detail.

## Not tracked

`stitch-prototype-v2/lending-tracker (1)/node_modules` is git-ignored. It was deleted from disk in Sept 2026 (189 MB); run `npm install` inside that folder if you ever want to run the prototype again.
