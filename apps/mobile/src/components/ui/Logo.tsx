import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../../hooks/useTheme';

interface LogoProps {
  size?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Logo({ size = 38, radius = 11, style }: LogoProps) {
  const { tokens } = useTheme();

  return (
    <LinearGradient
      colors={[...tokens.gradPrimary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.root,
        {
          width: size,
          height: size,
          borderRadius: radius,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: tokens.onGrad,
          fontWeight: '800',
          fontSize: size * 0.42,
          letterSpacing: -1,
        }}
      >
        LL
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
});
