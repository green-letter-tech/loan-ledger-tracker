import type { ReactNode } from 'react';
import { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface DetailEntranceProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

const ENTER_MS = 280;
const EASE = Easing.out(Easing.cubic);

/** Soft scale/fade for detail headers (shared-element stand-in). */
export function DetailEntrance({ children, style }: DetailEntranceProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: ENTER_MS, easing: EASE });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.92, 1]) }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
