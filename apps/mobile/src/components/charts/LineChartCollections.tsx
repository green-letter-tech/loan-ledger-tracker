import type { LinePoint } from '@lendledger/core';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';

interface LineChartCollectionsProps {
  points: LinePoint[];
  width?: number;
  height?: number;
}

export function LineChartCollections({
  points,
  width = 320,
  height = 120,
}: LineChartCollectionsProps) {
  const { tokens } = useTheme();
  const values = points.map((point) => point.cumulative);
  const max = Math.max(...values, 1) * 1.15;
  const min = Math.min(...values, 0);
  const pad = 6;
  const chartWidth = width - pad * 2;
  const chartHeight = height - pad * 2;

  if (points.length === 0) {
    return <View style={{ height }} />;
  }

  const coords = values.map((value, index) => {
    const x = pad + (index / Math.max(values.length - 1, 1)) * chartWidth;
    const y = pad + chartHeight - ((value - min) / Math.max(max - min, 1)) * chartHeight;
    return { x, y };
  });

  const linePath = coords
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ');
  const last = coords[coords.length - 1];
  const areaPath = `${linePath} L ${last.x.toFixed(1)} ${height - pad} L ${pad} ${height - pad} Z`;

  return (
    <View style={styles.wrap}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="collectionsFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={tokens.blue} stopOpacity={0.28} />
            <Stop offset="100%" stopColor={tokens.blue} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Path d={areaPath} fill="url(#collectionsFill)" />
        <Path
          d={linePath}
          fill="none"
          stroke={tokens.blue}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle
          cx={last.x}
          cy={last.y}
          r={4}
          fill={tokens.blue}
          stroke={tokens.surface}
          strokeWidth={2.5}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
});
