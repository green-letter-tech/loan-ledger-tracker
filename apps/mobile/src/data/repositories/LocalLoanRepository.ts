import {
  addCalendarDays,
  buildPaymentSchedule,
  calculateLoan,
  computeOutstandingBalance,
  computeRecoverySplit,
  resolveExtendDaily,
  deriveDailyEntryStatus,
  formatISODateLocal,
  sumRecoverySplits,
  type BulkEntryUpdate,
  type BulkUpdateResult,
  type CreateLoanInput,
  type CreateLoaneeInput,
  type DailyEntry,
  type DashboardStats,
  type DatedEntry,
  type ExtendLoanMode,
  type Loan,
  type LoanChain,
  type LoanRepository,
  type Loanee,
  type OwnerSettings,
  type RefinanceLoanInput,
  type UpdateLoaneeInput,
  type UpdateOwnerSettingsInput,
} from '@lendledger/core';
import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  DailyEntryRow,
  LoanClosedReason,
  LoanRow,
  LoaneeRow,
  OwnerSettingsRow,
  ReminderFrequency,
  ThemeSetting,
} from '../db/schema';
import { createId } from '../db/uuid';

type LoanRowJoined = LoanRow & { rate_period: string };

/** Statuses that still accept collections. */
const RUNNING_STATUSES = "('active', 'extended')";

/** Statuses whose rows are removed with their loanee. */
const FINISHED_STATUSES = "('closed', 'refinanced')";

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
       WHERE loanee_id = ? AND owner_id = ? AND status IN ${RUNNING_STATUSES}`,
      id,
      this.ownerId,
    );
    if ((active?.count ?? 0) > 0) {
      throw new Error('Cannot delete loanee with active loans');
    }

    await this.db.withTransactionAsync(async () => {
      const finishedLoans = await this.db.getAllAsync<{ id: string }>(
        `SELECT id FROM loans WHERE loanee_id = ? AND owner_id = ? AND status IN ${FINISHED_STATUSES}`,
        id,
        this.ownerId,
      );

      for (const loan of finishedLoans) {
        await this.db.runAsync('DELETE FROM daily_entries WHERE loan_id = ?', loan.id);
      }

      await this.db.runAsync(
        `DELETE FROM loans WHERE loanee_id = ? AND owner_id = ? AND status IN ${FINISHED_STATUSES}`,
        id,
        this.ownerId,
      );
      await this.db.runAsync('DELETE FROM loanees WHERE id = ? AND owner_id = ?', id, this.ownerId);
    });
  }

  async createLoan(input: CreateLoanInput): Promise<Loan> {
    const loanee = await this.getLoaneeById(input.loaneeId);
    if (!loanee) {
      throw new Error(`Loanee not found: ${input.loaneeId}`);
    }

    let loanId = '';
    await this.db.withTransactionAsync(async () => {
      loanId = await this.insertLoan(input);
    });

    return (await this.getLoan(loanId))!;
  }

  /**
   * Inserts a loan and its payment schedule. Caller must already be inside a
   * transaction — shared by `createLoan` and `refinanceLoan`.
   */
  private async insertLoan(
    input: CreateLoanInput,
    refinancedFromLoanId: string | null = null,
  ): Promise<string> {
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
    const schedule = buildPaymentSchedule(
      input.startDate,
      input.duration,
      input.durationUnit,
      calc.totalExpected,
    );

    await this.db.runAsync(
      `INSERT INTO loans (
        id, owner_id, loanee_id, principal, interest_rate, rate_period,
        duration_unit, duration_count, duration_days, daily_expected, total_expected,
        start_date, end_date, status, created_at, refinanced_from_loan_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
      loanId,
      this.ownerId,
      input.loaneeId,
      input.principal,
      input.interestRate,
      input.ratePeriod,
      input.durationUnit,
      input.duration,
      calc.durationDays,
      schedule.expectedPerEntry,
      calc.totalExpected,
      input.startDate,
      calc.endDate,
      createdAt,
      refinancedFromLoanId,
    );

    for (const entryDate of schedule.entryDates) {
      await this.db.runAsync(
        `INSERT INTO daily_entries (id, loan_id, entry_date, expected_amount, received_amount, status)
         VALUES (?, ?, ?, ?, 0, 'unpaid')`,
        createId(),
        loanId,
        entryDate,
        schedule.expectedPerEntry,
      );
    }

    return loanId;
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
      `SELECT * FROM loans WHERE owner_id = ? AND status IN ${RUNNING_STATUSES} ORDER BY created_at DESC`,
      this.ownerId,
    );
    return rows.map(mapLoan);
  }

  async getDailyEntries(loanId: string): Promise<DailyEntry[]> {
    const rows = await this.db.getAllAsync<DailyEntryRow>(
      `SELECT de.* FROM daily_entries de
       JOIN loans l ON l.id = de.loan_id
       WHERE de.loan_id = ? AND l.owner_id = ?
       ORDER BY de.entry_date DESC`,
      loanId,
      this.ownerId,
    );
    return rows.map(mapDailyEntry);
  }

  async updateDailyEntry(
    loanId: string,
    entryDate: string,
    receivedAmount: number,
  ): Promise<DailyEntry> {
    if (!Number.isFinite(receivedAmount) || receivedAmount < 0) {
      throw new Error('Received amount must be a non-negative number');
    }

    const row = await this.db.getFirstAsync<DailyEntryRow>(
      `SELECT de.* FROM daily_entries de
       JOIN loans l ON l.id = de.loan_id
       WHERE de.loan_id = ? AND de.entry_date = ? AND l.owner_id = ?`,
      loanId,
      entryDate,
      this.ownerId,
    );
    if (!row) {
      throw new Error(`Daily entry not found for ${entryDate}`);
    }

    await this.writeEntryAmount(row.id, row.expected_amount, receivedAmount);

    const updated = await this.db.getFirstAsync<DailyEntryRow>(
      'SELECT * FROM daily_entries WHERE id = ?',
      row.id,
    );
    return mapDailyEntry(updated!);
  }

  /** Single place where a received amount and its derived status are persisted. */
  private async writeEntryAmount(
    entryId: string,
    expectedAmount: number,
    receivedAmount: number,
  ): Promise<void> {
    await this.db.runAsync(
      'UPDATE daily_entries SET received_amount = ?, status = ? WHERE id = ?',
      receivedAmount,
      deriveDailyEntryStatus(expectedAmount, receivedAmount),
      entryId,
    );
  }

  async listEntriesForDate(entryDate: string): Promise<DatedEntry[]> {
    const entryRows = await this.db.getAllAsync<DailyEntryRow>(
      `SELECT de.* FROM daily_entries de
       JOIN loans l ON l.id = de.loan_id
       WHERE l.owner_id = ? AND l.status IN ${RUNNING_STATUSES} AND de.entry_date = ?`,
      this.ownerId,
      entryDate,
    );
    if (entryRows.length === 0) {
      return [];
    }

    const [loans, loanees] = await Promise.all([this.listActiveLoans(), this.listLoanees()]);
    const loanById = new Map(loans.map((loan) => [loan.id, loan]));
    const loaneeById = new Map(loanees.map((loanee) => [loanee.id, loanee]));

    const rows: DatedEntry[] = [];
    for (const entryRow of entryRows) {
      const loan = loanById.get(entryRow.loan_id);
      const loanee = loan ? loaneeById.get(loan.loaneeId) : undefined;
      if (loan && loanee) {
        rows.push({ loan, loanee, entry: mapDailyEntry(entryRow) });
      }
    }

    return rows.sort(
      (a, b) =>
        a.loanee.name.localeCompare(b.loanee.name, undefined, { sensitivity: 'base' }) ||
        a.loan.createdAt.localeCompare(b.loan.createdAt),
    );
  }

  async bulkUpdateDailyEntries(
    entryDate: string,
    updates: BulkEntryUpdate[],
  ): Promise<BulkUpdateResult> {
    // Validate everything up front so a bad row can never leave a partial write.
    for (const update of updates) {
      if (!Number.isFinite(update.receivedAmount) || update.receivedAmount < 0) {
        throw new Error(`Received amount must be a non-negative number (loan ${update.loanId})`);
      }
    }

    if (updates.length === 0) {
      return { updated: 0, skipped: [] };
    }

    const rows = await this.db.getAllAsync<{
      id: string;
      loan_id: string;
      expected_amount: number;
    }>(
      `SELECT de.id, de.loan_id, de.expected_amount
       FROM daily_entries de
       JOIN loans l ON l.id = de.loan_id
       WHERE l.owner_id = ? AND l.status IN ${RUNNING_STATUSES} AND de.entry_date = ?`,
      this.ownerId,
      entryDate,
    );
    const collectable = new Map(rows.map((row) => [row.loan_id, row]));

    const applicable: Array<{ entryId: string; expected: number; received: number }> = [];
    const skipped: string[] = [];
    for (const update of updates) {
      const row = collectable.get(update.loanId);
      if (!row) {
        skipped.push(update.loanId);
        continue;
      }
      applicable.push({
        entryId: row.id,
        expected: row.expected_amount,
        received: update.receivedAmount,
      });
    }

    await this.db.withTransactionAsync(async () => {
      for (const item of applicable) {
        await this.writeEntryAmount(item.entryId, item.expected, item.received);
      }
    });

    return { updated: applicable.length, skipped };
  }

  async extendLoan(
    loanId: string,
    days: number,
    mode: ExtendLoanMode,
    customTotal?: number,
  ): Promise<Loan> {
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
    const newExpected = resolveExtendDaily({
      mode,
      dailyExpected: loan.dailyExpected,
      extensionDays: days,
      outstanding: computeOutstandingBalance(entries),
      customTotal,
    });

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

    const closedReason: LoanClosedReason = 'manual';
    await this.db.runAsync(
      `UPDATE loans SET status = 'closed', closed_at = ?, closed_reason = ? WHERE id = ?`,
      new Date().toISOString(),
      closedReason,
      loanId,
    );
    return (await this.getLoan(loanId))!;
  }

  async refinanceLoan(input: RefinanceLoanInput): Promise<{ oldLoan: Loan; newLoan: Loan }> {
    const { oldLoanId, newLoan, settlement } = input;

    const existing = await this.getLoan(oldLoanId);
    if (!existing) {
      throw new Error(`Loan not found: ${oldLoanId}`);
    }
    if (existing.status !== 'active' && existing.status !== 'extended') {
      throw new Error(`Cannot refinance a ${existing.status} loan`);
    }
    if (newLoan.loaneeId !== existing.loaneeId) {
      throw new Error('Refinanced loan must belong to the same loanee');
    }

    const loanee = await this.getLoaneeById(newLoan.loaneeId);
    if (!loanee) {
      throw new Error(`Loanee not found: ${newLoan.loaneeId}`);
    }

    let newLoanId = '';
    const closedReason: LoanClosedReason = 'refinanced';
    await this.db.withTransactionAsync(async () => {
      newLoanId = await this.insertLoan(newLoan, oldLoanId);

      // The old schedule is left untouched: no cash was collected for the
      // remaining days, so recording them as paid would inflate every total.
      await this.db.runAsync(
        `UPDATE loans SET
           status = 'refinanced',
           closed_at = ?,
           closed_reason = ?,
           refinanced_to_loan_id = ?,
           settlement_deduction = ?,
           settlement_principal = ?,
           settlement_interest = ?,
           interest_waived = ?
         WHERE id = ? AND owner_id = ?`,
        new Date().toISOString(),
        closedReason,
        newLoanId,
        settlement.deduction,
        settlement.settlementPrincipal,
        settlement.settlementInterest,
        settlement.interestWaived,
        oldLoanId,
        this.ownerId,
      );
    });

    return {
      oldLoan: (await this.getLoan(oldLoanId))!,
      newLoan: (await this.getLoan(newLoanId))!,
    };
  }

  async getLoanChain(loanId: string): Promise<LoanChain> {
    const loan = await this.getLoan(loanId);
    if (!loan) {
      return { previous: null, next: null };
    }
    const [previous, next] = await Promise.all([
      loan.refinancedFromLoanId ? this.getLoan(loan.refinancedFromLoanId) : Promise.resolve(null),
      loan.refinancedToLoanId ? this.getLoan(loan.refinancedToLoanId) : Promise.resolve(null),
    ]);
    return { previous, next };
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const activeLoans = await this.listActiveLoans();
    const totalLoaned = activeLoans.reduce((sum, loan) => sum + loan.principal, 0);
    const activeCount = activeLoans.length;

    const receivedRow = await this.db.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(de.received_amount), 0) as total
       FROM daily_entries de
       JOIN loans l ON l.id = de.loan_id
       WHERE l.owner_id = ? AND l.status IN ${RUNNING_STATUSES}`,
      this.ownerId,
    );
    const totalReceived = receivedRow?.total ?? 0;

    const recovery = sumRecoverySplits(
      await this.buildRecoverySplits(activeLoans),
    );

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
       WHERE l.owner_id = ? AND l.status IN ${RUNNING_STATUSES}
       GROUP BY l.loanee_id, ln.name`,
      this.ownerId,
    );

    const outstanding = outstandingRows.reduce((sum, row) => sum + row.outstanding, 0);

    const today = formatISODateLocal(new Date());
    const weeklyBar = await this.buildWeeklyBar(today);
    const line30d = await this.buildLine30d(today);

    return {
      totalLoaned,
      totalReceived,
      outstanding,
      activeCount,
      principalRecovered: recovery.principalRecovered,
      interestRecovered: recovery.interestRecovered,
      principalOutstanding: recovery.principalOutstanding,
      interestOutstanding: recovery.interestOutstanding,
      donutByLoanee: outstandingRows.map((row) => ({
        loaneeId: row.loanee_id,
        loaneeName: row.loanee_name,
        value: row.outstanding,
      })),
      weeklyBar,
      line30d,
    };
  }

  /**
   * Recovery per loan from aggregated totals. `computeRecoverySplit` only reads
   * the sums, so one aggregate row per loan gives the same answer as every entry.
   */
  private async buildRecoverySplits(loans: Loan[]) {
    if (loans.length === 0) {
      return [];
    }

    const rows = await this.db.getAllAsync<{
      loan_id: string;
      expected: number;
      received: number;
    }>(
      `SELECT de.loan_id,
              SUM(de.expected_amount) as expected,
              SUM(de.received_amount) as received
       FROM daily_entries de
       JOIN loans l ON l.id = de.loan_id
       WHERE l.owner_id = ? AND l.status IN ${RUNNING_STATUSES}
       GROUP BY de.loan_id`,
      this.ownerId,
    );
    const totalsByLoan = new Map(rows.map((row) => [row.loan_id, row]));

    return loans.map((loan) => {
      const totals = totalsByLoan.get(loan.id);
      return computeRecoverySplit(loan, [
        {
          expectedAmount: totals?.expected ?? 0,
          receivedAmount: totals?.received ?? 0,
        },
      ]);
    });
  }

  private async buildWeeklyBar(today: string): Promise<DashboardStats['weeklyBar']> {
    const weekStart = addCalendarDays(today, -6);
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
         AND de.entry_date BETWEEN ? AND ?
       GROUP BY de.entry_date
       ORDER BY de.entry_date ASC`,
      this.ownerId,
      weekStart,
      today,
    );

    return rows.map((row) => ({
      label: row.entry_date.slice(5),
      expected: row.expected,
      received: row.received,
    }));
  }

  private async buildLine30d(today: string): Promise<DashboardStats['line30d']> {
    const monthStart = addCalendarDays(today, -29);
    const rows = await this.db.getAllAsync<{ entry_date: string; received: number }>(
      `SELECT de.entry_date, SUM(de.received_amount) as received
       FROM daily_entries de
       JOIN loans l ON l.id = de.loan_id
       WHERE l.owner_id = ?
         AND de.entry_date BETWEEN ? AND ?
       GROUP BY de.entry_date
       ORDER BY de.entry_date ASC`,
      this.ownerId,
      monthStart,
      today,
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
    durationUnit: (row.duration_unit ?? 'days') as Loan['durationUnit'],
    durationCount: row.duration_count ?? row.duration_days,
    durationDays: row.duration_days,
    dailyExpected: row.daily_expected,
    totalExpected: row.total_expected,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    createdAt: row.created_at,
    closedAt: row.closed_at ?? null,
    closedReason: row.closed_reason ?? null,
    refinancedFromLoanId: row.refinanced_from_loan_id ?? null,
    refinancedToLoanId: row.refinanced_to_loan_id ?? null,
    // A settlement exists as soon as a deduction was recorded — including ₹0,
    // where the lender waived it but still forgave the remaining interest.
    settlement:
      row.settlement_deduction === null || row.settlement_deduction === undefined
        ? null
        : {
            deduction: row.settlement_deduction,
            settlementPrincipal: row.settlement_principal ?? 0,
            settlementInterest: row.settlement_interest ?? 0,
            interestWaived: row.interest_waived ?? 0,
          },
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
