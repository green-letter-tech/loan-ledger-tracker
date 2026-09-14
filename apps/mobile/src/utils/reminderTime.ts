const TIME_24H_RE = /^(\d{1,2}):(\d{2})$/;
const TIME_12H_RE = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;

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

/** Parse user input like `7:00 PM`, `7:00 pm`, or `19:00` into 24h `HH:MM`. */
export function parseReminderTimeInput(input: string): string | null {
  const trimmed = input.trim().replace(/\s+/g, ' ');
  if (!trimmed) {
    return null;
  }

  const match24 = TIME_24H_RE.exec(trimmed);
  if (match24) {
    const hours = Number(match24[1]);
    const minutes = Number(match24[2]);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  const match12 = TIME_12H_RE.exec(trimmed);
  if (match12) {
    let hours = Number(match12[1]);
    const minutes = Number(match12[2]);
    const period = match12[3].toUpperCase();

    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
      return null;
    }

    if (period === 'AM') {
      if (hours === 12) {
        hours = 0;
      }
    } else if (hours !== 12) {
      hours += 12;
    }

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  return null;
}
