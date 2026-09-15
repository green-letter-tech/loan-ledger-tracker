import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FLOATING_DOCK_ACTION_OFFSET } from '../constants/floatingDock';
import { useTheme } from '../hooks/useTheme';

interface BottomActionBarProps {
  children: ReactNode;
  /** Extra space under the bar for the floating dock. Defaults to dock clearance. */
  bottomOffset?: number;
}

export function BottomActionBar({
  children,
  bottomOffset = FLOATING_DOCK_ACTION_OFFSET,
}: BottomActionBarProps) {
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: Math.max(insets.bottom, 14) + bottomOffset,
          backgroundColor: tokens.bg,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 8,
  },
});
