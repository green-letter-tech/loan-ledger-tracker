const { withEntitlementsPlist } = require('expo/config-plugins');

/**
 * Free Apple IDs (Personal Team) cannot sign apps with Push Notifications.
 * LendLedger MVP1 uses local scheduled reminders only — no remote APNs.
 * Strip aps-environment added by expo-notifications so `expo run:ios --device` works.
 */
module.exports = function withIosLocalNotificationsOnly(config) {
  return withEntitlementsPlist(config, (config) => {
    delete config.modResults['aps-environment'];
    return config;
  });
};
