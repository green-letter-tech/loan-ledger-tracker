# EAS build setup (Task 22)

LendLedger Android releases use [Expo Application Services (EAS)](https://docs.expo.dev/build/introduction/) from `apps/mobile`.

## Prerequisites

- Expo account: https://expo.dev/signup
- Google Play Console app (Task 24): `com.greenletter.lendledger`

## One-time setup

From the repo root:

```bash
npm install
cd apps/mobile
npx eas-cli login
npx eas-cli build:configure
```

`build:configure` links the project to Expo and writes `extra.eas.projectId` into `app.json`. Commit that change.

On the first production Android build, EAS prompts to create or upload a keystore. Choose **Generate new keystore** (EAS-managed) unless you already have signing credentials for this package.

## Build profiles (`apps/mobile/eas.json`)

| Profile       | Use case                          | Android output   |
|---------------|-----------------------------------|------------------|
| `development` | Dev client, internal distribution | APK              |
| `preview`     | QA / sideload testing             | APK              |
| `production`  | Play Store                        | AAB (app-bundle) |

Production uses `autoIncrement` for `versionCode` on EAS servers.

## Commands

```bash
# Production AAB (Play Store)
npm run build:android

# Preview APK (internal testing)
npm run build:android:preview
```

Or from `apps/mobile`:

```bash
npx eas-cli build --platform android --profile production
```

## Verify before submit

1. Download the AAB from the EAS dashboard.
2. Install on a clean physical device (internal testing track or bundletool).
3. Run the smoke checklist: `docs/superpowers/checklists/2026-06-14-mvp1-smoke-test.md`

## Submit (Task 24)

```bash
cd apps/mobile
npx eas-cli submit --platform android --profile production
```

Requires Play Console service account or manual upload of the AAB.
