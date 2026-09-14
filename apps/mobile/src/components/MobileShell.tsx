import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

/** Constrain web preview to phone width (matches canonical 390px frame). */
const PHONE_MAX_WIDTH = 430;

interface MobileShellProps {
  children: ReactNode;
  outerBackgroundColor?: string;
}

export function MobileShell({ children, outerBackgroundColor }: MobileShellProps) {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={[styles.webRoot, outerBackgroundColor ? { backgroundColor: outerBackgroundColor } : null]}>
      <View style={styles.phoneColumn}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  webRoot: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#DDE3EA',
  },
  phoneColumn: {
    flex: 1,
    width: '100%',
    maxWidth: PHONE_MAX_WIDTH,
  },
});
