# Google Stitch — LendLedger UI Prompt

Copy sections below into [Stitch](https://stitch.withgoogle.com/) in order: **Project brief first**, then **one prompt per screen**.

---

## How to use Stitch with this project

1. Paste **§1 Project brief** as the first prompt (full app context).
2. Generate **light mode** screens first for all 8 screens.
3. Prompt: *"Apply the same layouts in dark mode using the dark theme tokens from the brief."*
4. Refine **one screen at a time** with small follow-up prompts.
5. Export to Figma or PNG → save under `docs/design/`.

**Target frame:** Mobile-first **390×844** (Android phone). Also note: designs will be implemented in **Expo React Native** (rounded touch targets, bottom navigation).

---

## §1 — Project brief (paste first)

```
Design a complete mobile app UI for "LendLedger" — an owner-only lending tracker for small business owners in India.

PRODUCT CONTEXT:
- The owner lends money short-term and collects repayments DAILY (cash, offline).
- Example: lend ₹100 at 1% per day for 50 days → loanee pays ₹3 per day (flat interest, principal + interest spread evenly).
- Owner tracks multiple "loanees" (borrowers), marks each day Paid/Unpaid/Partial, sees dashboard totals and charts.
- NO login screen in MVP1 — app opens directly to onboarding or home.
- Currency: INR only (₹ symbol, Indian number formatting like ₹1,23,456.00).
- Audience: busy SMB owner; UI must be simple, scannable, trustworthy.

DESIGN SYSTEM:
- Style: clean, modern, professional fintech-lite — not playful, not corporate-boring.
- Colors: black, white, blue, green — use gradients and softer shades of these colors on cards and headers.
- Typography: system default sans-serif, soft readable hierarchy.
- Buttons: fully rounded pill buttons; primary actions use blue or green gradient fills.
- Cards: rounded corners (16px), subtle shadow, optional subtle gradient backgrounds.
- Animations: imply subtle press states and hover states (for web); smooth transitions between states.
- Themes: design BOTH light mode and dark mode with an in-app theme toggle in Settings.
  - Light: white/light gray backgrounds, dark text, blue/green accents.
  - Dark: near-black backgrounds (#121212 style), light text, muted gradient accents.
- App icon placeholder: simple "LL" monogram in header/splash (will be replaced later).
- NO parallax effects in MVP1.

NAVIGATION:
- Bottom tab bar with 4 tabs: Home, Calculator, Loanees, Settings
- Stack screens for: Loan Detail, Create Loan, Extend Loan, Add/Edit Loanee, Onboarding

SCREENS TO DESIGN (all screens in this project):
1. Onboarding (first launch — reminder setup)
2. Dashboard / Home (summary cards + 3 charts + active loans list)
3. Calculator (inputs + live results + Save as loan CTA)
4. Create / Confirm Loan (loanee picker, start date, summary)
5. Loan Detail (progress header + daily day list with Paid/Unpaid)
6. Extend Loan (modal/screen — extend options)
7. Loanees list + Add/Edit loanee form
8. Settings (theme toggle, reminders config, about)

Use realistic Indian sample data: loanees named "Ravi Kumar", "Priya Sharma"; amounts in ₹; dates in DD MMM YYYY format.

Deliver high-fidelity mobile screens suitable for handoff to React Native developers.
```

---

## §2 — Screen-by-screen prompts (paste one at a time)

### Screen 1: Onboarding

```
Design the LendLedger onboarding flow (2 screens max, mobile 390x844, light mode first).

Screen A — Welcome:
- "LL" monogram logo top center
- App name "LendLedger" and tagline: "Track daily lending, simply."
- Short bullet: track loanees, daily payments, dashboard insights
- Primary pill button: "Get started"
- Skip text not needed (first launch only)

Screen B — Reminder setup:
- Title: "Stay on top of collections"
- Subtitle explaining daily logging nudge
- Toggle: Enable reminders (on by default)
- Frequency selector: Once daily | Twice daily | Three times daily | Custom
- Time picker row(s) — default single time 7:00 PM; show ability to add more time slots with + button
- Primary button: "Continue to dashboard"

Match LendLedger design system: blue/green gradients, rounded buttons, soft typography.
```

### Screen 2: Dashboard

```
Design the LendLedger Dashboard (Home tab, mobile, light mode).

Top app bar:
- "LendLedger" or "LL" logo left
- Theme toggle icon (sun/moon) right

Four summary stat cards in a 2x2 grid:
- Total Loaned (₹2,45,000 sample)
- Total Received (₹1,89,500)
- Outstanding (₹55,500) — accent color (amber/red tint ok)
- Active Loans (4)

Below cards, three chart sections:
1. Donut chart card: "Outstanding by loanee" — legend with names and ₹
2. Bar chart card: "This week — Expected vs Received"
3. Line chart card: "Collections — last 30 days"

Section: "Active loans" list — 3 rows showing loanee name, daily ₹ amount, progress bar, outstanding ₹. Tap affordance.

FAB or prominent buttons: "New calculation" and "Add loanee"

Include empty state variant note in caption: illustration + "No loans yet" + CTA to calculator.

Rounded cards, gradient accents, green for positive received, blue for primary actions.
```

### Screen 3: Calculator

```
Design the LendLedger Calculator tab (mobile, light mode).

Header: "Loan calculator"

Input form in a card:
- Principal amount (₹) — large numeric input, placeholder 10000
- Interest rate — numeric input, placeholder 1
- Rate period dropdown — default "Per day" (options: per day, per month, per year)
- Duration — numeric input, placeholder 50
- Duration unit dropdown — default "Days" (days, months, years)

Results card (live calculated feel, highlighted):
- Daily payment: ₹3.00 (hero size, green)
- Total repayable: ₹150.00
- Total interest: ₹50.00
- Helper text showing example math for 100 @ 1%/day / 50 days

Sticky bottom primary pill button: "Save as loan" (gradient blue-green)

Clean fintech layout, generous spacing, rounded inputs.
```

### Screen 4: Confirm loan

```
Design the LendLedger "Confirm loan" screen (push screen after Save as loan, mobile, light mode).

Header: back arrow + "Create loan"

Section — Select loanee:
- Searchable dropdown or list picker
- Chips for existing loanees: Ravi Kumar, Priya Sharma
- Text button: "+ Add new loanee"

Section — Loan terms summary (read-only card from calculator):
- Principal ₹100, Rate 1% per day, Duration 50 days
- Daily ₹3, Total ₹150

Section — Start date:
- Date picker row, default "Today, 25 May 2026" with calendar icon
- Helper: "Daily entries start from this date"

Bottom actions:
- Primary: "Confirm & create loan"
- Secondary text: "Back to calculator"

Use LendLedger card style and INR formatting.
```

### Screen 5: Loan detail

```
Design the LendLedger Loan Detail screen (mobile, light mode).

Header: back + loanee name "Ravi Kumar" + status badge "Active"

Summary card:
- Principal ₹10,000 | Daily expected ₹300
- Progress: "32 of 50 days logged" with progress bar
- Outstanding: ₹5,400 (prominent if > 0)
- Overpayment credit line (small, green) if applicable

Segment or filter: All | Paid | Unpaid | Partial (optional)

Day list (scrollable):
- Today row PINNED at top with highlight border: "Today, 25 May" — Expected ₹300 — toggle Paid/Unpaid side by side
- Past rows: date, expected, status pill (Paid green, Unpaid gray, Partial amber), received amount if partial
- Tap row hint for custom amount sheet

Bottom action bar:
- Outlined button: "Extend loan"
- Text/destructive: "Close loan"

Design bottom sheet variant: "Custom amount" with ₹ input, Save/Cancel — for partial payments.

Large touch targets for Paid/Unpaid toggles — owner uses this daily.
```

### Screen 6: Extend loan

```
Design the LendLedger Extend Loan screen or full-screen modal (mobile, light mode).

Title: "Extend loan"
Subtitle: loanee name + current end date

Summary card:
- Unpaid days: 8
- Partial days: 2
- Remaining balance: ₹2,400

Input:
- "Add days" — stepper or numeric input (default 20)

Choice cards (radio):
- Option A: "Keep same daily amount" — ₹300/day — subtitle: new days use original daily payment
- Option B: "Recalculate daily amount" — ₹120/day preview — subtitle: spread remaining balance over new days

Preview card:
- New end date
- New daily amount (if option B)
- Additional days count

Primary: "Confirm extension"
Secondary: Cancel

Use clear visual distinction between the two options.
```

### Screen 7: Loanees

```
Design the LendLedger Loanees tab (mobile, light mode).

Header: "Loanees" + add icon button

List of loanee cards:
- Avatar circle with initials (RK, PS)
- Name, optional phone
- Subtext: "2 active loans · ₹45,000 outstanding"
- Chevron right

Tap state → Loanee detail sub-screen (optional second frame):
- Contact info, notes
- List of active and closed loans
- Edit button, Delete button (disabled state with tooltip "Close active loans first")

Empty state: "No loanees yet" + Add loanee CTA

Floating or header add button for "+ Add loanee" form modal:
- Name (required), Phone (optional), Notes (optional)
- Save / Cancel

Clean list UI, rounded cards, LendLedger colors.
```

### Screen 8: Settings

```
Design the LendLedger Settings tab (mobile, light mode).

Header: "Settings"

Sections in grouped list cards:

APPEARANCE
- Theme: segmented control Light | Dark | System

REMINDERS
- Enable reminders — toggle on
- Frequency — dropdown (Once daily, Twice daily, Three times daily, Custom)
- Notification times — list of times with swipe-to-delete, + Add time button
- Sample rows: 7:00 PM, 9:00 AM

ABOUT
- App version 1.0.0
- Privacy policy (link row, chevron)
- Short note: "All data stored on this device"

No sign out button (MVP1 has no accounts).

Include dark mode variant of this screen when prompted separately.
```

---

## §3 — Follow-up refinement prompts (use after initial generation)

```
Make all primary buttons fully rounded pills with subtle gradient (blue to green). Add pressed state at 95% scale.
```

```
Increase touch target size for Paid/Unpaid toggles on Loan Detail to minimum 44px height.
```

```
Apply dark mode to all 8 screens: dark backgrounds, light text, preserve accent gradients at lower saturation.
```

```
Add component states for Loan Detail day row: Paid (green check), Unpaid (empty circle), Partial (amber, shows "₹150 of ₹300").
```

```
Design empty states for Dashboard (no loans) and Loanees (no loanees) as separate frames.
```

```
Design the "Close loan" warning dialog: "₹1,200 still outstanding. Close anyway?" with Cancel and Close loan buttons.
```

---

## §4 — Export checklist

After Stitch approval, export/save:

- [ ] All screens light mode PNG
- [ ] All screens dark mode PNG
- [ ] Figma file (if using paste-to-Figma)
- [ ] Note any design tokens (hex codes for primary, success, warning, backgrounds)
- [ ] Save images to `docs/design/` per project rule for attached images
