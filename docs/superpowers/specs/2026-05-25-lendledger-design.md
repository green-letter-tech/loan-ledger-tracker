# LendLedger — Product & Technical Spec (MVP1)

**Version:** 1.0  
**Date:** 2026-05-25  
**Status:** Approved for implementation

---

## 1. Summary

| Item | Decision |
|------|----------|
| **Product** | Owner-only SMB lending tracker |
| **App name** | **LendLedger** |
| **MVP1 goal** | Full loan tracking on Android, **live on Google Play Store** |
| **MVP1 data** | Local only (`expo-sqlite` on device); **no login** |
| **Currency** | **INR only** (₹, Indian number formatting) |
| **Track B (later)** | Stytch auth, Supabase sync, Vercel web hosting |

Each install stores data on the user's device. No account required for MVP1.

---

## 2. Success criteria (MVP1 complete when…)

- [ ] User installs from Play Store on a fresh Android device
- [ ] First launch: onboarding (reminder preferences); no login screen
- [ ] Calculator produces correct daily payment (e.g. 100 INR, 1%/day, 50 days → ₹3/day)
- [ ] Create loanee → create loan → daily entries generated for full term
- [ ] Loan detail: Paid / Unpaid / partial custom amount; backfill past days
- [ ] Extend loan: owner chooses same daily vs recalculate remaining balance
- [ ] Close loan: manual with warning if outstanding balance remains
- [ ] Dashboard: summary cards + donut + bar + line charts accurate
- [ ] Settings: configurable reminder times and frequency; Android local notifications fire
- [ ] Light / dark mode toggle persists
- [ ] Data survives app restart
- [ ] App published and **live on Google Play Store**

---

## 3. Users & scope

### Primary user

SMB owner who lends short-term, collects repayments daily (often in cash), tracks multiple loanees offline.

### In scope (MVP1)

- Loan calculator with rate/duration unit options
- Loanees CRUD
- Loan creation from calculator
- Daily payment tracking (paid / unpaid / partial)
- Extendable loans
- Dashboard with metrics and charts
- Global reminder configuration
- Light / dark theme

### Out of scope (MVP1)

- Login / accounts (Track B)
- Cloud sync (Track B)
- Loanee app, portal, or notifications to loanees
- Payment gateway / money movement
- Multi-staff accounts
- Multi-currency / FX
- SMS OTP
- PDF export
- iOS
- Parallax effects (post-MVP1 polish)

---

## 4. Platforms & dev workflow

| Phase | Platform |
|-------|----------|
| UI design draft | Google Stitch → Figma export |
| UI iteration | Expo web (`npx expo start --web`) |
| Device QA | Android emulator + physical device |
| MVP1 ship | EAS AAB → Google Play Console |

**No cloud accounts required until Track B.**

---

## 5. Tech stack (MVP1)

| Layer | Choice |
|-------|--------|
| UI | Expo (React Native + React Native Web) |
| Logic | `packages/core` — calculator, types, validation |
| Storage | expo-sqlite + repository interfaces |
| Navigation | React Navigation |
| Charts | TBD (e.g. react-native-gifted-charts) |
| Reminders | Expo Notifications (local, Android) |
| Build | Expo EAS |
| Cost | $25 one-time Play Store fee; $0 recurring for MVP1 |

### Architecture

```
Screens → Repository interfaces → LocalSQLiteRepository (MVP1)
                                 → SupabaseRepository (Track B)
packages/core ← used by UI and repositories
```

- Single implicit local `owner` row on first launch (no auth)
- Screens must not import SQLite or Supabase directly

---

## 6. Design system

### Palette

### Palette (canonical — from approved UI screenshots)

| Token | Hex | Usage |
|-------|-----|--------|
| App background (dark) | `#0B0E14` | Main background |
| Card surface | `#161B22` / `#1A202C` | Cards, sections |
| Primary | `#5E72E4` | Icons, progress, nav active, line chart |
| Primary light | `#93C5FD` | Gradient start |
| Gradient end | `#3B82F6` | CTA buttons |
| Success | `#2DCE89` | Received totals, paid status, bar chart received |
| Warning | `#F97316` | Outstanding amounts, donut segment |
| Muted text | `#94A3B8` | Labels on dark backgrounds |
| App background (light) | `#F4F6FB` | Light mode page bg |

**Primary CTA gradient:** `#93C5FD` → `#3B82F6`  
**FAB gradient:** `#5E72E4` → `#2DCE89`

- Base colors: **black, white, blue, green** (+ gradients/shades above)
- Avoid clutter; generous whitespace

### Typography

- Platform **system default fonts**
- Soft, readable hierarchy: large titles, medium section headers, regular body

### Components

- **Buttons:** Fully rounded corners; subtle hover on web; press scale animation on mobile
- **Cards:** Rounded corners, light shadow/elevation; optional gradient backgrounds
- **Inputs:** Clear labels; rounded fields; INR amount formatting

### Theme

- **Light mode** and **dark mode** with in-app toggle (header or Settings)
- Persist preference in `owner_settings.theme` (`light` | `dark` | `system`)
- All colors via centralized theme tokens — no hard-coded hex in screens

### Branding

- **MVP1 app icon:** Text **"LL"** on simple background (placeholder)
- **Icon swap checklist** (when replacing later):
  - `assets/icon.png` / adaptive icon
  - Splash screen
  - Web favicon
  - In-app logo component
  - Play Store listing icon + feature graphic

### Deferred

- Parallax scroll effects
- Custom illustrated icon (replace "LL")

---

## 7. Loan math (canonical)

Flat / simple interest. Daily payment spreads **principal + total interest** evenly across term.

```
dailyRate     = normalizeRate(interestRate, ratePeriod)   // day | month | year
durationDays  = normalizeDuration(duration, durationUnit) // days | months | years
totalInterest = principal × dailyRate × durationDays
totalExpected = principal + totalInterest
dailyExpected = totalExpected ÷ durationDays
```

**Reference example:** 100 INR, 1% per day, 50 days  
→ totalInterest = 50 → totalExpected = 150 → **dailyExpected = ₹3.00**

### Rate period options (UI dropdown)

- Per day (default)
- Per month
- Per year

### Duration unit options (UI dropdown)

- Days (default)
- Months
- Years

---

## 8. Loan lifecycle rules

### Daily entries

| Status | Condition |
|--------|-----------|
| `paid` | received_amount = expected_amount |
| `unpaid` | received_amount = 0 |
| `partial` | 0 < received_amount ≠ expected_amount |

- Owner can update **any past day** (backfill)
- Today highlighted / pinned in day list

### Overpayment

- Allow received_amount > expected_amount
- Show overpayment credit on loan summary

### Extend loan

- Unpaid / partial days **remain unchanged**
- Owner adds N days to term
- **Owner chooses at extend time:**
  - **Option A:** Keep same `dailyExpected` for new days
  - **Option B:** Recalculate daily amount = remaining balance ÷ N
- Loan status → `extended`
- New `daily_entries` inserted for extension period

### Close loan

- **Manual** action by owner
- If outstanding balance > 0: show **warning dialog** with remaining amount; owner can confirm close anyway
- Loan status → `closed`

### Mid-loan term edits

- No silent recalculation of past entries
- Use **Extend loan** only

### Delete loanee

- **Block** if loanee has active loans
- Require close loans first

### Loan start date

- **Default:** today
- **Optional:** date picker for custom start date when creating loan
- Generate `daily_entries` from `start_date` for `durationDays`

---

## 9. Reminders

Global reminders only (not per-loanee).

### Configurable settings

| Setting | Description |
|---------|-------------|
| Reminders enabled | Master on/off |
| Frequency preset | Once daily \| Twice daily \| Three times daily \| Custom |
| Notification times | One or more time pickers (user adds/removes slots) |

**First-launch default:** One reminder at **7:00 PM**.

Example use case: user may set 9:00 AM, 6:00 PM, 9:00 PM via custom times.

### Platform behavior

- **Android (MVP1 ship):** Expo local scheduled notifications
- **Web (dev):** Browser notifications optional; not MVP1 ship criteria

### Copy (suggested)

> "Update today's collections in LendLedger"

---

## 10. Data model

### Tables

#### `owners`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| stytch_user_id | text UK | Nullable in MVP1 (local only) |
| email | text | Nullable in MVP1 |
| display_name | text | Optional |

MVP1: single row seeded on first launch.

#### `owner_settings`

| Column | Type | Notes |
|--------|------|-------|
| owner_id | UUID FK | |
| default_currency | text | `INR` for MVP1 |
| theme | text | `light` \| `dark` \| `system` |
| reminders_enabled | bool | |
| reminder_times | text/json | Array of HH:MM strings |
| reminder_frequency | text | Preset key |

#### `loanees`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| owner_id | UUID FK | |
| name | text | Required |
| phone | text | Optional |
| notes | text | Optional |

#### `loans`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| owner_id | UUID FK | |
| loanee_id | UUID FK | |
| principal | numeric | |
| interest_rate | numeric | As entered |
| rate_period | text | day \| month \| year |
| duration_days | int | Normalized |
| daily_expected | numeric | Snapshot at creation |
| total_expected | numeric | Snapshot at creation |
| start_date | date | |
| end_date | date | |
| status | text | active \| extended \| closed |

#### `daily_entries`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| loan_id | UUID FK | |
| entry_date | date | Unique per loan |
| expected_amount | numeric | |
| received_amount | numeric | Default 0 |
| status | text | paid \| unpaid \| partial |

---

## 11. Screens & navigation

**MVP1: no login screen.** App opens to onboarding (first launch) or dashboard.

### Navigation structure

```
Bottom tabs or drawer:
  - Home (Dashboard)
  - Calculator
  - Loanees
  - Settings
```

Loan detail, create loan, extend loan, add loanee → stack modals / push screens.

### 11.1 Onboarding (first launch only)

- Welcome + app purpose (1–2 screens max)
- Set reminder preferences (frequency + times; default 7 PM)
- INR implied; no currency picker in MVP1
- CTA: **Get started** → Dashboard

### 11.2 Dashboard (Home)

**Summary cards (4):**

- Total loaned (principal, active loans)
- Total received
- Outstanding
- Active loans count

**Charts:**

1. **Donut:** principal outstanding by loanee
2. **Bar:** expected vs received this week
3. **Line:** cumulative collections last 30 days

**Quick actions:**

- New calculation
- Add loanee

**Active loans list** (tap → loan detail)

**Empty state:** friendly illustration + CTA to calculator

### 11.3 Calculator

**Inputs:**

- Principal amount (₹)
- Interest rate (number)
- Rate period dropdown (day default)
- Duration (number)
- Duration unit dropdown (days default)

**Live outputs:**

- Daily payment (₹)
- Total repayable (₹)
- Total interest (₹)

**CTA:** **Save as loan** → select/create loanee → start date (default today) → confirm → create

### 11.4 Create / confirm loan

- Loanee picker (existing + add new inline)
- Start date picker (default today)
- Summary of terms
- Confirm creates loan + daily entries

### 11.5 Loan detail

**Header:**

- Loanee name
- Principal, daily expected, progress (days paid / total)
- Outstanding amount
- Progress bar

**Day list:**

- Scrollable; today pinned/highlighted
- Each row: date, expected ₹, status badge, Paid / Unpaid toggle
- Tap row → bottom sheet for custom received amount

**Actions:**

- Extend loan
- Close loan

### 11.6 Extend loan (modal / screen)

- Show unpaid/partial summary + remaining balance
- Input: number of days to add
- Radio / toggle: **Keep same daily amount** vs **Recalculate daily amount**
- Preview new end date and daily amount
- Confirm

### 11.7 Loanees

- Searchable list (optional MVP1)
- Add / edit: name, phone, notes
- Tap loanee → their active + past loans
- Delete blocked if active loans

### 11.8 Settings

- Theme: Light / Dark / System
- Reminders: enable, frequency, time slots (add/remove)
- About / version
- Privacy policy link (placeholder until Phase 8)
- **No sign out in MVP1**

---

## 12. Edge cases

| Case | Behavior |
|------|----------|
| Custom amount > expected | Allow; show overpayment credit |
| Custom amount < expected | Mark partial; show outstanding |
| Missed past days | Owner backfills on loan detail |
| Edit loan mid-flight | Extend only; no silent recalc |
| Delete loanee with active loans | Block with message |
| Close with outstanding | Warn; allow confirm |
| Offline | Show offline banner; reads/writes from local DB (MVP1 local-only) |

---

## 13. Testing

| Layer | Coverage |
|-------|----------|
| Unit | `packages/core` calculator + normalization (incl. 100/1%/50d → 3) |
| Integration | Loan create → correct `daily_entries` count |
| Manual smoke | Full flow on Android device from fresh install |
| Pre-release | Play Store build on clean device |

---

## 14. Play Store deliverables (Phase 8)

- App name: **LendLedger**
- Short / long description (draft TBD)
- Phone screenshots (light + dark)
- Feature graphic
- App icon ("LL" placeholder)
- Privacy policy URL (**deferred** until submission — local data disclosure)
- Content rating questionnaire
- EAS-signed AAB

---

## 15. Track B — cloud & auth (document only)

Not part of MVP1 implementation.

- Stytch: Google OAuth + email OTP
- Supabase Postgres + RLS
- Vercel web deploy
- Optional SQLite → cloud migration
- Login screens added; sign out in Settings
- Play Store update with sync

---

## 16. UI design workflow

1. Generate high-fidelity screens in **Google Stitch** using project prompt (`docs/design/stitch-lendledger-prompt.md`)
2. Review and iterate in Stitch (screen by screen)
3. Export to Figma / reference PNGs into `docs/design/`
4. Implement in Expo matching approved designs + theme tokens

---

## 17. Open items (non-blocking)

| Item | When |
|------|------|
| Privacy policy URL | Phase 8 (Play Store) |
| Play Store listing copy | Phase 8 |
| Chart library final pick | Phase 5 implementation |
| Replace "LL" icon | Anytime via branding checklist |
