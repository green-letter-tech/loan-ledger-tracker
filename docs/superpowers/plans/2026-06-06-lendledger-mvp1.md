# LendLedger MVP1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship LendLedger MVP1 — a local-only Android app on Google Play Store with full daily-loan tracking, dashboard, reminders, and light/dark theme — matching the approved `Lend Ledger/` UI handoff.

**Architecture:** Foundation-first monorepo. `packages/core` holds loan math, types, and INR formatting (unit-tested). `apps/mobile` is Expo (React Native + Web). Screens call repository interfaces; MVP1 uses `LocalLoanRepository` backed by `expo-sqlite`. No auth or cloud until Track B.

**Tech Stack:** Expo SDK 52+, TypeScript, React Navigation, expo-sqlite, expo-notifications (Android), react-native-gifted-charts, Vitest (`packages/core`), EAS Build.

**References:**

| Document | Path |
|----------|------|
| Product spec | `docs/superpowers/specs/2026-05-25-lendledger-design.md` |
| Canonical UI handoff | `Lend Ledger/` (`app/tokens.css`, screen JSX files) |
| Git branch | `feature/UI_implementation` |
| Archived Stitch work | `archive/` (reference only) |

---

## Implementation progress

| Task | Status | Notes |
|------|--------|-------|
| **1. Workspace root** | **Done** (2026-06-06) | `package.json`, `tsconfig.base.json`, `.gitignore`, `npm install` OK. Local commit `4bd7467` on `feature/UI_implementation`. |
| **2. Expo app scaffold** | **Done** (2026-06-06) | `apps/mobile` (Expo SDK 56, `@lendledger/mobile`), deps installed (no `@lendledger/core` yet), `app.json` configured, LL icons. `npm run mobile:web` OK. Local commit `bb4f0a1`. |
| **3. `packages/core` setup** | **Done** (2026-06-06) | Vitest + TypeScript wired; `npm run test:core` OK (no tests yet). Local commit `a964ffa`. |
| **4. Calculator with tests** | **Done** (2026-06-06) | `calculateLoan`, INR formatters, 9 unit tests. See `packages/core/README.md`. Local commit pending. |
| 5. Port design tokens | Pending | Next |
| 6–24 | Pending | See phases below |

**Workflow:** One task at a time. Test locally before push; user approves GitHub push after UI verification.

---

## Repository layout (target)

```
lend-ledger/
├── apps/mobile/
│   ├── app/                    # Expo Router or src/ (decided in Task 1)
│   ├── src/
│   │   ├── components/         # Card, PillButton, Avatar, charts wrappers
│   │   ├── navigation/         # Tab + stack navigators
│   │   ├── screens/            # Dashboard, Calculator, Loanees, Settings, stacks
│   │   ├── theme/              # tokens ported from Lend Ledger/app/tokens.css
│   │   ├── data/
│   │   │   ├── db/             # migrations, schema
│   │   │   └── repositories/   # LocalLoanRepository
│   │   └── hooks/              # useTheme, useRepository, useReminders
│   ├── assets/                 # icon.png (LL placeholder), splash
│   └── app.json
├── packages/core/
│   ├── src/
│   │   ├── calculator.ts
│   │   ├── format.ts           # formatINR, groupINR
│   │   ├── dates.ts            # normalize duration/rate to days
│   │   ├── types.ts
│   │   └── index.ts
│   └── __tests__/
├── package.json                # npm workspaces root
└── Lend Ledger/                # design reference (unchanged)
```

---

## UI screen map (handoff → Expo)

| Handoff file | Expo screen |
|--------------|-------------|
| `screens-core.jsx` → `Dashboard`, `DashboardEmpty` | `screens/DashboardScreen.tsx` |
| `screens-core.jsx` → `Calculator` | `screens/CalculatorScreen.tsx` |
| `screens-core2.jsx` → `Loanees` | `screens/LoaneesScreen.tsx` |
| `screens-core2.jsx` → `Settings` | `screens/SettingsScreen.tsx` |
| `screens-stack.jsx` → `Onboarding` | `screens/OnboardingScreen.tsx` |
| `screens-stack.jsx` → `CreateLoan`, `LoaneeForm` | `screens/CreateLoanScreen.tsx`, `LoaneeFormScreen.tsx` |
| `screens-stack.jsx` → `LoaneeDetail` | `screens/LoaneeDetailScreen.tsx` |
| `screens-stack2.jsx` → `LoanDetail` | `screens/LoanDetailScreen.tsx` |
| `screens-stack2.jsx` → `ExtendLoan` | `screens/ExtendLoanScreen.tsx` |
| `screens-stack2.jsx` → `CloseLoanDialog`, `CustomAmountSheet` | `components/CloseLoanModal.tsx`, `components/CustomAmountSheet.tsx` |
| `lib.jsx` primitives | `components/ui/*` |

---

## Phase 1 — Monorepo & Expo scaffold

### Task 1: Workspace root ✅ Done

**Files:**
- Create: `package.json`
- Create: `tsconfig.base.json`
- Modify: `.gitignore`

- [x] **Step 1: Create root `package.json` with workspaces**

```json
{
  "name": "lend-ledger",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "mobile": "npm run start --workspace=@lendledger/mobile",
    "mobile:web": "npm run web --workspace=@lendledger/mobile",
    "mobile:android": "npm run android --workspace=@lendledger/mobile",
    "test:core": "npm run test --workspace=@lendledger/core",
    "typecheck": "npm run typecheck --workspaces --if-present"
  }
}
```

- [x] **Step 2: Extend `.gitignore`**

```
apps/mobile/.expo/
apps/mobile/dist/
*.jks
*.keystore
google-services.json
```

- [x] **Step 3: Verify**

Run: `npm install` (from repo root)  
Expected: workspaces linked, no errors

- [x] **Step 4: Commit** — local `4bd7467` (`chore: add npm workspaces monorepo root`). Not pushed to GitHub.

---

### Task 2: Expo app scaffold ✅ Done

**Files:**
- Create: `apps/mobile/` via `create-expo-app`

- [x] **Step 1: Scaffold Expo app**

```bash
cd apps
npx create-expo-app@latest mobile --template blank-typescript
cd ..
```

- [x] **Step 2: Set package name**

In `apps/mobile/package.json`:

```json
"name": "@lendledger/mobile"
```

- [x] **Step 3: Install core dependencies** (skipped `@lendledger/core` until Task 3; added web deps via `expo install`)

```bash
npm install --workspace=@lendledger/mobile \
  @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs \
  react-native-screens react-native-safe-area-context \
  expo-sqlite expo-notifications expo-device expo-constants \
  react-native-gifted-charts react-native-svg
```

- [x] **Step 4: Configure `app.json`**

```json
{
  "expo": {
    "name": "LendLedger",
    "slug": "lendledger",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "scheme": "lendledger",
    "android": {
      "package": "com.greenletter.lendledger",
      "adaptiveIcon": { "foregroundImage": "./assets/adaptive-icon.png", "backgroundColor": "#3B66F5" }
    },
    "plugins": ["expo-sqlite", ["expo-notifications", { "icon": "./assets/notification-icon.png" }]]
  }
}
```

- [x] **Step 5: Add LL placeholder icon**

Created `assets/icon.png`, `adaptive-icon.png`, `notification-icon.png` — blue `#3B66F5` with white "LL".

- [x] **Step 6: Verify app starts**

Run: `npm run mobile:web` — Metro on `http://localhost:8081` (200 OK).

- [x] **Step 7: Commit** — local only; not pushed to GitHub.

```bash
git add apps/mobile package-lock.json
git commit -m "chore: scaffold Expo mobile app"
```

---

## Phase 2 — `packages/core` (loan math)

### Task 3: Core package setup ✅ Done

**Files:**
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/vitest.config.ts`

- [x] **Step 1: Create `packages/core/package.json`**

```json
{
  "name": "@lendledger/core",
  "version": "0.0.1",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": { "vitest": "^3.0.0", "typescript": "^5.0.0" }
}
```

- [x] **Step 2: Install and link**

```bash
npm install
npm run test:core
```

Expected: no tests yet, vitest exits 0 (`passWithNoTests: true` in vitest config).

- [x] **Step 3: Commit** — local only; not pushed to GitHub.

---

### Task 4: Calculator with tests (TDD) ✅ Done

**Files:**
- Create: `packages/core/src/types.ts`
- Create: `packages/core/src/dates.ts`
- Create: `packages/core/src/calculator.ts`
- Create: `packages/core/src/format.ts`
- Create: `packages/core/__tests__/calculator.test.ts`
- Create: `packages/core/__tests__/format.test.ts`
- Create: `packages/core/src/index.ts`
- Create: `packages/core/README.md`

- [x] **Step 1: Write failing tests**

```typescript
// packages/core/__tests__/calculator.test.ts
import { describe, it, expect } from 'vitest';
import { calculateLoan } from '../src/calculator';

describe('calculateLoan', () => {
  it('computes canonical example: 100 INR, 1%/day, 50 days → ₹3/day', () => {
    const r = calculateLoan({
      principal: 100,
      interestRate: 1,
      ratePeriod: 'day',
      duration: 50,
      durationUnit: 'days',
    });
    expect(r.dailyExpected).toBe(3);
    expect(r.totalInterest).toBe(50);
    expect(r.totalExpected).toBe(150);
    expect(r.durationDays).toBe(50);
  });

  it('normalizes monthly rate to daily', () => {
    const r = calculateLoan({
      principal: 10000,
      interestRate: 30,
      ratePeriod: 'month',
      duration: 30,
      durationUnit: 'days',
    });
    expect(r.durationDays).toBe(30);
    expect(r.dailyExpected).toBeGreaterThan(0);
  });
});
```

- [x] **Step 2: Run tests — expect FAIL**

Run: `npm run test:core`  
Expected: module not found (confirmed before implementation).

- [x] **Step 3: Implement `calculator.ts`**

```typescript
// packages/core/src/calculator.ts
import { normalizeDurationDays, normalizeDailyRate } from './dates';
import type { LoanCalculationInput, LoanCalculationResult } from './types';

export function calculateLoan(input: LoanCalculationInput): LoanCalculationResult {
  const durationDays = normalizeDurationDays(input.duration, input.durationUnit);
  const dailyRate = normalizeDailyRate(input.interestRate, input.ratePeriod);
  const totalInterest = input.principal * dailyRate * durationDays;
  const totalExpected = input.principal + totalInterest;
  const dailyExpected = Math.round((totalExpected / durationDays) * 100) / 100;
  return {
    principal: input.principal,
    interestRate: input.interestRate,
    ratePeriod: input.ratePeriod,
    durationDays,
    dailyRate,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalExpected: Math.round(totalExpected * 100) / 100,
    dailyExpected,
  };
}
```

Implement `dates.ts` per spec §7 (`day` = rate as-is; `month` = rate/30; `year` = rate/365).

- [x] **Step 4: Implement `format.ts`**

Ported `groupINR` / `formatINR` from `Lend Ledger/app/lib.jsx` (Indian lakh grouping).

- [x] **Step 5: Run tests — expect PASS**

Run: `npm run test:core` — **9 tests passed** (5 calculator + 4 format).

- [x] **Step 6: Commit** — local only; not pushed to GitHub.

```bash
git add packages/core docs/superpowers/plans README.md
git commit -m "feat(core): add loan calculator with unit tests"
```

**Implementation notes (Task 4):**

- **Source of truth for math:** `docs/superpowers/specs/2026-05-25-lendledger-design.md` §7; verified against `Lend Ledger/app/screens-core.jsx` calculator logic.
- **`dates.ts`:** `day` → rate% as-is; `month` → rate÷30; `year` → rate÷365; then ÷100 for decimal. Duration: months×30, years×365.
- **`calculator.ts`:** Flat interest; amounts rounded to 2 dp; `dailyExpected` is 0 when `durationDays` is 0.
- **`format.ts`:** Lakh grouping (`1,50,000`); optional paise display for calculator outputs.
- **Package docs:** `packages/core/README.md` — formula, scripts, how to extend with TDD.
- **Mobile wiring:** `@lendledger/core` not yet added to `apps/mobile` — happens when Calculator screen is built (Task 11+).

---

## Phase 3 — Theme & UI primitives

### Task 5: Port design tokens ← **Next**

**Files:**
- Create: `apps/mobile/src/theme/tokens.ts`
- Create: `apps/mobile/src/theme/ThemeProvider.tsx`
- Create: `apps/mobile/src/hooks/useTheme.ts`

- [ ] **Step 1: Map oklch tokens from `Lend Ledger/app/tokens.css`**

Create light and dark token objects:

```typescript
// apps/mobile/src/theme/tokens.ts
export const lightTokens = {
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#1E293B',
  textSoft: '#64748B',
  blue: '#2563EB',
  green: '#10B981',
  amber: '#F59E0B',
  red: '#EF4444',
  radiusCard: 18,
  radiusPill: 999,
} as const;

export const darkTokens = {
  bg: '#0F172A',
  surface: '#1E293B',
  text: '#FFFFFF',
  textSoft: '#94A3B8',
  blue: '#5E72E4',
  green: '#34D399',
  amber: '#F59E0B',
  red: '#EF4444',
  radiusCard: 18,
  radiusPill: 999,
} as const;
```

Convert oklch values from handoff to hex equivalents (use computed values from approved preview).

- [ ] **Step 2: ThemeProvider reads `owner_settings.theme`**

Support `light` | `dark` | `system`; persist via repository (wired in Phase 4).

- [ ] **Step 3: Commit**

---

### Task 6: UI primitives

**Files:**
- Create: `apps/mobile/src/components/ui/Card.tsx`
- Create: `apps/mobile/src/components/ui/PillButton.tsx`
- Create: `apps/mobile/src/components/ui/Avatar.tsx`
- Create: `apps/mobile/src/components/ui/StatusPill.tsx`
- Create: `apps/mobile/src/components/ui/ProgressBar.tsx`
- Create: `apps/mobile/src/components/ui/Logo.tsx`

Port behavior from `Lend Ledger/app/lib.jsx` — match variants: `primary`, `outline`, `green`, `danger`.

- [ ] **Step 1: Build each primitive with theme tokens (no hardcoded hex in screens)**
- [ ] **Step 2: Storybook optional — skip for MVP1**
- [ ] **Step 3: Commit**

---

## Phase 4 — SQLite & repository

### Task 7: Database schema & migrations

**Files:**
- Create: `apps/mobile/src/data/db/schema.ts`
- Create: `apps/mobile/src/data/db/migrations.ts`
- Create: `apps/mobile/src/data/db/client.ts`

- [ ] **Step 1: Define schema matching spec §10**

Tables: `owners`, `owner_settings`, `loanees`, `loans`, `daily_entries`.

```sql
-- migrations v1
CREATE TABLE owners (id TEXT PRIMARY KEY, stytch_user_id TEXT, email TEXT, display_name TEXT);
CREATE TABLE owner_settings (
  owner_id TEXT PRIMARY KEY REFERENCES owners(id),
  default_currency TEXT NOT NULL DEFAULT 'INR',
  theme TEXT NOT NULL DEFAULT 'light',
  reminders_enabled INTEGER NOT NULL DEFAULT 1,
  reminder_times TEXT NOT NULL DEFAULT '["19:00"]',
  reminder_frequency TEXT NOT NULL DEFAULT 'once_daily',
  onboarded INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE loanees (
  id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, name TEXT NOT NULL,
  phone TEXT, notes TEXT, avatar_hue INTEGER DEFAULT 254,
  created_at TEXT NOT NULL
);
CREATE TABLE loans (
  id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, loanee_id TEXT NOT NULL,
  principal REAL NOT NULL, interest_rate REAL NOT NULL, rate_period TEXT NOT NULL,
  duration_days INTEGER NOT NULL, daily_expected REAL NOT NULL, total_expected REAL NOT NULL,
  start_date TEXT NOT NULL, end_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL
);
CREATE TABLE daily_entries (
  id TEXT PRIMARY KEY, loan_id TEXT NOT NULL, entry_date TEXT NOT NULL,
  expected_amount REAL NOT NULL, received_amount REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'unpaid',
  UNIQUE(loan_id, entry_date)
);
```

- [ ] **Step 2: Seed single owner + default settings on first launch**
- [ ] **Step 3: Commit**

---

### Task 8: Repository interface & local implementation

**Files:**
- Create: `packages/core/src/repository-types.ts` (interfaces only)
- Create: `apps/mobile/src/data/repositories/LoanRepository.ts`
- Create: `apps/mobile/src/data/repositories/LocalLoanRepository.ts`

- [ ] **Step 1: Define `LoanRepository` interface**

Methods (minimum):
- `getSettings()` / `updateSettings()`
- `listLoanees()` / `createLoanee()` / `updateLoanee()` / `deleteLoanee(id)` (block if active loans)
- `createLoan(input)` → creates loan + **all** `daily_entries` for `durationDays`
- `getLoan(id)` / `listActiveLoans()`
- `updateDailyEntry(loanId, date, receivedAmount)` → derives status paid|unpaid|partial
- `extendLoan(loanId, days, mode: 'keep_daily' | 'recalculate')`
- `closeLoan(loanId)`
- `getDashboardStats()` → totalLoaned, totalReceived, outstanding, activeCount, chart data

- [ ] **Step 2: Implement `LocalLoanRepository` with expo-sqlite**
- [ ] **Step 3: Integration test — create loan generates N daily entries**

```typescript
// apps/mobile/src/data/repositories/__tests__/LocalLoanRepository.test.ts
it('createLoan inserts one daily_entry per day', async () => {
  const repo = await createTestRepository();
  const loanee = await repo.createLoanee({ name: 'Ravi Kumar', phone: '+91 99999' });
  const loan = await repo.createLoan({
    loaneeId: loanee.id,
    principal: 100,
    interestRate: 1,
    ratePeriod: 'day',
    duration: 50,
    durationUnit: 'days',
    startDate: '2026-06-06',
  });
  const entries = await repo.getDailyEntries(loan.id);
  expect(entries).toHaveLength(50);
});
```

- [ ] **Step 4: Commit**

---

## Phase 5 — Navigation shell

### Task 9: Tab + stack navigation

**Files:**
- Create: `apps/mobile/src/navigation/RootNavigator.tsx`
- Create: `apps/mobile/src/navigation/TabNavigator.tsx`
- Create: `apps/mobile/src/navigation/types.ts`
- Modify: `apps/mobile/App.tsx`

- [ ] **Step 1: Bottom tabs — Home, Calculator, Loanees, Settings**

Match handoff tab bar: active tab uses `blue` text (not filled pill on mobile — per approved `Lend Ledger` design).

- [ ] **Step 2: Stack screens**

Push routes: `LoanDetail`, `CreateLoan`, `LoaneeForm`, `LoaneeDetail`, `ExtendLoan`, `Onboarding`.

- [ ] **Step 3: First-launch gate**

If `owner_settings.onboarded === 0` → show `OnboardingScreen`; else → tabs.

- [ ] **Step 4: Placeholder screens render with theme + empty state**
- [ ] **Step 5: Commit**

---

## Phase 6 — Onboarding & Settings

### Task 10: Onboarding flow

**Files:**
- Create: `apps/mobile/src/screens/OnboardingScreen.tsx`

- [ ] **Step 1: Step 1 — welcome + feature bullets** (match `screens-stack.jsx` Onboarding step 0)
- [ ] **Step 2: Step 2 — reminder setup** (enable toggle, frequency grid, default 7:00 PM)
- [ ] **Step 3: On complete — save settings, set `onboarded = 1`, navigate to Dashboard**
- [ ] **Step 4: Manual test — fresh install shows onboarding once**
- [ ] **Step 5: Commit**

---

### Task 11: Settings screen

**Files:**
- Create: `apps/mobile/src/screens/SettingsScreen.tsx`

- [ ] **Step 1: Appearance — Light / Dark / System segmented control**
- [ ] **Step 2: Reminders — enable toggle, frequency select, time list add/remove**
- [ ] **Step 3: About — version 1.0.0, privacy placeholder link, "data on this device"**
- [ ] **Step 4: Persist all changes via repository**
- [ ] **Step 5: Commit**

---

## Phase 7 — Calculator & create loan

### Task 12: Calculator screen

**Files:**
- Create: `apps/mobile/src/screens/CalculatorScreen.tsx`

- [ ] **Step 1: Inputs — principal, rate, rate period, duration, duration unit**
- [ ] **Step 2: Live outputs from `@lendledger/core` `calculateLoan`**
- [ ] **Step 3: CTA "Save as loan" → navigate to CreateLoan with calc snapshot**
- [ ] **Step 4: Verify 100 / 1% / day / 50 days shows ₹3/day**
- [ ] **Step 5: Commit**

---

### Task 13: Create loan flow

**Files:**
- Create: `apps/mobile/src/screens/CreateLoanScreen.tsx`

- [ ] **Step 1: Loanee picker (existing list + add new inline)**
- [ ] **Step 2: Start date picker (default today)**
- [ ] **Step 3: Confirm summary → `repo.createLoan()`**
- [ ] **Step 4: Navigate to LoanDetail on success**
- [ ] **Step 5: Commit**

---

## Phase 8 — Loanees

### Task 14: Loanees list & form

**Files:**
- Create: `apps/mobile/src/screens/LoaneesScreen.tsx`
- Create: `apps/mobile/src/screens/LoaneeFormScreen.tsx`
- Create: `apps/mobile/src/screens/LoaneeDetailScreen.tsx`

- [ ] **Step 1: Empty state** (match handoff — illustration + Add loanee CTA)
- [ ] **Step 2: Populated list** — avatar, name, phone, active loans, outstanding (amber)
- [ ] **Step 3: Add/edit form** — name (required), phone, notes
- [ ] **Step 4: Delete blocked when active loans exist**
- [ ] **Step 5: Loanee detail → list of loans → tap opens LoanDetail**
- [ ] **Step 6: Commit**

---

## Phase 9 — Loan detail & daily tracking

### Task 15: Loan detail screen

**Files:**
- Create: `apps/mobile/src/screens/LoanDetailScreen.tsx`
- Create: `apps/mobile/src/components/CustomAmountSheet.tsx`

- [ ] **Step 1: Hero gradient header** — principal, daily expected, progress bar, outstanding, collected (match `screens-stack2.jsx`)
- [ ] **Step 2: Today row pinned** — Paid / Unpaid toggles**
- [ ] **Step 3: History list with filter** — All | Paid | Unpaid | Partial
- [ ] **Step 4: Tap row → CustomAmountSheet** for partial/overpayment
- [ ] **Step 5: Overpayment credit display when sum(received) > sum(expected) for paid days**
- [ ] **Step 6: Backfill — update any past day**
- [ ] **Step 7: Commit**

---

### Task 16: Close loan

**Files:**
- Create: `apps/mobile/src/components/CloseLoanModal.tsx`

- [ ] **Step 1: Warning modal with outstanding amount** (match handoff CloseLoanDialog)
- [ ] **Step 2: Confirm → `repo.closeLoan()` sets status `closed`**
- [ ] **Step 3: Commit**

---

## Phase 10 — Extend loan

### Task 17: Extend loan screen

**Files:**
- Create: `apps/mobile/src/screens/ExtendLoanScreen.tsx`

- [ ] **Step 1: Show unpaid/partial summary + remaining balance**
- [ ] **Step 2: Input days to add**
- [ ] **Step 3: Choice cards — Keep same daily vs Recalculate daily**
- [ ] **Step 4: Preview new end date + daily amount**
- [ ] **Step 5: Confirm → insert new `daily_entries`, set status `extended`**

Recalculate logic:
```
remainingBalance = totalExpected - sum(received_amount)
newDaily = remainingBalance / extensionDays  (if recalculate)
```

- [ ] **Step 6: Unit test extend scenarios in `packages/core`**
- [ ] **Step 7: Commit**

---

## Phase 11 — Dashboard & charts

### Task 18: Dashboard screen

**Files:**
- Create: `apps/mobile/src/screens/DashboardScreen.tsx`
- Create: `apps/mobile/src/components/charts/DonutChart.tsx`
- Create: `apps/mobile/src/components/charts/BarChartWeek.tsx`
- Create: `apps/mobile/src/components/charts/LineChartCollections.tsx`

- [ ] **Step 1: Four stat cards** — total loaned, received (green), outstanding (amber), active count
- [ ] **Step 2: Donut — outstanding by loanee** (gifted-charts PieChart)
- [ ] **Step 3: Bar — expected vs received this week**
- [ ] **Step 4: Line — cumulative collections last 30 days**
- [ ] **Step 5: Active loans list → tap LoanDetail**
- [ ] **Step 6: Empty state when no active loans**
- [ ] **Step 7: Quick actions — New calculation, Add loanee**
- [ ] **Step 8: All chart data from `repo.getDashboardStats()` — no hardcoded mock**
- [ ] **Step 9: Commit**

---

## Phase 12 — Android reminders

### Task 19: Local notifications

**Files:**
- Create: `apps/mobile/src/services/reminders.ts`
- Modify: `apps/mobile/src/screens/SettingsScreen.tsx`

- [ ] **Step 1: Request Android notification permission on first enable**
- [ ] **Step 2: Schedule/cancel notifications when settings change**
- [ ] **Step 3: Copy:** "Update today's collections in LendLedger"
- [ ] **Step 4: Frequency presets map to notification schedule**

| Preset | Behavior |
|--------|----------|
| Once daily | One fire per configured time |
| Twice daily | Two fires (first two times) |
| Three times daily | Three fires |
| Custom | All configured times |

- [ ] **Step 5: Test on Android emulator/device — notification fires at set time**
- [ ] **Step 6: Web dev — graceful no-op or browser prompt (not ship criteria)**
- [ ] **Step 7: Commit**

---

## Phase 13 — QA & polish

### Task 20: Manual smoke test checklist

- [ ] Fresh install → onboarding → dashboard empty state
- [ ] Calculator → create loanee → create loan → 50 daily entries exist
- [ ] Mark today paid, yesterday partial, backfill older day
- [ ] Extend loan both modes
- [ ] Close loan with outstanding warning
- [ ] Dashboard numbers match DB
- [ ] Theme toggle persists after kill + reopen
- [ ] Reminder fires on Android

---

### Task 21: Light/dark + edge cases

- [ ] Delete loanee with active loan → blocked with message
- [ ] Custom amount > expected → overpayment credit shown
- [ ] App restart → all data intact

---

## Phase 14 — Play Store publish

### Task 22: EAS & signing setup

**Files:**
- Create: `eas.json`
- Create: `apps/mobile/eas.json` (or root)

- [ ] **Step 1: Install EAS CLI** — `npm i -g eas-cli`
- [ ] **Step 2: `eas login` + `eas build:configure`**
- [ ] **Step 3: Create Android keystore** (EAS managed or upload)
- [ ] **Step 4: Production profile in `eas.json`**

```json
{
  "build": {
    "production": {
      "android": { "buildType": "app-bundle" }
    }
  }
}
```

- [ ] **Step 5: Commit**

---

### Task 23: Play Store listing assets

**Files:**
- Create: `docs/release/play-store-listing.md`
- Create: `docs/release/privacy-policy.md`

- [ ] **Step 1: App name — LendLedger**
- [ ] **Step 2: Short description** (≤80 chars) — draft in listing doc
- [ ] **Step 3: Full description** — daily lending tracker for SMB owners, local data, INR
- [ ] **Step 4: Screenshots** — capture light + dark from Android (phone + 7" tablet if required)
- [ ] **Step 5: Feature graphic** — 1024×500 with LL branding
- [ ] **Step 6: App icon** — replace LL placeholder if ready; else ship placeholder
- [ ] **Step 7: Privacy policy** — disclose local-only storage, no account, no data collection beyond device
- [ ] **Step 8: Content rating questionnaire** — finance/utility, no user-generated public content
- [ ] **Step 9: Commit docs**

---

### Task 24: Build & submit

- [ ] **Step 1: `eas build --platform android --profile production`**
- [ ] **Step 2: Download AAB, test on clean physical device**
- [ ] **Step 3: Create app in Google Play Console** (`com.greenletter.lendledger`)
- [ ] **Step 4: Upload AAB to internal testing → closed → production**
- [ ] **Step 5: Pay $25 developer fee if not already enrolled**
- [ ] **Step 6: Submit for review**
- [ ] **Step 7: Tag release `v1.0.0` in git when live**

---

## Spec coverage checklist

| Spec §2 criterion | Plan task |
|-------------------|-----------|
| Play Store install | Task 24 |
| Onboarding, no login | Task 10 |
| Calculator ₹3/day example | Task 4, 12 |
| Create loan + daily entries | Task 8, 13 |
| Loan detail paid/unpaid/partial | Task 15 |
| Extend keep vs recalculate | Task 17 |
| Close loan warning | Task 16 |
| Dashboard cards + charts | Task 18 |
| Settings reminders | Task 11, 19 |
| Light/dark persists | Task 5, 11 |
| Data survives restart | Task 7, 8 |

---

## Track B (out of scope — document only)

Do not implement during MVP1:

- Stytch auth (Google OAuth, email OTP)
- Supabase Postgres + RLS
- `SupabaseRepository`
- Vercel web hosting
- Sign out in Settings
- Cloud migration

Add `SupabaseRepository implements LoanRepository` in a future plan when Track B starts.

---

## Suggested commit rhythm

One commit per task (or per step for large tasks). Branch: `feature/UI_implementation`. Open PR to `main` when Phase 13 smoke test passes; merge after Play Store internal testing validates.

---

## Execution options

**1. Subagent-driven (recommended)** — fresh agent per task, review between tasks  
**2. Inline** — implement phases sequentially in one session with checkpoints after Phase 4, 9, 13
