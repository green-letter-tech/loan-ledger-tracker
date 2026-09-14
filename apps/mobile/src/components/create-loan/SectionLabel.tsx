import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';

interface SectionLabelProps {
  step: number;
  text: string;
}

export function SectionLabel({ step, text }: SectionLabelProps) {
  const { tokens } = useTheme();

  return (
    <View style={styles.row}>
      <LinearGradient
        colors={[...tokens.gradPrimary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.badge}
      >
        <Text style={[styles.badgeText, { color: tokens.onGrad }]}>{step}</Text>
      </LinearGradient>
      <Text style={[styles.text, { color: tokens.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 12,
  },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
  },
});
