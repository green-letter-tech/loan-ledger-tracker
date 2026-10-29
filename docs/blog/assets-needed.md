# Visual assets for Episodes 1–5

Naming convention: `epN-XX-description.png`, where `N` is the episode and `XX` is the order in which the visual appears.

## Generated or archived assets — ready

### Episode 1

1. `ep1-01-north-star-math.png` — ₹100 at 1% per day for 50 days → ₹3/day.
2. `ep1-02-scope-mvp1-vs-later.png` — must ship vs sounds cool.
3. `ep1-03-local-first-architecture.png` — screens → repository → on-device SQLite.
4. `ep1-04-series-map.png` — five-episode journey.

### Episode 2

1. `ep2-01-stitch-loanees.png` — original AI-generated Stitch Loanees screen.
2. `ep2-02-tokens-flow.png` — `tokens.css` → `theme/tokens.ts` → screens.

### Episode 3

1. `ep3-01-test-first-flow.png` — write the ₹3/day test, watch it fail, make it pass.
2. `ep3-02-repository-testing.png` — same repository seam on the phone and in SQLite integration tests.

### Episode 4

1. `ep4-01-money-rules.png` — four product rules fixed before implementation.
2. `ep4-02-remaining-principal-math.png` — ₹33.33 remaining-principal calculation.
3. `ep4-03-refinance-settlement.png` — deduction, cash to hand, waived interest, linked loans.

### Episode 5

1. `ep5-01-crash-investigation.png` — version mismatch → linker red herring → marker-file bug → Release workaround.

---

## Real app captures still needed

Use fictional names, phone numbers, and amounts. Keep the same device frame and theme within each episode. Crop out status-bar details if they expose personal information.

### Episode 4

#### `ep4-04-loan-detail-recovery.png`

Open one active or extended loan and capture a single screen containing:

- loanee name and loan status;
- interest rate / term line;
- Recovery card with **Principal recovered** and **Interest recovered**;
- at least three visible history rows:
  - one Paid;
  - one Underpaid with a negative variance;
  - one Overpaid with a positive variance;
- no personal data from a real borrower.

If the Recovery card and history rows do not fit together, take two captures named:

- `ep4-04a-loan-detail-recovery.png`
- `ep4-04b-payment-variance-rows.png`

#### `ep4-05-bulk-update.png`

Open **Update today's collections** and capture:

- selected date visible;
- summary such as `N loans due`;
- at least four fictional loanees;
- one checked / paid-in-full row;
- one ₹0 / unpaid row;
- one partial custom amount;
- Submit button visible.

### Episode 5

#### `ep5-02-dock-expanded.png`

Capture a scrollable main screen at the top:

- animated dock fully expanded;
- all tab labels visible;
- populated app content above it.

#### `ep5-03-dock-collapsed.png`

Use the same screen, theme, and data after scrolling down:

- dock collapsed into the narrower icon-only pill;
- enough page content visible to make the scroll state clear.

These two will be shown side by side.

#### `ep5-04-payment-mode-picker.png`

Open a payment entry and capture:

- amount / payment context visible;
- payment-mode picker open;
- **Cash**, **UPI**, and **Bank Transfer** visible;
- one option visibly selected.

#### `ep5-05-loanee-search-sort.png`

On the Loanees screen:

- enter a fictional name fragment in Search;
- keep filtered results visible;
- open the sort control;
- show **Name**, **Outstanding**, and **Active** options in the same frame.

#### `ep5-06-overdue-notification.png`

From an Android notification shade:

- LendLedger app name or icon visible;
- reminder text includes the number of overdue loans;
- timestamp visible if clean;
- unrelated notifications and personal information hidden or cropped.

---

## Publish status

- Episodes 1–3: all planned visuals are ready.
- Episode 4: three diagrams ready; two real app captures needed.
- Episode 5: crash diagram ready; five real app captures needed.
