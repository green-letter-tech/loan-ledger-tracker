# LendLedger MVP1 — Manual smoke test checklist

Run on **Android device or emulator** (primary ship target). Repeat key flows on **web** where noted.

**Build:** `npm run mobile:android` or `npm run mobile:web`  
**Reset data (web):** clear site data / hard refresh after DB reset if needed

---

## 1. First launch & onboarding

- [ ] Fresh install shows onboarding welcome step
- [ ] Continue reaches reminder setup step
- [ ] Reminder times are editable (12h and 24h input formats)
- [ ] Complete onboarding lands on Home tab
- [ ] Home shows **empty dashboard** (no active loans)

## 2. Calculator → loanee → loan

- [ ] Calculator shows live ₹ outputs (canonical: 100 INR, 1%/day, 50 days → ₹3/day)
- [ ] **Save as loan** opens create-loan flow with terms prefilled
- [ ] Can add or select a loanee and create the loan
- [ ] Tapping **Start date** opens the calendar pop-up; month arrows and **Today** work; picked date shows in the field
- [ ] Loan detail opens after creation
- [ ] Loan has correct number of daily entries (50 for 50-day loan)
- [ ] Monthly / yearly term creates one entry per period (e.g. 3 months → 3 entries)

## 3. Daily tracking

- [ ] **Today** row is pinned on loan detail
- [ ] Mark today **Paid** updates status and progress
- [ ] Mark today **Unpaid** clears payment
- [ ] Tap a history row → custom amount sheet
- [ ] Partial amount marks day as **Partial**
- [ ] Amount ≥ expected marks day as **Paid** (overpayment allowed)
- [ ] Overpayment credit banner appears when received > expected on paid days
- [ ] History filter works: All | Paid | Unpaid | Partial (Paid newest-first; others oldest-first)
- [ ] Can backfill an older day via custom amount
- [ ] Future-dated rows are dimmed, tagged **Scheduled**, and not tappable
- [ ] Pinned next-due card still lets you record tomorrow's payment early; it then appears in **Paid**

## 4. Extend loan

- [ ] Extend loan screen shows unpaid/partial summary and balance
- [ ] **Keep same daily** adds entries at original daily amount
- [ ] **Recalculate daily** spreads remaining balance over new days
- [ ] **Custom amount** — enter a total; preview shows total ÷ days; confirm disabled for empty / zero / non-numeric
- [ ] Preview shows new end date and daily amount before confirm
- [ ] After extend, loan status is **extended** and new days appear in history

## 5. Close loan

- [ ] **Close loan** opens warning modal with outstanding amount
- [ ] **Keep loan open** dismisses modal without changes
- [ ] **Close anyway** sets loan to closed and returns to previous screen
- [ ] Closed loan no longer appears in active loans / dashboard active count

## 6. Loanees

- [ ] Loanees tab empty state → add loanee works
- [ ] Populated list shows active loan count and outstanding (amber)
- [ ] Loanee detail shows profile, stats, and active loans
- [ ] Edit loanee saves name/phone/notes
- [ ] Delete blocked while active loans exist (hint shown)
- [ ] Delete works after all loans closed (loanee + closed loan data removed)

## 7. Dashboard

- [ ] Four stat cards match expectations (loaned, received, outstanding, active count)
- [ ] Donut chart reflects outstanding by loanee
- [ ] Weekly bar chart shows expected vs received — **Expected** bars clearly visible against the card in both Light and Dark
- [ ] 30-day collections line chart renders
- [ ] Active loans list (top 3) opens loan detail on tap
- [ ] Quick actions: **New calculation** (calculator icon) → Calculator; **Loanee** (+ icon) → add form

## 8. Settings & theme

- [ ] Bottom tab bar (Home, Calculator, Loanees, Settings) fully visible — labels not cropped on Android gesture-navigation devices
- [ ] Theme Light / Dark / System applies immediately
- [ ] Kill app and reopen → theme preference persists
- [ ] Reminder toggle off cancels scheduled notifications
- [ ] Reminder toggle on requests permission (Android) and schedules notifications
- [ ] Changing frequency or times reschedules notifications

## 9. Reminders (Android)

- [ ] Enable reminders → system permission prompt appears (first time)
- [ ] Set a time 1–2 minutes ahead → notification fires with copy:  
      **"Update today's collections in LendLedger"**
- [ ] Once daily → one notification at first configured time
- [ ] Twice daily → two notifications (first two times)
- [ ] Three times daily → three notifications (first three times)
- [ ] Custom → one notification per configured time

## 10. Data integrity

- [ ] App restart → all loanees, loans, and daily entries intact
- [ ] Dashboard numbers consistent with loan detail totals after changes
- [ ] Dashboard theme toggle persists after kill + reopen (matches Settings)
- [ ] Upgrade from a v1.0 build (schema v2 database) → migration to v3 runs, existing loans intact

---

# v1.1 — variance, bulk update, recovery, refinance

## 11. Payment variance

- [ ] Record exactly the expected amount → row pill reads **Paid**, no variance shown
- [ ] Record more than expected (e.g. ₹120 on ₹100) → pill **Overpaid**, `+₹20` in green
- [ ] Record less than expected (e.g. ₹70 on ₹100) → pill **Underpaid**, `−₹30` in amber
- [ ] History filter tabs read `All | Paid | Unpaid | Underpaid`; Paid includes overpaid days
- [ ] Notes section at the bottom totals both: `Overpaid +₹X across N days`, `Underpaid −₹Y across M days`
- [ ] Overpaying does **not** reduce a later day's expected amount or shorten the loan

## 12. Recovery

- [ ] Loan detail hero shows the interest rate and term (e.g. `1% / day · 120 days`)
- [ ] Loan detail Recovery card: principal and interest recovered with progress bars
- [ ] ₹100 → ₹150 loan, 10 of 50 days paid → **₹20 principal, ₹10 interest** recovered
- [ ] Dashboard Recovery card totals match the sum across active loans
- [ ] Extending a loan (keep daily) increases total interest; recovered figures never drop

## 13. Bulk update

- [ ] Dashboard **Update today's collections** opens the screen with today preselected
- [ ] Sub-header counts loans due and, when relevant, `N not due` (monthly/yearly loans)
- [ ] **Select all as paid** checks every row; tapping again clears every row to 0
- [ ] Unchecking one row reveals an amount input defaulting to 0 (or the recorded part payment)
- [ ] Typing `1.2.3`, `-5` or `abc` → red border, inline `Invalid`, Submit disabled
- [ ] Typing more than expected → `+₹X` hint in green, allowed
- [ ] Submit disabled until something changes; button shows the pending count
- [ ] Confirm modal lists the breakdown (`N paid · N overpaid · N underpaid`)
- [ ] Submit → alert reports how many loans were updated; loan detail reflects each amount
- [ ] Reopening the screen for the same date shows no pending changes (idempotent)
- [ ] Backdate via the picker → past date loads; future dates are not selectable
- [ ] Changing the date with unsaved edits → discard confirmation appears
- [ ] Date with no scheduled payments → **Nothing due** empty state
- [ ] Two loans for the same loanee → two rows, each labelled with its principal
- [ ] With 50+ rows, typing in one input does not steal focus or reset other rows

## 14. Refinance

- [ ] Loan detail action bar shows **Extend**, **Refinance**, **Close loan**
- [ ] Refinance screen prefills the old loan's terms; loanee is fixed
- [ ] ₹100 / 120 days with 80 days paid → Remaining principal **₹33.33**, Interest waived ₹6.67, Cash to hand ₹66.67
- [ ] With 5 missed days → arrears line appears, deduction rises to ₹38.33, cash to hand ₹61.67
- [ ] Editing the deduction updates cash to hand live; **Reset** restores the suggestion
- [ ] Deduction larger than the new principal → amber `collect ₹X before starting`, confirm repeats the warning
- [ ] Confirm → navigates to the **new** loan; Back does not return to the form
- [ ] New loan detail shows `Continues loan from …` and no settlement figures
- [ ] Old loan detail: status pill **Refinanced**, `Refinanced … view new loan` banner, no action bar
- [ ] Old loan Recovery card shows `Settled via refinance` and `Interest waived`
- [ ] Old loan's remaining days still read Unpaid in history but are excluded from dashboard outstanding
- [ ] Old loan no longer appears in the loanee's active loans or the dashboard active count
- [ ] Refinancing the same loan twice is refused
- [ ] Deleting the loanee is blocked while the new loan runs; after closing it, both loans are removed

---

## Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Build / commit | |
| Android device / OS | |
| Result | Pass / Fail |
| Notes | |
