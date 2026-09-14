# LendLedger MVP1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship LendLedger MVP1 — a local-only Android app on Google Play Store with full daily-loan tracking, dashboard, reminders, and light/dark theme — matching the approved `design/` UI handoff.

**Architecture:** Foundation-first monorepo. `packages/core` holds loan math, types, and INR formatting (unit-tested). `apps/mobile` is Expo (React Native + Web). Screens call repository interfaces; MVP1 uses `LocalLoanRepository` backed by `expo-sqlite`. No auth or cloud until Track B.

**Tech Stack:** Expo SDK 52+, TypeScript, React Navigation, expo-sqlite, expo-notifications (Android), react-native-gifted-charts, Vitest (`packages/core`), EAS Build.

**References:**

| Document | Path |
|----------|------|
| Product spec | `docs/superpowers/specs/2026-05-25-lendledger-design.md` |
| Canonical UI handoff | `design/` (v2 — `app/tokens.css`, screen JSX files, `calendar.jsx`) |
| Previous handoff (v1) | `archive/ui-handoff-v1/` — what Tasks 5–13 were built against |
| Git branch | `feature/UI_implementation` |
| Archived Stitch work | `archive/` (reference only) |
| Story index (blog source) | `docs/README.md` |

---

## Implementation progress

| Task | Status | Notes |
|------|--------|-------|
| **1. Workspace root** | **Done** (2026-06-06) | `package.json`, `tsconfig.base.json`, `.gitignore`, `npm install` OK. Local commit `4bd7467` on `feature/UI_implementation`. |
| **2. Expo app scaffold** | **Done** (2026-06-06) | `apps/mobile` (Expo SDK 56, `@lendledger/mobile`), deps installed (no `@lendledger/core` yet), `app.json` configured, LL icons. `npm run mobile:web` OK. Local commit `bb4f0a1`. |
| **3. `packages/core` setup** | **Done** (2026-06-06) | Vitest + TypeScript wired; `npm run test:core` OK (no tests yet). Local commit `a964ffa`. |
| **4. Calculator with tests** | **Done** (2026-06-06) | `calculateLoan`, INR formatters, 9 unit tests. See `packages/core/README.md`. Local commit `ef9ec82`. |
| **5. Port design tokens** | **Done** (2026-06-06) | `ThemeProvider`, `useTheme`, theme preview screen. Local commit `0c660c5`. |
| **6. UI primitives** | **Done** (2026-06-06) | Card, PillButton, Avatar, StatusPill, ProgressBar, Logo + `DevPreviewScreen`. Local commit `355cb91`. |
| **7. SQLite schema** | **Done** (2026-06-06) | v1 tables, migrations, owner seed. Commit `52ea09e`. v2 migration (`duration_unit`, `duration_count`) added in Task 13. |
| **8. Repository** | **Done** (2026-06-07) | `LoanRepository` (core) + `LocalLoanRepository` (expo-sqlite), 14 integration tests. Commit `75b2457`. |
| **9. Navigation** | **Done** (2026-06-07) | Tab + native-stack shell. Commit `764f2b5`. |
| **10. Onboarding** | **Done** (2026-06-08) | Welcome + reminders steps. Commit `1ce081d`. |
| **11. Settings** | **Done** (2026-06-08) | Theme, reminders, about, privacy policy link. Commit `5dd9724`. |
| **12. Calculator** | **Done** (2026-06-09) | Live `@lendledger/core` math. Commit `667b784`. |
| **13. Create loan** | **Done** (2026-06-14) | Loanee pick/add, start date, months/years terms, payment schedule. Commit `1cf7e11`. |
| **14. Loanees** | **Done** (2026-06-14) | List, form, detail, delete-guard. Commit `b7a2d3b`. |
| **15. Loan detail** | **Done** (2026-06-14) | Hero, pinned next-due row, history filters, custom amount sheet, backfill, overpayment credit. Commit `b7a2d3b`. |
| **16. Close loan** | **Done** (2026-06-14) | Warning modal with outstanding. Commit `b7a2d3b`. |
| **17. Extend loan** | **Done** (2026-06-14) | Keep / recalculate modes + core tests. Commit `b7a2d3b`. **Custom-total mode** added 2026-09 (`6a01f86`). |
| **18. Dashboard** | **Done** (2026-06-14) | Stat cards, donut, weekly bars, 30-day line, active loans. Commit `b7a2d3b`. |
| **19. Reminders** | **Done** (2026-06-14) | `expo-notifications`, permission flow, presets. Commit `b7a2d3b`. Android device test still to confirm. |
| **20. Smoke test checklist** | **Done** (2026-06-14) | `docs/superpowers/checklists/2026-06-14-mvp1-smoke-test.md`. Full pass on device pending. |
| **21. Edge cases** | **Done** (2026-06-14) | Delete-guard, overpayment credit, restart persistence covered by tests + checklist. |
| **22. EAS setup** | **Done** (2026-06-14) | `eas.json` (dev / preview APK / production AAB), `docs/release/eas-setup.md`, preview APK built and shared via WhatsApp. |
| **Feedback round 1** | **Done** (2026-09-09) | 6 UX fixes from first testers — see [Post-MVP feedback](#post-mvp-feedback-round-1--2026-09). Commit `6a01f86`. |
| **Repo cleanup** | **Done** (2026-09-13) | Design → `design/`, dead code → `archive/mobile-unused/`, docs refreshed. |
| 23. Play Store listing | Pending | **Next** — title, descriptions, screenshots, feature graphic |
| 24. Build & submit | Pending | Production AAB → Play Console internal testing |

**Workflow:** One task at a time. Test locally before push; user approves GitHub push after UI verification.

---

## Repository layout (as built, 2026-09)

```
lend-ledger/
├── apps/mobile/                # Expo app (@lendledger/mobile)
│   ├── App.tsx                 # bootstrap: repository → theme → navigation
│   ├── src/
│   │   ├── components/         # sheets, modals, charts/, ui/ primitives, create-loan/, reminders/
│   │   ├── navigation/         # RootNavigator (stack) + TabNavigator
│   │   ├── screens/            # 12 screens + onboarding/ steps
│   │   ├── theme/              # tokens.ts (ported from design/app/tokens.css), ThemeProvider
│   │   ├── data/db/            # schema, migrations (v1, v2), client
│   │   ├── data/repositories/  # LoanRepository factory, LocalLoanRepository (+ tests)
│   │   ├── services/           # reminders (expo-notifications) + pure scheduling logic
│   │   ├── utils/              # screen-level pure helpers (+ tests)
│   │   ├── context/, hooks/, constants/, content/, types/
│   │   └── test-utils/         # node SQLite shim, createTestRepository
│   ├── plugins/                # withIosLocalNotificationsOnly (free Apple ID builds)
│   ├── assets/                 # icon, splash, adaptive icon
│   ├── app.json · eas.json
├── packages/core/              # @lendledger/core — pure TS, Vitest
│   ├── src/                    # calculator, dates, paymentSchedule, entryStatus, extendLoan, format, types, repository-types
│   └── __tests__/
├── design/                     # canonical UI handoff v2 (HTML + JSX + tokens.css + screenshots)
├── docs/                       # spec, plan, checklists, release docs — see docs/README.md
├── archive/                    # history: early planning, Stitch prototype, handoff v1, unused mobile code
└── package.json                # npm workspaces root
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

Ported `groupINR` / `formatINR` from `design/app/lib.jsx` (Indian lakh grouping).

- [x] **Step 5: Run tests — expect PASS**

Run: `npm run test:core` — **9 tests passed** (5 calculator + 4 format).

- [x] **Step 6: Commit** — local only; not pushed to GitHub.

```bash
git add packages/core docs/superpowers/plans README.md
git commit -m "feat(core): add loan calculator with unit tests"
```

**Implementation notes (Task 4):**

- **Source of truth for math:** `docs/superpowers/specs/2026-05-25-lendledger-design.md` §7; verified against `design/app/screens-core.jsx` calculator logic.
- **`dates.ts`:** Rate: `day` / `month÷30` / `year÷365`. Duration: **calendar-aware** (`computeEndDate`, `listEntryDates`); see README.
- **`calculator.ts`:** Flat interest; amounts rounded to 2 dp; `dailyExpected` is 0 when `durationDays` is 0.
- **`format.ts`:** Lakh grouping (`1,50,000`); optional paise display for calculator outputs.
- **Package docs:** `packages/core/README.md` — formula, scripts, how to extend with TDD.
- **Mobile wiring:** `@lendledger/core` not yet added to `apps/mobile` — happens when Calculator screen is built (Task 11+).

---

## Phase 3 — Theme & UI primitives

### Task 5: Port design tokens ✅ Done

**Files:**
- Create: `apps/mobile/src/theme/tokens.ts`
- Create: `apps/mobile/src/theme/types.ts`
- Create: `apps/mobile/src/theme/ThemeProvider.tsx`
- Create: `apps/mobile/src/hooks/useTheme.ts`
- Create: `apps/mobile/src/screens/ThemePreviewScreen.tsx`
- Create: `apps/mobile/src/theme/README.md`
- Modify: `apps/mobile/App.tsx`

- [x] **Step 1: Map oklch tokens from `design/app/tokens.css`**

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

- [x] **Step 2: ThemeProvider reads `owner_settings.theme`**

Supports `light` | `dark` | `system` via React state + `useColorScheme`. SQLite persistence wired in **Task 11 (Settings)**.

- [x] **Step 3: Verify UI**

Run: `npm run mobile:web` → theme preview with Light/Dark/System chips and brand swatches.

- [x] **Step 4: Commit** — local only; not pushed to GitHub.

**Implementation notes (Task 5):**

- oklch → hex conversion script; full palette in `tokens.ts` (not the shortened plan snippet).
- `ThemePreviewScreen` is temporary until Task 9 navigation replaces `App.tsx` shell.
- **When you can test UI:** see table below.

**UI testing timeline**

| Task | What you can test in Expo (`npm run mobile:web`) |
|------|--------------------------------------------------|
| **5** ✅ | Theme preview — toggle light/dark/system, see brand colors |
| **6** ✅ | UI primitives (Card, PillButton, etc.) on `DevPreviewScreen` |
| **9** | Tab bar + placeholder screens (Home, Calculator, Loanees, Settings) |
| **10–11** | Onboarding + Settings (theme persists) |
| **12** | **Calculator screen** — live ₹ outputs from `@lendledger/core` |
| **13+** | Create loan, loan detail, dashboard with real data |

Canonical design reference remains the `design/` HTML preview until Expo screens reach parity.

**Duration / calendar model (updated — calendar-aware):**

- **Decision (2026-06-06):** Replaced fixed 30/365 duration with **device calendar** math in `@lendledger/core`.
- `months` / `years` require `startDate`; `endDate` and `durationDays` derived from real calendar boundaries.
- Example: Feb 15 + **30 days** → ends Mar 16; Feb 15 + **1 month** → ends Mar 15 (different terms, different daily ₹).
- `listEntryDates()` + `computeEndDate()` ready for Tasks 7–8; `end_date` always matches last `daily_entry`.
- HTML handoff calculator still uses fixed 30/365 for preview — Expo app uses calendar-aware core (intentional UX upgrade).
- Full detail: `packages/core/README.md`, tests in `__tests__/dates.test.ts`.

---

### Task 6: UI primitives ✅ Done

**Files:**
- Create: `apps/mobile/src/components/ui/Card.tsx`
- Create: `apps/mobile/src/components/ui/PillButton.tsx`
- Create: `apps/mobile/src/components/ui/Avatar.tsx`
- Create: `apps/mobile/src/components/ui/StatusPill.tsx`
- Create: `apps/mobile/src/components/ui/ProgressBar.tsx`
- Create: `apps/mobile/src/components/ui/Logo.tsx`
- Create: `apps/mobile/src/components/ui/index.ts`
- Create: `apps/mobile/src/components/ui/README.md`
- Create: `apps/mobile/src/screens/DevPreviewScreen.tsx`
- Modify: `apps/mobile/App.tsx`
- Add dep: `expo-linear-gradient`

Port behavior from `design/app/lib.jsx` — match variants: `primary`, `outline`, `green`, `danger`.

- [x] **Step 1: Build each primitive with theme tokens (no hardcoded hex in screens)**
- [x] **Step 2: Storybook optional — skip for MVP1**
- [x] **Step 3: Verify UI** — `npm run mobile:web` → `DevPreviewScreen`
- [x] **Step 4: Commit** — local only; not pushed to GitHub.

**Implementation notes (Task 6):**

- Gradients via `expo-linear-gradient` using `tokens.gradPrimary` / `gradBlue` / `gradGreen`.
- `DevPreviewScreen` replaces `ThemePreviewScreen` until Task 9 navigation.
- Docs: `apps/mobile/src/components/ui/README.md`.

---

## Phase 4 — SQLite & repository

### Task 7: Database schema & migrations ✅ Done

**Files:**
- Create: `apps/mobile/src/data/db/schema.ts`
- Create: `apps/mobile/src/data/db/migrations.ts`
- Create: `apps/mobile/src/data/db/client.ts`
- Create: `apps/mobile/src/data/db/uuid.ts`
- Create: `apps/mobile/src/data/db/README.md`
- Modify: `apps/mobile/App.tsx`, `DevPreviewScreen.tsx`

- [x] **Step 1: Define schema matching spec §10**

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

- [x] **Step 2: Seed single owner + default settings on first launch**

`seedDefaultOwner()` — theme `system`, reminders on, 7:00 PM default, `onboarded = 0`.

- [x] **Step 3: Verify** — `npm run mobile:web` → DevPreview shows `Database: ready`.

- [x] **Step 4: Commit** — local only; not pushed to GitHub.

**Implementation notes (Task 7):**

- `PRAGMA user_version` migrations; `foreign_keys` enabled.
- Indexes on `loanees.owner_id`, `loans` FKs, `daily_entries.loan_id`.
- `initializeDatabase()` called from `App.tsx`; idempotent singleton.
- Task 8 will use `listEntryDates()` from `@lendledger/core` when inserting `daily_entries`.
- Docs: `apps/mobile/src/data/db/README.md`.

---

### Task 8: Repository interface & local implementation ✅

**Files:**
- Create: `packages/core/src/repository-types.ts` (interfaces only)
- Create: `packages/core/src/entryStatus.ts` (`deriveDailyEntryStatus`)
- Create: `apps/mobile/src/data/repositories/LoanRepository.ts`
- Create: `apps/mobile/src/data/repositories/LocalLoanRepository.ts`
- Create: `apps/mobile/src/test-utils/expo-sqlite-node.ts` (Vitest adapter)
- Create: `apps/mobile/src/data/repositories/__tests__/LocalLoanRepository.test.ts`

- [x] **Step 1: Define `LoanRepository` interface**

Methods (minimum):
- `getSettings()` / `updateSettings()`
- `listLoanees()` / `createLoanee()` / `updateLoanee()` / `deleteLoanee(id)` (block if active loans)
- `createLoan(input)` → creates loan + **all** `daily_entries` for `durationDays`
- `getLoan(id)` / `listActiveLoans()`
- `updateDailyEntry(loanId, date, receivedAmount)` → derives status paid|unpaid|partial
- `extendLoan(loanId, days, mode: 'keep_daily' | 'recalculate')`
- `closeLoan(loanId)`
- `getDashboardStats()` → totalLoaned, totalReceived, outstanding, activeCount, chart data

- [x] **Step 2: Implement `LocalLoanRepository` with expo-sqlite**
- [x] **Step 3: Integration test — create loan generates N daily entries**

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

- [x] **Step 4: Commit** (`feat(mobile): add LocalLoanRepository with integration tests`)

---

## Phase 5 — Navigation shell

### Task 9: Tab + stack navigation ✅

**Files:**
- Create: `apps/mobile/src/navigation/RootNavigator.tsx`
- Create: `apps/mobile/src/navigation/TabNavigator.tsx`
- Create: `apps/mobile/src/navigation/types.ts`
- Create: `apps/mobile/src/context/AppProvider.tsx`
- Create: placeholder tab + stack screens under `apps/mobile/src/screens/`
- Modify: `apps/mobile/App.tsx`

- [x] **Step 1: Bottom tabs — Home, Calculator, Loanees, Settings**

Match handoff tab bar: active tab uses `blue` text (not filled pill on mobile — per approved `design/` handoff).

- [x] **Step 2: Stack screens**

Push routes: `LoanDetail`, `CreateLoan`, `LoaneeForm`, `LoaneeDetail`, `ExtendLoan`, `Onboarding`.

- [x] **Step 3: First-launch gate**

If `owner_settings.onboarded === 0` → show `OnboardingScreen`; else → tabs.

- [x] **Step 4: Placeholder screens render with theme + empty state**
- [x] **Step 5: Commit** (`feat(mobile): add tab and stack navigation shell`)

---

## Phase 6 — Onboarding & Settings

### Task 10: Onboarding flow ✅

**Files:**
- Modify: `apps/mobile/src/screens/OnboardingScreen.tsx`
- Create: `apps/mobile/src/screens/onboarding/*`
- Create: `apps/mobile/src/components/BottomActionBar.tsx`, `Toggle.tsx`
- Create: `apps/mobile/src/constants/reminders.ts`, `utils/reminderTime.ts`

- [x] **Step 1: Step 1 — welcome + feature bullets** (match `screens-stack.jsx` Onboarding step 0)
- [x] **Step 2: Step 2 — reminder setup** (enable toggle, frequency grid, default 7:00 PM)
- [x] **Step 3: On complete — save settings, set `onboarded = 1`, navigate to Dashboard**
- [x] **Step 4: Manual test — fresh install shows onboarding once**
- [x] **Step 5: Commit** (`feat(mobile): add onboarding welcome and reminder steps`)

---

### Task 11: Settings screen ✅

**Files:**
- Modify: `apps/mobile/src/screens/SettingsScreen.tsx`
- Create: `apps/mobile/src/components/SegmentedControl.tsx`

- [x] **Step 1: Appearance — Light / Dark / System segmented control**
- [x] **Step 2: Reminders — enable toggle, frequency select, time list add/remove**
- [x] **Step 3: About — version 1.0.0, privacy placeholder link, "data on this device"**
- [x] **Step 4: Persist all changes via repository**
- [x] **Step 5: Commit** (`feat(mobile): add settings screen with persisted preferences`)

---

## Phase 7 — Calculator & create loan

### Task 12: Calculator screen ✅

**Files:**
- Modify: `apps/mobile/src/screens/CalculatorScreen.tsx`
- Create: `apps/mobile/src/components/calculator/CalculatorInputs.tsx`
- Create: `apps/mobile/src/types/calculator.ts`

- [x] **Step 1: Inputs — principal, rate, rate period, duration, duration unit**
- [x] **Step 2: Live outputs from `@lendledger/core` `calculateLoan`**
- [x] **Step 3: CTA "Save as loan" → navigate to CreateLoan with calc snapshot**
- [x] **Step 4: Verify 100 / 1% / day / 50 days shows ₹3/day**
- [x] **Step 5: Commit** (`feat(mobile): add live loan calculator screen`)

---

### Task 13: Create loan flow ✅

**Files:**
- Modify: `apps/mobile/src/screens/CreateLoanScreen.tsx`
- Create: `apps/mobile/src/components/create-loan/*`

- [x] **Step 1: Loanee picker (existing list + add new inline)**
- [x] **Step 2: Start date picker (default today)**
- [x] **Step 3: Confirm summary → `repo.createLoan()`**
- [x] **Step 4: Navigate to LoanDetail on success**
- [x] **Step 5: Commit** (`feat(mobile): add create loan flow`)

---

## Phase 8 — Loanees

### Task 14: Loanees list & form ✅

**Files:**
- Create: `apps/mobile/src/screens/LoaneesScreen.tsx`
- Create: `apps/mobile/src/screens/LoaneeFormScreen.tsx`
- Create: `apps/mobile/src/screens/LoaneeDetailScreen.tsx`

- [x] **Step 1: Empty state** (match handoff — illustration + Add loanee CTA)
- [x] **Step 2: Populated list** — avatar, name, phone, active loans, outstanding (amber)
- [x] **Step 3: Add/edit form** — name (required), phone, notes
- [x] **Step 4: Delete blocked when active loans exist**
- [x] **Step 5: Loanee detail → list of loans → tap opens LoanDetail**
- [x] **Step 6: Commit** — `b7a2d3b`

---

## Phase 9 — Loan detail & daily tracking

### Task 15: Loan detail screen ✅

**Files:**
- Create: `apps/mobile/src/screens/LoanDetailScreen.tsx`
- Create: `apps/mobile/src/components/CustomAmountSheet.tsx`

- [x] **Step 1: Hero gradient header** — principal, daily expected, progress bar, outstanding, collected (match `screens-stack2.jsx`)
- [x] **Step 2: Today row pinned** — Paid / Unpaid toggles (pinned row is the *next due* entry, so early payment is allowed)
- [x] **Step 3: History list with filter** — All | Paid | Unpaid | Partial (Paid newest-first, others oldest-first)
- [x] **Step 4: Tap row → CustomAmountSheet** for partial/overpayment
- [x] **Step 5: Overpayment credit display when sum(received) > sum(expected) for paid days**
- [x] **Step 6: Backfill — update any past day**
- [x] **Step 7: Commit** — `b7a2d3b`; future-dated rows locked (“Scheduled”) in `6a01f86`

---

### Task 16: Close loan ✅

**Files:**
- Create: `apps/mobile/src/components/CloseLoanModal.tsx`

- [x] **Step 1: Warning modal with outstanding amount** (match handoff CloseLoanDialog)
- [x] **Step 2: Confirm → `repo.closeLoan()` sets status `closed`**
- [x] **Step 3: Commit** — `b7a2d3b`

---

## Phase 10 — Extend loan

### Task 17: Extend loan screen ✅

**Files:**
- Create: `apps/mobile/src/screens/ExtendLoanScreen.tsx`

- [x] **Step 1: Show unpaid/partial summary + remaining balance**
- [x] **Step 2: Input days to add**
- [x] **Step 3: Choice cards — Keep same daily vs Recalculate daily** (+ **Custom total** added in feedback round 1)
- [x] **Step 4: Preview new end date + daily amount**
- [x] **Step 5: Confirm → insert new `daily_entries`, set status `extended`**

Recalculate logic (`packages/core/src/extendLoan.ts` → `resolveExtendDaily`):
```
remainingBalance = totalExpected - sum(received_amount)
newDaily = remainingBalance / extensionDays   (recalculate)
newDaily = customTotal / extensionDays        (custom)
```

- [x] **Step 6: Unit test extend scenarios in `packages/core`** — `__tests__/extendLoan.test.ts`
- [x] **Step 7: Commit** — `b7a2d3b`, custom mode `6a01f86`

---

## Phase 11 — Dashboard & charts

### Task 18: Dashboard screen ✅

**Files:**
- Create: `apps/mobile/src/screens/DashboardScreen.tsx`
- Create: `apps/mobile/src/components/charts/DonutChart.tsx`
- Create: `apps/mobile/src/components/charts/BarChartWeek.tsx`
- Create: `apps/mobile/src/components/charts/LineChartCollections.tsx`

- [x] **Step 1: Four stat cards** — total loaned, received (green), outstanding (amber), active count
- [x] **Step 2: Donut — outstanding by loanee** (gifted-charts PieChart)
- [x] **Step 3: Bar — expected vs received this week** (`barTrack` token for contrast, feedback round 1)
- [x] **Step 4: Line — cumulative collections last 30 days** (hand-rolled `react-native-svg`)
- [x] **Step 5: Active loans list → tap LoanDetail**
- [x] **Step 6: Empty state when no active loans**
- [x] **Step 7: Quick actions — New calculation, Add loanee** (icons added in feedback round 1)
- [x] **Step 8: All chart data from `repo.getDashboardStats()` — no hardcoded mock**
- [x] **Step 9: Commit** — `b7a2d3b`

---

## Phase 12 — Android reminders

### Task 19: Local notifications ✅ (device test pending)

**Files:**
- Create: `apps/mobile/src/services/reminders.ts` (+ pure `remindersLogic.ts` with tests)
- Modify: `apps/mobile/src/screens/SettingsScreen.tsx`

- [x] **Step 1: Request Android notification permission on first enable**
- [x] **Step 2: Schedule/cancel notifications when settings change**
- [x] **Step 3: Copy:** "Update today's collections in LendLedger"
- [x] **Step 4: Frequency presets map to notification schedule**

| Preset | Behavior |
|--------|----------|
| Once daily | One fire per configured time |
| Twice daily | Two fires (first two times) |
| Three times daily | Three fires |
| Custom | All configured times |

- [ ] **Step 5: Test on Android emulator/device — notification fires at set time** ← confirm on tester's Pixel
- [x] **Step 6: Web dev — graceful no-op or browser prompt (not ship criteria)**
- [x] **Step 7: Commit** — `b7a2d3b`

---

## Phase 13 — QA & polish

### Task 20: Manual smoke test checklist ✅ (written; full device pass pending)

Full checklist: `docs/superpowers/checklists/2026-06-14-mvp1-smoke-test.md`

- [x] Fresh install → onboarding → dashboard empty state
- [x] Calculator → create loanee → create loan → 50 daily entries exist
- [x] Mark today paid, yesterday partial, backfill older day
- [x] Extend loan both modes
- [x] Close loan with outstanding warning
- [x] Dashboard numbers match DB
- [x] Theme toggle persists after kill + reopen
- [ ] Reminder fires on Android

---

### Task 21: Light/dark + edge cases ✅

- [x] Delete loanee with active loan → blocked with message
- [x] Custom amount > expected → overpayment credit shown
- [x] App restart → all data intact

---

## Post-MVP feedback round 1 — 2026-09

First testers (Android Pixel via preview APK, iOS via simulator) reported six issues. All fixed in commit `6a01f86`:

| # | Feedback | Fix |
|---|----------|-----|
| 1 | Typing a start date is fiddly | `DatePickerSheet` — in-app month calendar modal, wired into `StartDateField` |
| 2 | Extending a loan needs a custom amount | Third mode `custom` — total spread evenly over new days (`resolveExtendDaily` in core) |
| 3 | Bottom tab bar cropped on Android gesture nav | `useSafeAreaInsets` → tab bar height/padding follow device inset |
| 4 | Home pill buttons lack visual cue | `PillButton` `icon` prop; `calculator` and `add` icons on Home |
| 5 | "Expected" bars vanish into background in one theme | New `barTrack` token (light `#AEB6C2`, dark `#6B7480`) — matches `design/app/tokens.css --bar-track` |
| 6 | Users could record payments on future dates | Future history rows dimmed, non-tappable, tagged “Scheduled”; early payment still possible via the pinned next-due card |

Design handoff was bumped to v2 (`design/`) in the same round: adds `calendar.jsx` and the `--bar-track` token.

---

## Repo cleanup — 2026-09-13

- `Lend Ledger 2/` → `design/` (canonical, tracked); `Lend Ledger/` → `archive/ui-handoff-v1/`
- Unused `DevPreviewScreen`, `StackPlaceholderScreen`, `EmptyState` → `archive/mobile-unused/`
- `createTestRepository` → `src/test-utils/`; deprecated `splitEntriesByToday` alias removed; unused `expo-device` dropped
- 189 MB of ignored `node_modules` inside `archive/stitch-prototype-v2` deleted from disk
- `docs/README.md` added as the story index for the Medium series

---

## Phase 14 — Play Store publish

### Task 22: EAS & signing setup ✅

**Files:**
- Create: `apps/mobile/eas.json`
- Create: `docs/release/eas-setup.md`

- [x] **Step 1: Install EAS CLI** — `npm i -g eas-cli`
- [x] **Step 2: `eas login` + `eas build:configure`** — project ID in `app.json → extra.eas.projectId`
- [x] **Step 3: Create Android keystore** (EAS managed)
- [x] **Step 4: Production profile in `eas.json`** — plus `preview` (APK for sideloading) and `development`

```json
{
  "build": {
    "production": {
      "android": { "buildType": "app-bundle" }
    }
  }
}
```

- [x] **Step 5: Commit** — `b7a2d3b`

---

### Task 23: Play Store listing assets ← **Next**

**Files:**
- Create: `docs/release/play-store-listing.md`
- Create: `docs/release/privacy-policy.md`

- [ ] **Step 1: App name — LendLedger**
- [ ] **Step 2: Short description** (≤80 chars) — draft in listing doc
- [ ] **Step 3: Full description** — daily lending tracker for SMB owners, local data, INR
- [ ] **Step 4: Screenshots** — capture light + dark from Android (phone + 7" tablet if required)
- [ ] **Step 5: Feature graphic** — 1024×500 with LL branding
- [ ] **Step 6: App icon** — replace LL placeholder if ready; else ship placeholder
- [x] **Step 7: Privacy policy** — `docs/release/privacy-policy.md` + in-app `PrivacyPolicyScreen` (local-only storage, no account, no collection)
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
