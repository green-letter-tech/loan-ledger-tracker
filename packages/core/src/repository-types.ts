import type { DurationUnit, ISODateString, RatePeriod } from './types';
import type { DailyEntryStatus } from './entryStatus';

export type LoanStatus = 'active' | 'extended' | 'closed';

export type ThemeSetting = 'light' | 'dark' | 'system';

export type ReminderFrequency =
  | 'once_daily'
  | 'twice_daily'
  | 'three_times_daily'
  | 'custom';

export type ExtendLoanMode = 'keep_daily' | 'recalculate';

export interface OwnerSettings {
  ownerId: string;
  defaultCurrency: string;
  theme: ThemeSetting;
  remindersEnabled: boolean;
  reminderTimes: string[];
  reminderFrequency: ReminderFrequency;
  onboarded: boolean;
}

export interface UpdateOwnerSettingsInput {
  theme?: ThemeSetting;
  remindersEnabled?: boolean;
  reminderTimes?: string[];
  reminderFrequency?: ReminderFrequency;
  onboarded?: boolean;
}

export interface Loanee {
  id: string;
  ownerId: string;
  name: string;
  phone: string | null;
  notes: string | null;
  avatarHue: number;
  createdAt: string;
}

export interface CreateLoaneeInput {
  name: string;
  phone?: string | null;
  notes?: string | null;
  avatarHue?: number;
}

export interface UpdateLoaneeInput {
  name?: string;
  phone?: string | null;
  notes?: string | null;
  avatarHue?: number;
}

export interface Loan {
  id: string;
  ownerId: string;
  loaneeId: string;
  principal: number;
  interestRate: number;
  ratePeriod: RatePeriod;
  durationUnit: DurationUnit;
  durationCount: number;
  durationDays: number;
  dailyExpected: number;
  totalExpected: number;
  startDate: ISODateString;
  endDate: ISODateString;
  status: LoanStatus;
  createdAt: string;
}

export interface CreateLoanInput {
  loaneeId: string;
  principal: number;
  interestRate: number;
  ratePeriod: RatePeriod;
  duration: number;
  durationUnit: DurationUnit;
  startDate: ISODateString;
}

export interface DailyEntry {
  id: string;
  loanId: string;
  entryDate: ISODateString;
  expectedAmount: number;
  receivedAmount: number;
  status: DailyEntryStatus;
}

export interface DonutSlice {
  loaneeId: string;
  loaneeName: string;
  value: number;
}

export interface WeeklyBarPoint {
  label: string;
  expected: number;
  received: number;
}

export interface LinePoint {
  date: ISODateString;
  cumulative: number;
}

export interface DashboardStats {
  totalLoaned: number;
  totalReceived: number;
  outstanding: number;
  activeCount: number;
  donutByLoanee: DonutSlice[];
  weeklyBar: WeeklyBarPoint[];
  line30d: LinePoint[];
}

export interface LoanRepository {
  getSettings(): Promise<OwnerSettings>;
  updateSettings(input: UpdateOwnerSettingsInput): Promise<OwnerSettings>;

  listLoanees(): Promise<Loanee[]>;
  createLoanee(input: CreateLoaneeInput): Promise<Loanee>;
  updateLoanee(id: string, input: UpdateLoaneeInput): Promise<Loanee>;
  deleteLoanee(id: string): Promise<void>;

  createLoan(input: CreateLoanInput): Promise<Loan>;
  getLoan(id: string): Promise<Loan | null>;
  listActiveLoans(): Promise<Loan[]>;
  getDailyEntries(loanId: string): Promise<DailyEntry[]>;

  updateDailyEntry(
    loanId: string,
    entryDate: ISODateString,
    receivedAmount: number,
  ): Promise<DailyEntry>;

  extendLoan(loanId: string, days: number, mode: ExtendLoanMode): Promise<Loan>;
  closeLoan(loanId: string): Promise<Loan>;

  getDashboardStats(): Promise<DashboardStats>;
}
