import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Success haptic for completed pull-to-refresh / save actions. No-ops on web. */
export async function hapticSuccess(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Ignore missing hardware / denied haptics.
  }
}
