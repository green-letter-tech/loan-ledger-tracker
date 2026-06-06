# UI primitives

React Native components ported from `Lend Ledger/app/lib.jsx`. All colors come from `useTheme().tokens` — screens must not hardcode hex values.

## Components

| Component | Handoff source | Notes |
|-----------|----------------|-------|
| `Card` | `Card()` | `grad="blue" \| "green"`, `elev`, optional `onPress` |
| `PillButton` | `PillButton()` | Variants: `primary`, `blue`, `green`, `outline`, `soft`, `ghost`, `danger` |
| `Avatar` | `Avatar()` | Initials + `hue` gradient |
| `StatusPill` | `StatusPill()` | Loan/day statuses |
| `ProgressBar` | `Progress()` | Gradient fill track |
| `Logo` | `Logo()` | LL monogram |

## Dependencies

- `expo-linear-gradient` — primary/green/blue gradients (matches CSS `--grad-*`)

## Preview

```bash
npm run mobile:web
```

`DevPreviewScreen` showcases all primitives until Task 9 navigation lands.

## Usage

```tsx
import { Card, PillButton } from '../components/ui';
import { useTheme } from '../hooks/useTheme';

function Example() {
  const { tokens } = useTheme();
  return (
    <Card grad="blue">
      <PillButton full>Save as loan</PillButton>
    </Card>
  );
}
```
