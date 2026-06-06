# Navigation

React Navigation shell for LendLedger MVP1.

## Structure

- **Root stack** (`RootNavigator`) — onboarding gate + push screens
- **Bottom tabs** (`TabNavigator`) — Home, Calculator, Loanees, Settings

Active tab uses `tokens.blue` text (no filled pill), matching `Lend Ledger/LendLedger.html`.

## First launch

`owner_settings.onboarded === 0` → `Onboarding` screen. Otherwise → `Main` tabs.

## Push routes

`LoanDetail`, `CreateLoan`, `LoaneeForm`, `LoaneeDetail`, `ExtendLoan` — placeholders until Tasks 13–17.

## Types

Param lists live in `types.ts`. Use `RootStackScreenProps` / `TabScreenProps` in screens.
