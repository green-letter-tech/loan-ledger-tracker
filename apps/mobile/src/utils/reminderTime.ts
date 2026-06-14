const TIME_24H_RE = /^(\d{1,2}):(\d{2})$/;

/** Display `19:00` as `7:00 PM` (matches canonical onboarding copy). */
export function formatReminderTime24To12(time24: string): string {
  const match = TIME_24H_RE.exec(time24.trim());
  if (!match) {
    return time24;
  }

  const hours24 = Number(match[1]);
  const minutes = match[2];
  if (hours24 < 0 || hours24 > 23) {
    return time24;
  }

  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${minutes} ${period}`;
}
