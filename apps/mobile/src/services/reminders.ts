import { formatISODateLocal, type LoanRepository, type OwnerSettings } from '@lendledger/core';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  buildReminderBody,
  DEFAULT_REMINDER_BODY,
  parseReminderTime24,
  resolveScheduledTimes,
} from './remindersLogic';

export {
  buildReminderBody,
  DEFAULT_REMINDER_BODY,
  parseReminderTime24,
  resolveScheduledTimes,
} from './remindersLogic';

export const REMINDER_NOTIFICATION_TITLE = 'LendLedger';
/** @deprecated Prefer buildReminderBody(overdueDays) */
export const REMINDER_NOTIFICATION_BODY = DEFAULT_REMINDER_BODY;

const ANDROID_CHANNEL_ID = 'daily-reminders';

export type ReminderSettings = Pick<
  OwnerSettings,
  'remindersEnabled' | 'reminderFrequency' | 'reminderTimes'
>;

export type SyncRemindersResult = {
  scheduled: number;
  permissionDenied?: boolean;
  skipped?: boolean;
};

export type SyncRemindersOptions = {
  overdueDays?: number;
};

let initialized = false;

export function initReminders(): void {
  if (initialized || Platform.OS === 'web') {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  initialized = true;
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  initReminders();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Daily reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function cancelAllReminders(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Reschedules local daily reminders.
 * Body text only updates when this runs (no background JS on notification fire).
 */
export async function syncReminders(
  settings: ReminderSettings,
  options: SyncRemindersOptions = {},
): Promise<SyncRemindersResult> {
  if (Platform.OS === 'web') {
    return { scheduled: 0, skipped: true };
  }

  initReminders();
  await cancelAllReminders();

  if (!settings.remindersEnabled) {
    return { scheduled: 0 };
  }

  const granted = await ensureNotificationPermissions();
  if (!granted) {
    return { scheduled: 0, permissionDenied: true };
  }

  const body = buildReminderBody(options.overdueDays ?? 0);
  const times = resolveScheduledTimes(settings.reminderFrequency, settings.reminderTimes);
  let scheduled = 0;

  for (const time24 of times) {
    const parsed = parseReminderTime24(time24);
    if (!parsed) {
      continue;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: REMINDER_NOTIFICATION_TITLE,
        body,
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: parsed.hour,
        minute: parsed.minute,
        channelId: ANDROID_CHANNEL_ID,
      },
    });
    scheduled += 1;
  }

  return { scheduled };
}

/** Loads settings + overdue count, then syncs reminder copy. */
export async function syncOwnerReminders(
  repository: LoanRepository,
): Promise<SyncRemindersResult> {
  const settings = await repository.getSettings();
  const overdueDays = await repository.countOverdueCollectionDays(
    formatISODateLocal(new Date()),
  );
  return syncReminders(
    {
      remindersEnabled: settings.remindersEnabled,
      reminderFrequency: settings.reminderFrequency,
      reminderTimes: settings.reminderTimes,
    },
    { overdueDays },
  );
}
