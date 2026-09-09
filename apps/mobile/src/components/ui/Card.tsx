import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../../hooks/useTheme';

export type CardGradient = 'blue' | 'green' | 'none';

interface CardProps {
  children: ReactNode;
  grad?: CardGradient;
  pad?: number;
  elev?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, grad = 'none', pad = 16, elev = false, onPress, style }: CardProps) {
  const { tokens } = useTheme();
  const radius = tokens.radiusCard;
  const shellStyle = [
    styles.shell,
    {
      borderRadius: radius,
      borderColor: tokens.borderSoft,
      ...(elev ? styles.elevated : styles.flat),
    },
    style,
  ];

  const content = <View style={{ padding: pad }}>{children}</View>;

  if (grad === 'blue' || grad === 'green') {
    const colors: [string, string] =
      grad === 'blue' ? [tokens.surface, tokens.blueTint] : [tokens.surface, tokens.greenTint];

    const gradient = (
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={shellStyle}>
        {content}
      </LinearGradient>
    );

    if (onPress) {
      return <Pressable onPress={onPress}>{gradient}</Pressable>;
    }
    return gradient;
  }

  const surface = (
    <View style={[...shellStyle, { backgroundColor: tokens.surface }]}>{content}</View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{surface}</Pressable>;
  }
  return surface;
}

const styles = StyleSheet.create({
  shell: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  flat: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
});
