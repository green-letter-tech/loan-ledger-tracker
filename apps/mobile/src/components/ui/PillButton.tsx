import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import type { ThemeTokens } from '../../theme/tokens';

export type PillButtonVariant =
  | 'primary'
  | 'blue'
  | 'green'
  | 'outline'
  | 'soft'
  | 'ghost'
  | 'danger';

export type PillButtonSize = 'lg' | 'md' | 'sm';

interface PillButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: PillButtonVariant;
  size?: PillButtonSize;
  full?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const SIZE_STYLES: Record<PillButtonSize, { height: number; fontSize: number; padH: number }> = {
  lg: { height: 54, fontSize: 16.5, padH: 24 },
  md: { height: 46, fontSize: 15, padH: 24 },
  sm: { height: 38, fontSize: 13.5, padH: 16 },
};

export function PillButton({
  children,
  onPress,
  variant = 'primary',
  size = 'lg',
  full = false,
  disabled = false,
  style,
}: PillButtonProps) {
  const { tokens } = useTheme();
  const sizeStyle = SIZE_STYLES[size];

  const shell: ViewStyle = {
    height: sizeStyle.height,
    borderRadius: tokens.radiusPill,
    paddingHorizontal: sizeStyle.padH,
    width: full ? '100%' : undefined,
    alignSelf: full ? 'stretch' : 'flex-start',
    opacity: disabled ? 0.45 : 1,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const label = (
    <Text
      style={{
        fontSize: sizeStyle.fontSize,
        fontWeight: '700',
        letterSpacing: -0.2,
        color: getLabelColor(variant, tokens),
      }}
    >
      {children}
    </Text>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [pressed && !disabled ? styles.pressed : null, style]}
    >
      {renderBackground(variant, tokens, shell, label)}
    </Pressable>
  );
}

function getLabelColor(variant: PillButtonVariant, tokens: ThemeTokens): string {
  switch (variant) {
    case 'primary':
    case 'blue':
    case 'green':
      return tokens.onGrad;
    case 'outline':
    case 'soft':
      return tokens.text;
    case 'ghost':
      return tokens.blue;
    case 'danger':
      return tokens.red;
    default: {
      const _exhaustive: never = variant;
      throw new Error(`Unhandled variant: ${_exhaustive}`);
    }
  }
}

function renderBackground(
  variant: PillButtonVariant,
  tokens: ThemeTokens,
  shell: ViewStyle,
  label: React.ReactNode,
) {
  const gradientShadow = {
    shadowColor: tokens.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  } as const;

  switch (variant) {
    case 'primary':
      return (
        <LinearGradient
          colors={[...tokens.gradPrimary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[shell, gradientShadow]}
        >
          {label}
        </LinearGradient>
      );
    case 'blue':
      return (
        <LinearGradient
          colors={[...tokens.gradBlue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[shell, gradientShadow]}
        >
          {label}
        </LinearGradient>
      );
    case 'green':
      return (
        <LinearGradient
          colors={[...tokens.gradGreen]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[shell, gradientShadow]}
        >
          {label}
        </LinearGradient>
      );
    case 'outline':
      return (
        <View style={[shell, { backgroundColor: tokens.surface, borderWidth: 1.5, borderColor: tokens.border }]}>
          {label}
        </View>
      );
    case 'soft':
      return (
        <View style={[shell, { backgroundColor: tokens.surface2 }]}>
          {label}
        </View>
      );
    case 'ghost':
      return <View style={[shell, { backgroundColor: 'transparent' }]}>{label}</View>;
    case 'danger':
      return (
        <View style={[shell, { backgroundColor: tokens.redTint }]}>
          {label}
        </View>
      );
    default: {
      const _exhaustive: never = variant;
      throw new Error(`Unhandled variant: ${_exhaustive}`);
    }
  }
}

const styles = StyleSheet.create({
  pressed: {
    transform: [{ scale: 0.955 }],
  },
});
