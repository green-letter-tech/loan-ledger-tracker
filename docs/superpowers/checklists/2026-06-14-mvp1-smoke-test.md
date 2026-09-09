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
- [ ] Loan detail opens after creation
- [ ] Loan has correct number of daily entries (50 for 50-day loan)

## 3. Daily tracking

- [ ] **Today** row is pinned on loan detail
- [ ] Mark today **Paid** updates status and progress
- [ ] Mark today **Unpaid** clears payment
- [ ] Tap a history row → custom amount sheet
- [ ] Partial amount marks day as **Partial**
- [ ] Amount ≥ expected marks day as **Paid** (overpayment allowed)
- [ ] Overpayment credit banner appears when received > expected on paid days
- [ ] History filter works: All | Paid | Unpaid | Partial
- [ ] Can backfill an older day via custom amount

## 4. Extend loan

- [ ] Extend loan screen shows unpaid/partial summary and balance
- [ ] **Keep same daily** adds entries at original daily amount
- [ ] **Recalculate daily** spreads remaining balance over new days
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
- [ ] Weekly bar chart shows expected vs received
- [ ] 30-day collections line chart renders
- [ ] Active loans list (top 3) opens loan detail on tap
- [ ] Quick actions: New calculation → Calculator; Loanee → add form

## 8. Settings & theme

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
