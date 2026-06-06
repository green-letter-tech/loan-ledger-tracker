import type { SQLiteDatabase } from 'expo-sqlite';

import { SCHEMA_VERSION } from './schema';
import { createId } from './uuid';

const MIGRATION_V1 = `
CREATE TABLE IF NOT EXISTS owners (
  id TEXT PRIMARY KEY,
  stytch_user_id TEXT,
  email TEXT,
  display_name TEXT
);

CREATE TABLE IF NOT EXISTS owner_settings (
  owner_id TEXT PRIMARY KEY REFERENCES owners(id),
  default_currency TEXT NOT NULL DEFAULT 'INR',
  theme TEXT NOT NULL DEFAULT 'light',
  reminders_enabled INTEGER NOT NULL DEFAULT 1,
  reminder_times TEXT NOT NULL DEFAULT '["19:00"]',
  reminder_frequency TEXT NOT NULL DEFAULT 'once_daily',
  onboarded INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS loanees (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES owners(id),
  name TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  avatar_hue INTEGER NOT NULL DEFAULT 254,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS loans (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES owners(id),
  loanee_id TEXT NOT NULL REFERENCES loanees(id),
  principal REAL NOT NULL,
  interest_rate REAL NOT NULL,
  rate_period TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  daily_expected REAL NOT NULL,
  total_expected REAL NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_entries (
  id TEXT PRIMARY KEY,
  loan_id TEXT NOT NULL REFERENCES loans(id),
  entry_date TEXT NOT NULL,
  expected_amount REAL NOT NULL,
  received_amount REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'unpaid',
  UNIQUE(loan_id, entry_date)
);

CREATE INDEX IF NOT EXISTS idx_loanees_owner ON loanees(owner_id);
CREATE INDEX IF NOT EXISTS idx_loans_owner ON loans(owner_id);
CREATE INDEX IF NOT EXISTS idx_loans_loanee ON loans(loanee_id);
CREATE INDEX IF NOT EXISTS idx_daily_entries_loan ON daily_entries(loan_id);
`;

async function getUserVersion(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  return row?.user_version ?? 0;
}

async function setUserVersion(db: SQLiteDatabase, version: number): Promise<void> {
  await db.execAsync(`PRAGMA user_version = ${version}`);
}

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const current = await getUserVersion(db);

  if (current < 1) {
    await db.execAsync(MIGRATION_V1);
    await setUserVersion(db, 1);
  }

  if (SCHEMA_VERSION > 1) {
    throw new Error(`Database schema v${SCHEMA_VERSION} not implemented (at v${await getUserVersion(db)})`);
  }
}

/** MVP1: single local owner + default settings on first launch. */
export async function seedDefaultOwner(db: SQLiteDatabase): Promise<string> {
  const existing = await db.getFirstAsync<{ id: string }>('SELECT id FROM owners LIMIT 1');
  if (existing?.id) {
    return existing.id;
  }

  const ownerId = createId();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'INSERT INTO owners (id, stytch_user_id, email, display_name) VALUES (?, NULL, NULL, NULL)',
      ownerId,
    );
    await db.runAsync(
      `INSERT INTO owner_settings (
        owner_id, default_currency, theme, reminders_enabled,
        reminder_times, reminder_frequency, onboarded
      ) VALUES (?, 'INR', 'system', 1, '["19:00"]', 'once_daily', 0)`,
      ownerId,
    );
  });

  return ownerId;
}
