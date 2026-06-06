# Mobile theme

Design tokens and theme context for LendLedger Expo app.

## Files

| File | Role |
|------|------|
| `tokens.ts` | Light/dark color palettes (hex), radii, gradient stops — ported from `Lend Ledger/app/tokens.css` |
| `types.ts` | `ThemePreference` (`light` \| `dark` \| `system`) |
| `ThemeProvider.tsx` | React context; resolves system appearance via `useColorScheme` |
| `../hooks/useTheme.ts` | Hook for screens and UI primitives |

## Usage

```tsx
import { useTheme } from '../hooks/useTheme';

function MyScreen() {
  const { tokens } = useTheme();
  return <View style={{ backgroundColor: tokens.bg }} />;
}
```

## Persistence

Task 5 keeps preference in React state. **Task 11 (Settings)** will persist `owner_settings.theme` via `LoanRepository`.

## Preview

After Task 5, `npm run mobile:web` shows `ThemePreviewScreen` with appearance chips and brand swatches.
