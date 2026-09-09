import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import type { ThemeTokens } from '../../theme/tokens';

export type LoanStatusLabel =
  | 'Paid'
  | 'Unpaid'
  | 'Partial'
  | 'Active'
  | 'Closed'
  | 'Overdue';

interface StatusPillProps {
  status: LoanStatusLabel;
}

export function StatusPill({ status }: StatusPillProps) {
  const { tokens } = useTheme();
  const { color, background } = getStatusColors(status, tokens);

  return (
    <View style={[styles.pill, { backgroundColor: background }]}>
      <Text style={[styles.label, { color }]}>{status}</Text>
    </View>
  );
}

function getStatusColors(
  status: LoanStatusLabel,
  tokens: ThemeTokens,
): { color: string; background: string } {
  switch (status) {
    case 'Paid':
    case 'Active':
      return { color: tokens.green, background: tokens.greenTint };
    case 'Unpaid':
    case 'Closed':
      return { color: tokens.textFaint, background: tokens.surfaceSunken };
    case 'Partial':
      return { color: tokens.amber, background: tokens.amberTint };
    case 'Overdue':
      return { color: tokens.red, background: tokens.redTint };
    default: {
      const _exhaustive: never = status;
      throw new Error(`Unhandled status: ${_exhaustive}`);
    }
  }
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
});
