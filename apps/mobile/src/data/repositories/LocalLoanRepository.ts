import {
  addCalendarDays,
  calculateLoan,
  deriveDailyEntryStatus,
  listEntryDates,
  type CreateLoanInput,
  type CreateLoaneeInput,
  type DailyEntry,
  type DashboardStats,
  type ExtendLoanMode,
  type Loan,
  type LoanRepository,
  type Loanee,
  type OwnerSettings,
  type UpdateLoaneeInput,
  type UpdateOwnerSettingsInput,
} from '@lendledger/core';
import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  DailyEntryRow,
  LoanRow,
  LoaneeRow,
  OwnerSettingsRow,
  ReminderFrequency,
  ThemeSetting,
} from '../db/schema';
import { createId } from '../db/uuid';

type LoanRowJoined = LoanRow & { rate_period: string };

export class LocalLoanRepository implements LoanRepository {
  constructor(
    private readonly db: SQLiteDatabase,
    private readonly ownerId: string,
  ) {}

  async getSettings(): Promise<OwnerSettings> {
    const row = await this.db.getFirstAsync<OwnerSettingsRow>(
      'SELECT * FROM owner_settings WHERE owner_id = ?',
      this.ownerId,
    );
    if (!row) {
      throw new Error('Owner settings not found');
    }
    return mapSettings(row);
  }

  async updateSettings(input: UpdateOwnerSettingsInput): Promise<OwnerSettings> {
    const current = await this.getSettings();
    const next = {
      theme: input.theme ?? current.theme,
      remindersEnabled: input.remindersEnabled ?? current.remindersEnabled,
      reminderTimes: input.reminderTimes ?? current.reminderTimes,
      reminderFrequency: input.reminderFrequency ?? current.reminderFrequency,
      onboarded: input.onboarded ?? current.onboarded,
    };

    await this.db.runAsync(
      `UPDATE owner_settings SET
        theme = ?,
        reminders_enabled = ?,
        reminder_times = ?,
        reminder_frequency = ?,
        onboarded = ?
      WHERE owner_id = ?`,
      next.theme,
      next.remindersEnabled ? 1 : 0,
      JSON.stringify(next.reminderTimes),
      next.reminderFrequency,
      next.onboarded ? 1 : 0,
      this.ownerId,
    );

    return this.getSettings();
  }

  async listLoanees(): Promise<Loanee[]> {
    const rows = await this.db.getAllAsync<LoaneeRow>(
      'SELECT * FROM loanees WHERE owner_id = ? ORDER BY name COLLATE NOCASE',
      this.ownerId,
    );
    return rows.map(mapLoanee);
  }

  async createLoanee(input: CreateLoaneeInput): Promise<Loanee> {
    const id = createId();
    const createdAt = new Date().toISOString();
    await this.db.runAsync(
      `INSERT INTO loanees (id, owner_id, name, phone, notes, avatar_hue, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      id,
      this.ownerId,
      input.name,
      input.phone ?? null,
      input.notes ?? null,
      input.avatarHue ?? 254,
      createdAt,
    );
    return (await this.getLoaneeById(id))!;
  }

  async updateLoanee(id: string, input: UpdateLoaneeInput): Promise<Loanee> {
    const existing = await this.getLoaneeById(id);
    if (!existing) {
      throw new Error(`Loanee not found: ${id}`);
    }

    await this.db.runAsync(
      `UPDATE loanees SET name = ?, phone = ?, notes = ?, avatar_hue = ? WHERE id = ? AND owner_id = ?`,
      input.name ?? existing.name,
      input.phone !== undefined ? input.phone : existing.phone,
      input.notes !== undefined ? input.notes : existing.notes,
      input.avatarHue ?? existing.avatarHue,
      id,
      this.ownerId,
    );

    return (await this.getLoaneeById(id))!;
  }

  async deleteLoanee(id: string): Promise<void> {
    const active = await this.db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM loans
       WHERE loanee_id = ? AND owner_id = ? AND status IN ('active', 'extended')`,
      id,
      this.ownerId,
    );
    if ((active?.count ?? 0) > 0) {
      throw new Error('Cannot delete loanee with active loans');
    }

    await this.db.runAsync('DELETE FROM loanees WHERE id = ? AND owner_id = ?', id, this.ownerId);
  }

  async createLoan(input: CreateLoanInput): Promise<Loan> {
    const calc = calculateLoan({
      principal: input.principal,
      interestRate: input.interestRate,
      ratePeriod: input.ratePeriod,
      duration: input.duration,
      durationUnit: input.durationUnit,
      startDate: input.startDate,
    });

    if (!calc.endDate || calc.durationDays <= 0) {
      throw new Error('Invalid loan duration');
    }

    const loanId = createId();
    const createdAt = new Date().toISOString();
    const entryDates = listEntryDates(input.startDate, calc.durationDays);

    await this.db.withTransactionAsync(async () => {
      await this.db.runAsync(
        `INSERT INTO loans (
          id, owner_id, loanee_id, principal, interest_rate, rate_period,
          duration_days, daily_expected, total_expected, start_date, end_date, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
        loanId,
        this.ownerId,
        input.loaneeId,
        input.principal,
        input.interestRate,
        input.ratePeriod,
        calc.durationDays,
        calc.dailyExpected,
        calc.totalExpected,
        input.startDate,
        calc.endDate,
        createdAt,
      );

      for (const entryDate of entryDates) {
        await this.db.runAsync(
          `INSERT INTO daily_entries (id, loan_id, entry_date, expected_amount, received_amount, status)
           VALUES (?, ?, ?, ?, 0, 'unpaid')`,
          createId(),
          loanId,
          entryDate,
          calc.dailyExpected,
        );
      }
    });

    return (await this.getLoan(loanId))!;
  }

  async getLoan(id: string): Promise<Loan | null> {
    const row = await this.db.getFirstAsync<LoanRowJoined>(
      'SELECT * FROM loans WHERE id = ? AND owner_id = ?',
      id,
      this.ownerId,
    );
    return row ? mapLoan(row) : null;
  }

  async listActiveLoans(): Promise<Loan[]> {
    const rows = await this.db.getAllAsync<LoanRowJoined>(
      `SELECT * FROM loans WHERE owner_id = ? AND status IN ('active', 'extended') ORDER BY created_at DESC`,
      this.ownerId,
    );
    return rows.map(mapLoan);
  }

  async getDailyEntries(loanId: string): Promise<DailyEntry[]> {
    const rows = await this.db.getAllAsync<DailyEntryRow>(
      'SELECT * FROM daily_entries WHERE loan_id = ? ORDER BY entry_date ASC',
      loanId,
    );
    return rows.map(mapDailyEntry);
  }

  async updateDailyEntry(
    loanId: string,
    entryDate: string,
    receivedAmount: number,
  ): Promise<DailyEntry> {
    const row = await this.db.getFirstAsync<DailyEntryRow>(
      'SELECT * FROM daily_entries WHERE loan_id = ? AND entry_date = ?',
      loanId,
      entryDate,
    );
    if (!row) {
      throw new Error(`Daily entry not found for ${entryDate}`);
    }

    const status = deriveDailyEntryStatus(row.expected_amount, receivedAmount);
    await this.db.runAsync(
      'UPDATE daily_entries SET received_amount = ?, status = ? WHERE id = ?',
      receivedAmount,
      status,
      row.id,
    );

    const updated = await this.db.getFirstAsync<DailyEntryRow>(
      'SELECT * FROM daily_entries WHERE id = ?',
      row.id,
    );
    return mapDailyEntry(updated!);
  }

  async extendLoan(loanId: string, days: number, mode: ExtendLoanMode): Promise<Loan> {
    if (days <= 0) {
      throw new Error('Extension days must be positive');
    }

    const loan = await this.getLoan(loanId);
    if (!loan) {
      throw new Error(`Loan not found: ${loanId}`);
    }
    if (loan.status === 'closed') {
      throw new Error('Cannot extend a closed loan');
    }

    const entries = await this.getDailyEntries(loanId);
    let newExpected = loan.dailyExpected;

    if (mode === 'recalculate') {
      const outstanding = entries.reduce(
        (sum, entry) => sum + Math.max(0, entry.expectedAmount - entry.receivedAmount),
        0,
      );
      newExpected = Math.round((outstanding / days) * 100) / 100;
    }

    const newDates: string[] = [];
    for (let i = 1; i <= days; i += 1) {
      newDates.push(addCalendarDays(loan.endDate, i));
    }
    const newEndDate = newDates[newDates.length - 1];

    await this.db.withTransactionAsync(async () => {
      for (const entryDate of newDates) {
        await this.db.runAsync(
          `INSERT INTO daily_entries (id, loan_id, entry_date, expected_amount, received_amount, status)
           VALUES (?, ?, ?, ?, 0, 'unpaid')`,
          createId(),
          loanId,
          entryDate,
          newExpected,
        );
      }

      await this.db.runAsync(
        `UPDATE loans SET end_date = ?, duration_days = duration_days + ?, status = 'extended' WHERE id = ?`,
        newEndDate,
        days,
        loanId,
      );
    });

    return (await this.getLoan(loanId))!;
  }

  async closeLoan(loanId: string): Promise<Loan> {
    const loan = await this.getLoan(loanId);
    if (!loan) {
      throw new Error(`Loan not found: ${loanId}`);
    }

    await this.db.runAsync(`UPDATE loans SET status = 'closed' WHERE id = ?`, loanId);
    return (await this.getLoan(loanId))!;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const activeLoans = await this.listActiveLoans();
    const totalLoaned = activeLoans.reduce((sum, loan) => sum + loan.principal, 0);
    const activeCount = activeLoans.length;

    const receivedRow = await this.db.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(de.received_amount), 0) as total
       FROM daily_entries de
       JOIN loans l ON l.id = de.loan_id
       WHERE l.owner_id = ?`,
      this.ownerId,
    );
    const totalReceived = receivedRow?.total ?? 0;

    const outstandingRows = await this.db.getAllAsync<{
      loanee_id: string;
      loanee_name: string;
      outstanding: number;
    }>(
      `SELECT l.loanee_id, ln.name as loanee_name,
              SUM(CASE
                WHEN de.received_amount < de.expected_amount
                THEN de.expected_amount - de.received_amount
                ELSE 0
              END) as outstanding
       FROM daily_entries de
       JOIN loans l ON l.id = de.loan_id
       JOIN loanees ln ON ln.id = l.loanee_id
       WHERE l.owner_id = ? AND l.status IN ('active', 'extended')
       GROUP BY l.loanee_id, ln.name`,
      this.ownerId,
    );

    const outstanding = outstandingRows.reduce((sum, row) => sum + row.outstanding, 0);

    const weeklyBar = await this.buildWeeklyBar();
    const line30d = await this.buildLine30d();

    return {
      totalLoaned,
      totalReceived,
      outstanding,
      activeCount,
      donutByLoanee: outstandingRows.map((row) => ({
        loaneeId: row.loanee_id,
        loaneeName: row.loanee_name,
        value: row.outstanding,
      })),
      weeklyBar,
      line30d,
    };
  }

  private async buildWeeklyBar(): Promise<DashboardStats['weeklyBar']> {
    const rows = await this.db.getAllAsync<{
      entry_date: string;
      expected: number;
      received: number;
    }>(
      `SELECT de.entry_date,
              SUM(de.expected_amount) as expected,
              SUM(de.received_amount) as received
       FROM daily_entries de
       JOIN loans l ON l.id = de.loan_id
       WHERE l.owner_id = ?
         AND de.entry_date >= date('now', '-6 days')
       GROUP BY de.entry_date
       ORDER BY de.entry_date ASC`,
      this.ownerId,
    );

    return rows.map((row) => ({
      label: row.entry_date.slice(5),
      expected: row.expected,
      received: row.received,
    }));
  }

  private async buildLine30d(): Promise<DashboardStats['line30d']> {
    const rows = await this.db.getAllAsync<{ entry_date: string; received: number }>(
      `SELECT de.entry_date, SUM(de.received_amount) as received
       FROM daily_entries de
       JOIN loans l ON l.id = de.loan_id
       WHERE l.owner_id = ?
         AND de.entry_date >= date('now', '-29 days')
       GROUP BY de.entry_date
       ORDER BY de.entry_date ASC`,
      this.ownerId,
    );

    let cumulative = 0;
    return rows.map((row) => {
      cumulative += row.received;
      return { date: row.entry_date, cumulative: Math.round(cumulative * 100) / 100 };
    });
  }

  private async getLoaneeById(id: string): Promise<Loanee | null> {
    const row = await this.db.getFirstAsync<LoaneeRow>(
      'SELECT * FROM loanees WHERE id = ? AND owner_id = ?',
      id,
      this.ownerId,
    );
    return row ? mapLoanee(row) : null;
  }
}

export async function createLocalLoanRepository(): Promise<LocalLoanRepository> {
  const { initializeDatabase } = await import('../db/client');
  const { db, ownerId } = await initializeDatabase();
  return new LocalLoanRepository(db, ownerId);
}

function mapSettings(row: OwnerSettingsRow): OwnerSettings {
  return {
    ownerId: row.owner_id,
    defaultCurrency: row.default_currency,
    theme: row.theme as ThemeSetting,
    remindersEnabled: row.reminders_enabled === 1,
    reminderTimes: JSON.parse(row.reminder_times) as string[],
    reminderFrequency: row.reminder_frequency as ReminderFrequency,
    onboarded: row.onboarded === 1,
  };
}

function mapLoanee(row: LoaneeRow): Loanee {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    phone: row.phone,
    notes: row.notes,
    avatarHue: row.avatar_hue,
    createdAt: row.created_at,
  };
}

function mapLoan(row: LoanRowJoined): Loan {
  return {
    id: row.id,
    ownerId: row.owner_id,
    loaneeId: row.loanee_id,
    principal: row.principal,
    interestRate: row.interest_rate,
    ratePeriod: row.rate_period as Loan['ratePeriod'],
    durationDays: row.duration_days,
    dailyExpected: row.daily_expected,
    totalExpected: row.total_expected,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapDailyEntry(row: DailyEntryRow): DailyEntry {
  return {
    id: row.id,
    loanId: row.loan_id,
    entryDate: row.entry_date,
    expectedAmount: row.expected_amount,
    receivedAmount: row.received_amount,
    status: row.status,
  };
}
