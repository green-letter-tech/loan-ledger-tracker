import { formatINR, type RecoverySplit } from '@lendledger/core';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../hooks/useTheme';
import { Card, ProgressBar } from './ui';

interface RecoveryCardProps {
  title: string;
  split: RecoverySplit;
  /** Extra lines for a settled loan (interest waived, amount settled). */
  footnotes?: Array<{ label: string; value: string }>;
}

/**
 * How much of the money lent has come back, split into principal and interest.
 * Shared by the dashboard (all active loans) and loan detail (one loan).
 */
export function RecoveryCard({ title, split, footnotes }: RecoveryCardProps) {
  const { tokens } = useTheme();

  return (
    <Card pad={16}>
      <Text style={[styles.title, { color: tokens.text }]}>{title}</Text>

      <RecoveryRow
        label="Principal recovered"
        recovered={split.principalRecovered}
        total={split.principal}
        color="blue"
      />
      <RecoveryRow
        label="Interest recovered"
        recovered={split.interestRecovered}
        total={split.totalInterest}
        color="green"
      />

      {footnotes?.length ? (
        <View style={[styles.footnotes, { borderTopColor: tokens.borderSoft }]}>
          {footnotes.map((note) => (
            <View key={note.label} style={styles.footnoteRow}>
              <Text style={[styles.footnoteLabel, { color: tokens.textFaint }]}>{note.label}</Text>
              <Text style={[styles.footnoteValue, { color: tokens.textSoft }]}>{note.value}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Card>
  );
}

interface RecoveryRowProps {
  label: string;
  recovered: number;
  total: number;
  color: 'blue' | 'green';
}

function RecoveryRow({ label, recovered, total, color }: RecoveryRowProps) {
  const { tokens } = useTheme();
  const pct = total > 0 ? Math.round((recovered / total) * 100) : 0;

  return (
    <View style={styles.row}>
      <View style={styles.rowHeader}>
        <Text style={[styles.rowLabel, { color: tokens.textSoft }]}>{label}</Text>
        <Text style={[styles.rowValue, { color: tokens.text }]}>
          {formatINR(recovered)}
          <Text style={[styles.rowTotal, { color: tokens.textFaint }]}> of {formatINR(total)}</Text>
        </Text>
      </View>
      <ProgressBar value={recovered} max={total > 0 ? total : 1} color={color} height={8} />
      <Text style={[styles.rowPct, { color: tokens.textFaint }]}>{pct}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  row: {
    marginBottom: 14,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 7,
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  rowTotal: {
    fontSize: 12,
    fontWeight: '600',
  },
  rowPct: {
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 5,
    textAlign: 'right',
  },
  footnotes: {
    borderTopWidth: 1,
    paddingTop: 11,
    marginTop: -2,
    gap: 5,
  },
  footnoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footnoteLabel: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  footnoteValue: {
    fontSize: 12.5,
    fontWeight: '700',
  },
});
