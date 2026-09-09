/** In-app privacy policy copy (mirror in docs/release/privacy-policy.md for Play Store). */
export const PRIVACY_POLICY_LAST_UPDATED = '14 June 2026';

export const PRIVACY_POLICY_SECTIONS: ReadonlyArray<{ title: string; body: string }> = [
  {
    title: 'Overview',
    body:
      'LendLedger helps small business owners track daily lending and collections. This policy explains what data the app handles and how it is stored.',
  },
  {
    title: 'Data we collect',
    body:
      'LendLedger does not require an account. We do not collect personal information on our servers. All loan, loanee, and payment data you enter stays on your device in a local database.',
  },
  {
    title: 'Notifications',
    body:
      'If you enable reminders, LendLedger schedules local notifications on your device to prompt you to update collections. Notification content is generated on-device; we do not send push messages from a backend.',
  },
  {
    title: 'Third parties',
    body:
      'MVP1 does not share your data with analytics providers, advertisers, or cloud sync services. Future versions may offer optional cloud backup with separate consent.',
  },
  {
    title: 'Your choices',
    body:
      'You can delete loanees and loans in the app, turn off reminders in Settings, or uninstall the app to remove all local data from your device.',
  },
  {
    title: 'Contact',
    body:
      'Questions about this policy can be sent to the developer contact listed on the Google Play Store listing.',
  },
];
