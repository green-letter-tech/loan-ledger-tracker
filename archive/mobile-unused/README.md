# Unused mobile code (moved out of `apps/mobile/src`)

Scaffolding from early MVP1 tasks that had **zero imports** once the real screens landed. Moved here during the September 2026 cleanup rather than deleted, so the build-up of the app is still readable in the repo.

These files are **not compiled or type-checked** — they sit outside `apps/mobile` and reference paths that no longer resolve.

| File | Was | Replaced by |
|------|-----|-------------|
| `DevPreviewScreen.tsx` | Task 5–6 dev harness showing every UI primitive + DB status before navigation existed | Real screens under `apps/mobile/src/screens/` (Task 9+) |
| `StackPlaceholderScreen.tsx` | Task 9 stub rendered for stack routes until each screen was built | `LoanDetailScreen`, `CreateLoanScreen`, `ExtendLoanScreen`, `LoaneeFormScreen`, `LoaneeDetailScreen` |
| `EmptyState.tsx` | Generic empty-state component from the primitives pass | Each screen has a purpose-built empty state (e.g. dashboard "No loans yet", loanees list) |

Also removed in the same cleanup (small enough to live in git history only):

- `splitEntriesByToday` — deprecated alias of `splitEntriesForDisplay` in `utils/loanDetail.ts`
- `expo-device` dependency — never imported
