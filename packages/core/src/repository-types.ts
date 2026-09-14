import type { DurationUnit, ISODateString, RatePeriod } from './types';
import type { DailyEntryStatus } from './entryStatus';

export type LoanStatus = 'active' | 'extended' | 'closed' | 'refinanced';

/** Why a loan stopped running. */
export type LoanClosedReason = 'manual' | 'refinanced';

/**
 * Recorded when a loan is settled by refinancing: the deduction withheld from the
 * new loan's principal, split into the portions that repaid principal and interest,
 * plus the future interest the lender forgave by ending the term early.
 */
export interface LoanSettlement {
  deduction: number;
  settlementPrincipal: number;
  settlementInterest: number;
  interestWaived: number;
}

export type ThemeSetting = 'light' | 'dark' | 'system';

export type ReminderFrequency =
  | 'once_daily'
  | 'twice_daily'
  | 'three_times_daily'
  | 'custom';

export type ExtendLoanMode = 'keep_daily' | 'recalculate' | 'custom';

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
  closedAt: string | null;
  closedReason: LoanClosedReason | null;
  /** Set on the loan that replaced an earlier one. */
  refinancedFromLoanId: string | null;
  /** Set on the loan that was settled by a later one. */
  refinancedToLoanId: string | null;
  settlement: LoanSettlement | null;
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
  /** Cumulative recovery across active loans, split proportionally. */
  principalRecovered: number;
  interestRecovered: number;
  principalOutstanding: number;
  interestOutstanding: number;
  donutByLoanee: DonutSlice[];
  weeklyBar: WeeklyBarPoint[];
  line30d: LinePoint[];
}

/** One collectable row for a given date, used by the bulk update screen. */
export interface DatedEntry {
  loan: Loan;
  loanee: Loanee;
  entry: DailyEntry;
}

export interface BulkEntryUpdate {
  loanId: string;
  receivedAmount: number;
}

export interface BulkUpdateResult {
  updated: number;
  /** Loan ids that no longer had a collectable entry on that date. */
  skipped: string[];
}

export interface RefinanceLoanInput {
  oldLoanId: string;
  newLoan: CreateLoanInput;
  settlement: LoanSettlement;
}

export interface LoanChain {
  previous: Loan | null;
  next: Loan | null;
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

  /** Collectable entries on one date across all running loans, ordered by loanee name. */
  listEntriesForDate(entryDate: ISODateString): Promise<DatedEntry[]>;

  bulkUpdateDailyEntries(
    entryDate: ISODateString,
    updates: BulkEntryUpdate[],
  ): Promise<BulkUpdateResult>;

  extendLoan(
    loanId: string,
    days: number,
    mode: ExtendLoanMode,
    customTotal?: number,
  ): Promise<Loan>;
  closeLoan(loanId: string): Promise<Loan>;

  /** Settle `oldLoanId` and start its replacement in one transaction. */
  refinanceLoan(input: RefinanceLoanInput): Promise<{ oldLoan: Loan; newLoan: Loan }>;

  getLoanChain(loanId: string): Promise<LoanChain>;

  getDashboardStats(): Promise<DashboardStats>;
}
