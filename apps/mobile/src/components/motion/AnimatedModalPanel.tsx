import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type ModalPanelVariant = 'dialog' | 'sheet';

interface AnimatedModalPanelProps {
  visible: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** dialog = scale+fade; sheet = slide-up+fade */
  variant?: ModalPanelVariant;
}

const ENTER_MS = 240;
const EASE = Easing.out(Easing.cubic);

/**
 * Fade + scale (dialog) or fade + slide-up (sheet) for modal content.
 * Pair with RN Modal `animationType="fade"` for the scrim.
 */
export function AnimatedModalPanel({
  visible,
  children,
  style,
  variant = 'dialog',
}: AnimatedModalPanelProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, { duration: ENTER_MS, easing: EASE });
  }, [progress, visible]);

  const animatedStyle = useAnimatedStyle(() => {
    if (variant === 'sheet') {
      return {
        opacity: progress.value,
        transform: [
          { translateY: interpolate(progress.value, [0, 1], [28, 0]) },
        ],
      };
    }

    return {
      opacity: progress.value,
      transform: [{ scale: interpolate(progress.value, [0, 1], [0.94, 1]) }],
    };
  });

  return (
    <Animated.View style={[variant === 'sheet' ? styles.sheetRoot : styles.dialogRoot, style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dialogRoot: {
    width: '100%',
    alignItems: 'center',
  },
  sheetRoot: {
    width: '100%',
  },
});
