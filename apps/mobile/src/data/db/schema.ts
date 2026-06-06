/**
 * SQLite schema types — mirrors spec §10 and plan Task 7.
 * Column names use snake_case to match SQL tables.
 */

export const DB_NAME = 'lendledger.db';

export const SCHEMA_VERSION = 1;

export type LoanStatus = 'active' | 'extended' | 'closed';

export type DailyEntryStatus = 'paid' | 'unpaid' | 'partial';

export type ThemeSetting = 'light' | 'dark' | 'system';

export type ReminderFrequency =
  | 'once_daily'
  | 'twice_daily'
  | 'three_times_daily'
  | 'custom';

export interface OwnerRow {
  id: string;
  stytch_user_id: string | null;
  email: string | null;
  display_name: string | null;
}

export interface OwnerSettingsRow {
  owner_id: string;
  default_currency: string;
  theme: ThemeSetting;
  reminders_enabled: number;
  reminder_times: string;
  reminder_frequency: ReminderFrequency;
  onboarded: number;
}

export interface LoaneeRow {
  id: string;
  owner_id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  avatar_hue: number;
  created_at: string;
}

export interface LoanRow {
  id: string;
  owner_id: string;
  loanee_id: string;
  principal: number;
  interest_rate: number;
  rate_period: string;
  duration_days: number;
  daily_expected: number;
  total_expected: number;
  start_date: string;
  end_date: string;
  status: LoanStatus;
  created_at: string;
}

export interface DailyEntryRow {
  id: string;
  loan_id: string;
  entry_date: string;
  expected_amount: number;
  received_amount: number;
  status: DailyEntryStatus;
}
