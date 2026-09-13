# LendLedger v1.1 — Payment variance, Bulk update, Recovery split, Refinance

> **For the implementing agent:** work phase by phase, one commit per task. TDD in `packages/core` first (pure functions), then repository (integration tests against SQLite shim), then screens. Run `npm run typecheck && npm run test:core && npm run test:mobile` before every commit. No `console.log`, no hardcoded hex (use `useTheme().tokens`), no new dependencies without a note in this file. Read `docs/README.md` and the MVP1 plan first for conventions.

**Branch:** `feature/v1.1-bulk-refinance` off `feature/UI_implementation`
**Baseline:** commit `824ced5` — MVP1 feature-complete, 29 core + 39 mobile tests green.

---

## 0. Decisions already made (do not re-open)

| Topic | Decision |
|-------|----------|
| Overpayment (received > expected) | **Informational only.** Does not reduce future dues, does not shorten the loan. Shown per row (`+₹20`) and as a total in a notes section. |
| Underpayment (0 < received < expected) | Existing `partial` status. UI wording becomes **Underpaid**. |
| Principal vs interest recovered | **Proportional.** Every ₹ received splits in the loan's `principal : interest` ratio. |
| Bulk update day | Defaults to today; DatePickerSheet allows backfilling a past day; **future dates blocked**. |
| Refinance deduction | remaining principal **+ unpaid arrears**, shown as a breakdown; lender may **edit the final deduction**. |
| Old loan on refinance | New status **`refinanced`**. Deduction recorded as a **settlement** on the old loan. Remaining future interest recorded as **waived**. **No fake "paid" entries are written.** |
| Terminology | Use **Refinance** in code (`refinanced`, `refinanceLoan`) and UI. See §7. |

---

## 1. Data model — migration v3

`apps/mobile/src/data/db/migrations.ts` — bump `SCHEMA_VERSION` to 3, add:

```sql
ALTER TABLE loans ADD COLUMN closed_at TEXT NULL;                 -- ISO datetime
ALTER TABLE loans ADD COLUMN closed_reason TEXT NULL;             -- 'manual' | 'refinanced'
ALTER TABLE loans ADD COLUMN refinanced_from_loan_id TEXT NULL;   -- set on the NEW loan
ALTER TABLE loans ADD COLUMN refinanced_to_loan_id TEXT NULL;     -- set on the OLD loan
ALTER TABLE loans ADD COLUMN settlement_deduction REAL NULL;      -- cash withheld from new principal (lender-edited final figure)
ALTER TABLE loans ADD COLUMN settlement_principal REAL NULL;      -- principal portion of deduction
ALTER TABLE loans ADD COLUMN settlement_interest REAL NULL;       -- interest portion of deduction (from arrears)
ALTER TABLE loans ADD COLUMN interest_waived REAL NULL;           -- future interest forgiven
CREATE INDEX IF NOT EXISTS idx_loans_refinanced_from ON loans(refinanced_from_loan_id);
```

`LoanStatus` (core `repository-types.ts` **and** `db/schema.ts`) becomes `'active' | 'extended' | 'closed' | 'refinanced'`.

`Loan` interface gains the optional fields above in camelCase (`closedAt`, `closedReason`, `refinancedFromLoanId`, `refinancedToLoanId`, `settlement?: LoanSettlement`). Map in `LocalLoanRepository.rowToLoan` (or equivalent).

**Audit every `status` comparison** before adding the new value — `git grep -n "'closed'\|'active'\|'extended'" apps/mobile/src packages/core/src`. Known touchpoints: `listActiveLoans` (must stay `IN ('active','extended')`), `deleteLoanee` guard (refinanced loans are *not* active → delete allowed), `getDashboardStats` scoping, `loanSummary.ts` active/closed split, `loanStatusLabel.ts`, `StatusPill` variants, `closeLoan` (must set `closed_reason='manual'`, `closed_at`).

Existing `daily_entries` schema is unchanged. Existing `closeLoan` stays; `refinanceLoan` is a new method.

---

## 2. Core: `packages/core` (TDD — write tests first)

### 2.1 `variance.ts` (new)

```ts
export function entryVariance(e: DailyEntry): number            // received − expected (0 when unpaid)
export type EntryDisplayStatus = 'paid' | 'overpaid' | 'underpaid' | 'unpaid'
export function deriveEntryDisplayStatus(e: DailyEntry): EntryDisplayStatus
  // unpaid: received <= 0 · underpaid: 0 < received < expected · paid: === expected · overpaid: > expected
export function summarizeVariance(entries: DailyEntry[]): { overpaidTotal: number; underpaidTotal: number; overpaidDays: number; underpaidDays: number }
```

DB status enum stays `paid | unpaid | partial`; `deriveDailyEntryStatus` unchanged. Display status is derived at render time only.

Tests: exact paid → 0 variance; 120 vs 100 → +20/overpaid; 70 vs 100 → −30/underpaid; unpaid → 0/unpaid; float rounding (33.33 × 3) uses `Math.round(x*100)/100` — reuse whatever rounding helper `extendLoan.ts` uses; do not introduce a second one.

### 2.2 `recovery.ts` (new)

```ts
export interface RecoverySplit { principalRecovered: number; interestRecovered: number; principalOutstanding: number; interestOutstanding: number; overpaidExcess: number }
export function principalShare(loan: Loan, entries: DailyEntry[]): number
  // principal / Σ expected_amount(entries). Use entries sum, NOT loan.totalExpected — extensions change the total.
export function computeRecoverySplit(loan: Loan, entries: DailyEntry[]): RecoverySplit
```

Rules:
- `totalExpected = Σ expected`, `totalInterest = totalExpected − principal` (clamp ≥ 0).
- `received = Σ received`. `principalRecovered = min(principal, received × share)`, `interestRecovered = min(totalInterest, received × (1 − share))`. `overpaidExcess = max(0, received − totalExpected)` (informational; not counted as recovery).
- If `loan.settlement` exists (refinanced): add `settlementPrincipal` to principal recovered and `settlementInterest` to interest recovered; `interestOutstanding` for a refinanced loan is 0 (waived amount is reported separately, not as outstanding).
- Outstanding = principal − recovered, clamped ≥ 0.

Tests: canonical ₹100 → ₹150 (share 2/3): 10 days paid (₹30) → ₹20 principal, ₹10 interest. Zero entries → all zeros, no divide-by-zero. Extended loan (extra entries) → share recomputed. Refinanced loan with settlement → totals include it, outstanding interest 0. Overpay beyond total → capped.

### 2.3 `refinance.ts` (new)

```ts
export interface RefinancePreviewInput { oldLoan: Loan; entries: DailyEntry[]; today: ISODateString; newPrincipal: number; deductionOverride?: number }
export interface RefinancePreview {
  remainingEntries: number; remainingExpected: number; remainingPrincipal: number; interestWaived: number;
  arrears: number; arrearsPrincipal: number; arrearsInterest: number;
  suggestedDeduction: number; deduction: number; cashToHand: number;
  settlementPrincipal: number; settlementInterest: number;
}
export function previewRefinance(input: RefinancePreviewInput): RefinancePreview
```

Definitions (be exact — these drive money):
- **Remaining entries** = entries with `entryDate >= today` **and** `receivedAmount === 0`. (A day already paid, including today, is not remaining.)
- **Arrears** = Σ `max(0, expected − received)` over entries with `entryDate < today`, **plus** today's shortfall if today is partial. Full shortfall is deducted (it was due, principal + interest).
- `share = principalShare(oldLoan, entries)`.
- `remainingPrincipal = share × remainingExpected` — for an unextended daily loan this equals the user's formula `(principal / durationDays) × remainingDays`; add a test asserting ₹100 / 120 days, 80 elapsed → **33.33**.
- `interestWaived = remainingExpected − remainingPrincipal`.
- `arrearsPrincipal = share × arrears`, `arrearsInterest = arrears − arrearsPrincipal`.
- `suggestedDeduction = remainingPrincipal + arrears`. `deduction = deductionOverride ?? suggestedDeduction` (validate 0 ≤ override; override may exceed suggested — lender's call).
- `cashToHand = newPrincipal − deduction` (may be ≤ 0 — see edge cases).
- `settlementPrincipal = remainingPrincipal + arrearsPrincipal`, `settlementInterest = arrearsInterest`. If the lender overrides the deduction, scale both proportionally so they sum to `deduction`.

Tests: the 33.33 case; loanee fully paid up to today (arrears 0); 5 missed days; today partially paid; loan already past `endDate` with unpaid tail (remaining = 0, arrears = tail); override higher/lower; newPrincipal < deduction → negative cashToHand returned, not thrown.

Export all of the above from `packages/core/src/index.ts`; document in `packages/core/README.md` module table.

---

## 3. Repository (`LoanRepository` + `LocalLoanRepository`)

Add to the interface; implement; extend `__tests__/LocalLoanRepository.test.ts` (use `createTestRepository`).

```ts
listEntriesForDate(entryDate: ISODateString): Promise<Array<{ loan: Loan; loanee: Loanee; entry: DailyEntry }>>
  // active + extended loans only; only loans that HAVE an entry on that date (monthly/yearly loans not due are excluded). Sort by loanee name.
bulkUpdateDailyEntries(entryDate: ISODateString, updates: Array<{ loanId: string; receivedAmount: number }>): Promise<{ updated: number; skipped: string[] }>
  // ONE transaction (db.withTransactionAsync). Reuse the same status derivation + rounding as updateDailyEntry (extract a private helper; don't duplicate).
  // Skip (and report) loanIds whose loan is no longer active or has no entry for that date. Never throw for a single bad row — validate all inputs first (finite, ≥ 0), throw before writing if any invalid.
refinanceLoan(input: { oldLoanId: string; newLoan: CreateLoanInput; settlement: { deduction: number; settlementPrincipal: number; settlementInterest: number; interestWaived: number } }): Promise<{ oldLoan: Loan; newLoan: Loan }>
  // ONE transaction: (1) assert old loan is active/extended else throw; (2) create new loan via the same internal path as createLoan (extract createLoanInTx); (3) UPDATE old loan: status='refinanced', closed_reason='refinanced', closed_at=now, refinanced_to_loan_id, settlement_* , interest_waived; (4) UPDATE new loan refinanced_from_loan_id. Old daily_entries untouched.
getLoanChain(loanId: string): Promise<{ previous: Loan | null; next: Loan | null }>
```

`getDashboardStats` gains: `principalRecovered`, `interestRecovered`, `principalOutstanding`, `interestOutstanding` — computed with `computeRecoverySplit` over **active + extended loans only** (same scope as existing `totalReceived`; confirm that scope by reading the method and keep them consistent). Do not double-count refinanced settlements in `totalReceived` — settlements are not cash received.

`closeLoan`: also set `closed_reason='manual'`, `closed_at`.

Repository tests to add: bulk update writes N rows atomically and skips a closed loan; bulk update on a date with no entries returns `updated: 0`; refinance creates linked pair, old status `refinanced`, old entries unchanged, old loan absent from `listActiveLoans`, `deleteLoanee` still blocked while the new loan is active; stats exclude refinanced loan's unpaid entries from `outstanding`.

---

## 4. Screens & navigation

`navigation/types.ts`:
```ts
BulkUpdate: { entryDate?: ISODateString };
RefinanceLoan: { oldLoanId: string };
```
Register both in `RootNavigator`.

### 4.1 Loan detail — variance + recovery + rate (`LoanDetailScreen.tsx`)

- Hero: add **Interest rate** line, e.g. `1% / day · 120 days`. Use existing `RatePeriod` labels.
- New **Recovery** card under the hero: two rows with `ProgressBar` — `Principal recovered ₹x of ₹P`, `Interest recovered ₹y of ₹I`. For a refinanced loan add `Interest waived ₹w` and `Settled via refinance ₹d`.
- History rows: right-side amount shows variance when non-zero: `+₹20` (green) / `−₹30` (amber). Pill text via `deriveEntryDisplayStatus`: Paid / Overpaid / Underpaid / Unpaid. Filter segment labels: `All | Paid | Unpaid | Underpaid` (rename `Partial` in `EntryFilter` type + `filterHistoryEntries` + tests; `Paid` filter includes overpaid).
- Replace the existing overpayment banner with a **Notes** section at the bottom: `Overpaid: +₹X across N days` and `Underpaid: −₹Y across M days` (hide zero lines). Overpayment is informational — do not touch dues.
- Refinanced loan: status pill `Refinanced`; banner `Refinanced on <date> → View new loan` (navigates). New loan created by refinance: banner `Continues loan from <date> → View previous loan`. Action bar hidden for refinanced loans (same as closed).
- Action bar for active/extended: add **Refinance** button beside Extend. Keep Close.

### 4.2 Dashboard (`DashboardScreen.tsx`)

- Quick actions: add pill **Update today** (`icon="checkmark-done"`) → `BulkUpdate`. Three pills won't fit in one row at 390px — move to a 2×2 grid or a horizontally scrolling row; verify on the web preview at phone width.
- New **Recovery** card (cumulative, active loans): `Principal recovered ₹x / ₹P` and `Interest recovered ₹y / ₹I` with progress bars; reuse the same sub-component as loan detail (put it in `components/RecoveryCard.tsx`).
- Legend/wording for the existing four stat cards unchanged.

### 4.3 Bulk update screen (`BulkUpdateScreen.tsx`, new)

Layout: header with date field (opens `DatePickerSheet`, `maxDate = today`); sub-header `N loans due · M not due today` ; **Select all** checkbox row; `FlatList` of rows; `BottomActionBar` with **Submit** (disabled until something changed).

Row state (`utils/bulkUpdate.ts`, pure, tested):
```ts
interface BulkRow { loanId: string; loaneeName: string; expected: number; original: number; checked: boolean; amountText: string }
initialRows(items): checked = entry.received >= expected; amountText = checked ? '' : String(entry.received || 0)
toggleSelectAll(rows, on): on → every row checked; off → every row unchecked with amountText '0'
toggleRow(rows, loanId): uncheck → amountText '0' (or original if original > 0 and < expected)
resolveAmount(row): checked ? expected : parseAmount(amountText)   // parseAmount: trim, allow digits + one dot, else NaN
diff(rows): rows where resolveAmount(row) !== original → payload for bulkUpdateDailyEntries
summary(rows): counts of paid / overpaid / underpaid / unpaid in the diff
```
Behaviour:
- Checked row = paid in full (`expected`). Unchecked row shows an inline amount `TextInput` (numeric keyboard, default `0`). `0` = unpaid, `< expected` = underpaid, `> expected` = overpaid — all allowed.
- Rows already recorded today are pre-filled from DB (see `initialRows`) so re-opening the screen is idempotent.
- Invalid amount (NaN / negative) → row border `tokens.red`, Submit disabled, inline hint.
- Submit → confirm modal listing the `summary` for the chosen date → call `bulkUpdateDailyEntries` with **only the diff** → toast/snackbar `Updated N loans` → navigate back and dashboard refreshes (dashboard already reloads on focus? verify; if not, add `useFocusEffect`).
- Empty state when no loan has an entry for that date.
- Changing the date discards unsaved edits after a confirm if there is a non-empty diff.

### 4.4 Refinance screen (`RefinanceLoanScreen.tsx`, new)

Do **not** fork `CreateLoanScreen`. Extract its term inputs into `components/create-loan/LoanTermsForm.tsx` (principal, rate, rate period, duration, unit, start date) with a value/onChange API, and use it in both screens. This refactor is its own commit with no behaviour change (run the smoke test on Create loan after).

Layout, top to bottom:
1. Card **Current loan** — loanee, principal, rate, `x of N days paid`, arrears if any.
2. `LoanTermsForm` — prefilled with the old loan's terms, start date default today, loanee fixed (not editable).
3. Card **Settlement** (live from `previewRefinance`):
   ```
   Remaining principal   (40 of 120 days)        ₹33.33
   Unpaid arrears        (5 days)                ₹5.00
   ──────────────────────────────────────────────
   Deduct from new loan   [ ₹38.33 ]  ← editable, "Reset" link restores suggestion
   Cash to hand to loanee                        ₹61.67
   Interest waived on old loan                   ₹6.67   (muted)
   ```
   If `cashToHand < 0`: show `Loanee owes ₹x — collect before starting` in amber; Submit still allowed (lender's decision), confirm modal repeats the warning. If `cashToHand === 0`: `No cash changes hands`.
4. `BottomActionBar` → **Start new loan** → confirm modal: `Close loan #… as refinanced and start ₹P for N days? Cash to hand ₹x.` → `refinanceLoan` → navigate to the **new** loan's detail (replace, so back doesn't return to the form).

Validation reuses Create-loan rules (principal > 0, rate ≥ 0, duration ≥ 1, start date not before today? — match whatever Create loan enforces today; don't invent a stricter rule).

The new loan's detail must **not** show ₹33.33 anywhere except the "Continues loan from…" link — settlement figures live on the old loan.

---

## 5. Edge cases (each needs a test or a manual checklist line)

| Area | Case | Expected |
|------|------|----------|
| Variance | received == expected to 2 dp after rounding (e.g. 33.333 stored as 33.33) | `paid`, variance 0 — compare rounded values |
| Variance | expected 0 (custom-extend with ₹0 total) | never divide; display `paid` if received ≥ 0 and expected 0? → treat as `paid` only when received > 0, else `unpaid` |
| Recovery | loan extended with `keep_daily` | share drops (more interest); recovered figures stay monotonic day-over-day |
| Recovery | overpaid beyond total | principal/interest capped; excess in notes only |
| Bulk | monthly loan not due today | excluded from list; counted in "not due" |
| Bulk | two loans same loanee | two rows, both labelled with loan principal/day to disambiguate |
| Bulk | loan closed/refinanced between load and submit | skipped, reported in result; UI shows `1 skipped` |
| Bulk | amount text `1.2.3`, `-5`, `abc`, `  12 ` | first three invalid; last valid 12 |
| Bulk | date in future via param | clamp to today |
| Bulk | 300+ loans | `FlatList` with `keyExtractor`, memoised rows; inputs must not lose focus on re-render (keep row state in a `Map` keyed by loanId, not array index) |
| Bulk | submit with empty diff | button disabled |
| Refinance | old loan already refinanced/closed | screen shows error and returns; repo throws |
| Refinance | today > old `endDate`, unpaid tail | remaining = 0, arrears = tail |
| Refinance | today's entry already paid | not in remaining, not in arrears |
| Refinance | lender overrides deduction to 0 | settlement principal/interest both 0; interest waived still recorded |
| Refinance | new principal < deduction | negative cashToHand shown as "collect ₹x"; allowed after confirm |
| Refinance | app killed mid-transaction | single `withTransactionAsync` — either both loans updated or neither |
| Refinance | delete loanee afterwards | blocked while new loan active; allowed once new loan closed; deleting removes both loans + entries (verify cascade covers the pair) |
| Status | any screen with `switch(status)` | add `refinanced` branch; TypeScript exhaustive check (`never`) so the compiler catches misses |

---

## 6. Phases & commits

| # | Task | Files | Commit |
|---|------|-------|--------|
| 1 | Core `variance.ts` + tests | packages/core | `feat(core): entry variance and display status` |
| 2 | Core `recovery.ts` + tests | packages/core | `feat(core): proportional principal/interest recovery split` |
| 3 | Core `refinance.ts` + tests (incl. 33.33 case) | packages/core | `feat(core): refinance preview` |
| 4 | Migration v3 + `LoanStatus` + `Loan` fields + status audit | mobile db, core types, labels | `feat(mobile): schema v3 for refinance + closed metadata` |
| 5 | Repo: `listEntriesForDate`, `bulkUpdateDailyEntries` + tests | LocalLoanRepository | `feat(mobile): bulk daily-entry update` |
| 6 | Repo: `refinanceLoan`, `getLoanChain`, stats recovery fields + tests | LocalLoanRepository | `feat(mobile): refinance loan transaction + recovery stats` |
| 7 | Loan detail: rate, RecoveryCard, variance rows, Underpaid filter, notes section | LoanDetailScreen, loanDetail.ts + tests | `feat(mobile): loan detail variance, recovery, rate` |
| 8 | Dashboard: RecoveryCard + Update-today pill | DashboardScreen | `feat(mobile): dashboard recovery card and bulk-update entry` |
| 9 | `utils/bulkUpdate.ts` + tests, `BulkUpdateScreen` | new files, navigation | `feat(mobile): bulk update screen` |
| 10 | Extract `LoanTermsForm` (no behaviour change) | create-loan components | `refactor(mobile): extract LoanTermsForm` |
| 11 | `RefinanceLoanScreen` + detail banners/links | new screen, LoanDetailScreen | `feat(mobile): refinance flow` |
| 12 | Smoke-test checklist §11–13, README/plan/core README updates | docs | `docs: v1.1 checklist and progress` |

Stop after phase 6 and after phase 9 for a user review on device (web preview at minimum).

---

## 7. Terminology check — "Refinance"

**Correct.** *Refinance* = a new loan whose proceeds settle an existing one, typically with new terms; that is exactly this flow (old closed, new started, deduction withheld). Nearby terms and why they were not chosen:

- **Renewal / Rollover** — common in Indian daily-finance vocabulary for the same thing; acceptable as a *UI synonym* (e.g. button copy "Renew loan") if testers find "Refinance" unfamiliar. Keep `refinanced` in code either way.
- **Top-up** — wrong: a top-up adds money on top of a *still-running* loan.
- **Restructure** — wrong: changing terms of the *same* loan (that is our Extend feature).
- **Settlement / Foreclosure** — describes only the closing half; use "settlement" for the deduction breakdown, as this plan does.

---

## 8. Open items for the product owner (non-blocking; defaults chosen)

1. Bulk update currently excludes loans with no entry on the chosen date (monthly/yearly). Default: exclude + show count. Alternative: show them greyed out.
2. "Update today" pill placement — default 2×2 grid of quick actions. Alternative: a full-width banner `Record today's collections` above the stat cards.
3. Whether the loanees list should show a chain icon for refinanced loans. Default: no; the loan detail banners are enough for v1.1.
