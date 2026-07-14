import type { WeeklyBarPoint } from '@lendledger/core';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';

interface BarChartWeekProps {
  data: WeeklyBarPoint[];
  height?: number;
}

export function BarChartWeek({ data, height = 132 }: BarChartWeekProps) {
  const { tokens } = useTheme();
  const max = Math.max(...data.flatMap((point) => [point.expected, point.received]), 1) * 1.1;
  const barAreaHeight = height - 24;

  if (data.length === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={[styles.emptyText, { color: tokens.textFaint }]}>No data this week</Text>
      </View>
    );
  }

  return (
    <View style={[styles.chart, { height }]}>
      {data.map((point) => {
        const expectedHeight = Math.max(4, (point.expected / max) * barAreaHeight);
        const receivedHeight = Math.max(4, (point.received / max) * barAreaHeight);

        return (
          <View key={point.label} style={styles.column}>
            <View style={[styles.bars, { height: barAreaHeight }]}>
              <View
                style={[
                  styles.barExpected,
                  {
                    height: expectedHeight,
                    backgroundColor: tokens.surfaceSunken,
                    borderColor: tokens.border,
                  },
                ]}
              />
              <View
                style={[
                  styles.barReceived,
                  {
                    height: receivedHeight,
                    backgroundColor: tokens.green,
                  },
                ]}
              />
            </View>
            <Text style={[styles.label, { color: tokens.textFaint }]}>{point.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingTop: 6,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: 7,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    width: '100%',
  },
  barExpected: {
    width: '38%',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  barReceived: {
    width: '38%',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
