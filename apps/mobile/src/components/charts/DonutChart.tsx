import { PieChart } from 'react-native-gifted-charts';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';

export interface DonutChartSlice {
  loaneeName: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  slices: DonutChartSlice[];
  totalLabel: string;
  size?: number;
}

export function DonutChart({ slices, totalLabel, size = 132 }: DonutChartProps) {
  const { tokens } = useTheme();
  const thickness = 20;
  const radius = size / 2;
  const innerRadius = radius - thickness;
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  const data =
    total > 0
      ? slices.map((slice) => ({ value: slice.value, color: slice.color }))
      : [{ value: 1, color: tokens.surfaceSunken }];

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <PieChart
        data={data}
        donut
        radius={radius}
        innerRadius={innerRadius}
        innerCircleColor={tokens.surface}
        strokeColor={tokens.surface}
        strokeWidth={2}
        showText={false}
        isAnimated
      />
      <View style={styles.centerLabel}>
        <Text style={[styles.centerValue, { color: tokens.text }]} numberOfLines={1}>
          {totalLabel}
        </Text>
        <Text style={[styles.centerCaption, { color: tokens.textFaint }]}>OUTSTANDING</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  centerValue: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  centerCaption: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 2,
  },
});
