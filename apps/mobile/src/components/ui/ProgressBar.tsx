import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import type { ThemeTokens } from '../../theme/tokens';

export type ProgressBarColor = 'primary' | 'green' | 'blue';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: ProgressBarColor;
  height?: number;
}

export function ProgressBar({ value, max = 100, color = 'primary', height = 8 }: ProgressBarProps) {
  const { tokens } = useTheme();
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fillColors = getFillColors(color, tokens);

  return (
    <View
      style={[
        styles.track,
        {
          height,
          borderRadius: height / 2,
          backgroundColor: tokens.surfaceSunken,
        },
      ]}
    >
      <LinearGradient
        colors={fillColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.fill, { width: `${pct}%`, borderRadius: height / 2 }]}
      />
    </View>
  );
}

function getFillColors(
  color: ProgressBarColor,
  tokens: ThemeTokens,
): [string, string] {
  switch (color) {
    case 'primary':
      return [tokens.gradPrimary[0], tokens.gradPrimary[1]];
    case 'green':
      return [tokens.gradGreen[0], tokens.gradGreen[1]];
    case 'blue':
      return [tokens.gradBlue[0], tokens.gradBlue[1]];
    default: {
      const _exhaustive: never = color;
      throw new Error(`Unhandled color: ${_exhaustive}`);
    }
  }
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
