import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { avatarGradientColors } from './avatarColors';

interface AvatarProps {
  initials: string;
  size?: number;
  hue?: number;
  style?: StyleProp<ViewStyle>;
}

export function Avatar({ initials, size = 46, hue = 254, style }: AvatarProps) {
  const [from, to] = avatarGradientColors(hue);

  return (
    <LinearGradient
      colors={[from, to]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.root,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: '#FFFFFF',
          fontWeight: '700',
          fontSize: size * 0.36,
          letterSpacing: -0.5,
        }}
      >
        {initials}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
