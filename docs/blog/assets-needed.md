# Assets needed before publishing Episodes 2–5

Episode 1 already has its 4 diagrams (`01-north-star-math.png` etc.) sitting in `docs/blog/`. Nothing else in the series has images yet — every `[IMAGE NEEDED — …]` / `[SCREENSHOT NEEDED — …]` marker below is a gap in the draft files (`episode-0X-*.md`).

Two kinds of asset, don't mix them up:

- **Diagram** — explanatory graphic, same style as Episode 1's (a formula, a flow, a before/after). Doesn't require the real app; can be made in Figma/Excalidraw/Canva or generated.
- **Screenshot (real app)** — an actual capture from the running LendLedger app (device or simulator), because the point is to prove the feature exists and looks like this.

I checked the repo for existing captures first: `design/screenshots/*.png` and `archive/ui-handoff-v1/screenshots/*.png` exist but are **blank** (captured before the CDN-loaded React design handoff finished rendering — not usable). `archive/stitch-design-references/*.png` **are** real, usable Stitch AI screenshots — flagged below where they help.

---

## Episode 2 — Spec & design ✅ assets ready

| Asset | Path | Status |
|---|---|---|
| Stitch Loanees screen | `docs/blog/06-stitch-loanees.png` | Copied from archive |
| Tokens flow diagram | `docs/blog/07-tokens-flow.png` | Generated (Ep1 style) |

## Episode 3 — Foundation

| Marker in draft | Type | What's needed |
|---|---|---|
| TDD flow (failing test → calculator → pass, ₹3/day) | Diagram | New. Same visual language as Episode 1's math image — three steps, canonical example highlighted. |
| Repository/testing diagram (screens → LoanRepository → SQLite on device, and → in-memory test double in tests) | Diagram | New. Variant of Episode 1's architecture diagram with a second branch for the test shim. |

## Episode 4 — Building the product

| Marker in draft | Type | What's needed |
|---|---|---|
| Decisions table (overpayment, recovery split, bulk defaults, refinance deduction) | Diagram | New. Can literally be a styled version of the markdown table already in the draft. |
| ₹33.33 recovery-split math | Diagram | New. Same style as Episode 1's ₹100→₹3/day formula card. |
| Refinance settlement breakdown | Diagram | New. Render the "Remaining principal / Arrears / Deduct / Cash to hand / Waived" block as a receipt-style card. |
| Loan Detail with Recovery card + variance rows | **Real screenshot** | Capture from the app: open a loan with some paid/overpaid/underpaid days, recovery card visible. |
| Bulk Update screen | **Real screenshot** | Capture from the app: a day with several loans due, a few rows checked/typed. |

## Episode 5 — Ship & polish to v1.2

| Marker in draft | Type | What's needed |
|---|---|---|
| Crash investigation timeline | Diagram | New. 4 steps: version mismatch → linker error → marker-file bug → Release-only workaround. |
| Animated dock collapsing/expanding | **Real screenshot(s) or short clip** | Scroll down (dock collapses to pill) and scroll up / switch tabs (dock expands). Two stills or a short screen recording. |
| Payment mode picker | **Real screenshot** | Open a payment entry, show the cash / UPI / bank picker. |
| Search + sort on the loanee list | **Real screenshot** | Loanees screen with the search field populated and sort menu open. |
| Overdue reminder notification | **Real screenshot** | Android notification shade showing the "N loans overdue" reminder text. |

---

## Fastest path to publishing without waiting on new diagrams

If you want to publish sooner: the 4 real-app screenshots for Episodes 4–5 (loan detail, bulk update, dock, payment mode/search/notification) matter far more to a reader than the explanatory diagrams — a reader believes "this app exists and looks like this" from a screenshot much faster than from any illustration. Diagrams can be added or even skipped later; missing screenshots are the bigger publish blocker.

Minimum for a credible v1 publish of Ep4–5: **5 real screenshots** —
1. Loan detail (recovery card + variance)
2. Bulk update screen
3. Dock collapsed vs expanded (can be one before/after image)
4. Payment mode picker
5. Overdue reminder notification (or search/sort — pick one)

Everything else can ship as plain text with the diagram markers removed, or added in a later pass.
