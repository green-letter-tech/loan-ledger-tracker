import { describe, it, expect, afterEach } from 'vitest';

import { deleteDatabaseSync, openDatabaseAsync } from 'expo-sqlite';

import { runMigrations, seedDefaultOwner } from '../../db/migrations';
import { createId } from '../../db/uuid';
import { LocalLoanRepository } from '../LocalLoanRepository';
import {
  createTestRepository,
  type TestLoanRepository,
} from '../../../test-utils/createTestRepository';

describe('LocalLoanRepository', () => {
  let repo: TestLoanRepository;

  afterEach(async () => {
    if (repo) {
      await repo.dispose();
    }
  });

  it('createLoan inserts one daily_entry per day', async () => {
    repo = await createTestRepository();
    const loanee = await repo.createLoanee({ name: 'Ravi Kumar', phone: '+91 99999' });
    const loan = await repo.createLoan({
      loaneeId: loanee.id,
      principal: 100,
      interestRate: 1,
      ratePeriod: 'day',
      duration: 50,
      durationUnit: 'days',
      startDate: '2026-06-06',
    });
    const entries = await repo.getDailyEntries(loan.id);
    expect(entries).toHaveLength(50);
    expect(entries[0].entryDate).toBe('2026-07-25');
    expect(entries[49].entryDate).toBe('2026-06-06');
    expect(loan.dailyExpected).toBe(3);
  });

  it('createLoan inserts one entry per month for monthly terms', async () => {
    repo = await createTestRepository();
    const loanee = await repo.createLoanee({ name: 'Monthly Borrower' });
    const loan = await repo.createLoan({
      loaneeId: loanee.id,
      principal: 1000,
      interestRate: 1,
      ratePeriod: 'month',
      duration: 3,
      durationUnit: 'months',
      startDate: '2026-02-15',
    });
    const entries = await repo.getDailyEntries(loan.id);
    expect(entries).toHaveLength(3);
    expect(entries.map((entry) => entry.entryDate)).toEqual([
      '2026-04-15',
      '2026-03-15',
      '2026-02-15',
    ]);
    expect(loan.durationUnit).toBe('months');
    expect(loan.durationCount).toBe(3);
  });

  it('blocks deleteLoanee when active loans exist', async () => {
    repo = await createTestRepository();
    const loanee = await repo.createLoanee({ name: 'Blocked Delete' });
    await repo.createLoan({
      loaneeId: loanee.id,
      principal: 100,
      interestRate: 1,
      ratePeriod: 'day',
      duration: 10,
      durationUnit: 'days',
      startDate: '2026-06-06',
    });
    await expect(repo.deleteLoanee(loanee.id)).rejects.toThrow(/active loans/);
  });

  it('deletes loanee and cascades closed loans', async () => {
    repo = await createTestRepository();
    const loanee = await repo.createLoanee({ name: 'Closed Only' });
    const loan = await repo.createLoan({
      loaneeId: loanee.id,
      principal: 100,
      interestRate: 1,
      ratePeriod: 'day',
      duration: 5,
      durationUnit: 'days',
      startDate: '2026-06-06',
    });
    await repo.closeLoan(loan.id);

    await repo.deleteLoanee(loanee.id);
    const loanees = await repo.listLoanees();
    expect(loanees.find((entry) => entry.id === loanee.id)).toBeUndefined();
  });

  it('sets loan status to closed', async () => {
    repo = await createTestRepository();
    const loanee = await repo.createLoanee({ name: 'Close Test' });
    const loan = await repo.createLoan({
      loaneeId: loanee.id,
      principal: 100,
      interestRate: 1,
      ratePeriod: 'day',
      duration: 5,
      durationUnit: 'days',
      startDate: '2026-06-06',
    });

    const closed = await repo.closeLoan(loan.id);
    expect(closed.status).toBe('closed');
    const active = await repo.listActiveLoans();
    expect(active.find((entry) => entry.id === loan.id)).toBeUndefined();
  });

  it('extends loan with new daily entries', async () => {
    repo = await createTestRepository();
    const loanee = await repo.createLoanee({ name: 'Extend Test' });
    const loan = await repo.createLoan({
      loaneeId: loanee.id,
      principal: 100,
      interestRate: 1,
      ratePeriod: 'day',
      duration: 5,
      durationUnit: 'days',
      startDate: '2026-06-06',
    });

    const extended = await repo.extendLoan(loan.id, 3, 'keep_daily');
    expect(extended.status).toBe('extended');
    expect(extended.durationDays).toBe(8);
    expect(extended.endDate).toBe('2026-06-13');

    const entries = await repo.getDailyEntries(loan.id);
    expect(entries).toHaveLength(8);
    expect(entries.slice(5).every((entry) => entry.expectedAmount === loan.dailyExpected)).toBe(true);
  });

  it('derives entry status on updateDailyEntry', async () => {
    repo = await createTestRepository();
    const loanee = await repo.createLoanee({ name: 'Status Test' });
    const loan = await repo.createLoan({
      loaneeId: loanee.id,
      principal: 100,
      interestRate: 1,
      ratePeriod: 'day',
      duration: 5,
      durationUnit: 'days',
      startDate: '2026-06-06',
    });
    expect(loan.dailyExpected).toBe(21);
    const paid = await repo.updateDailyEntry(loan.id, '2026-06-06', 21);
    expect(paid.status).toBe('paid');
    const partial = await repo.updateDailyEntry(loan.id, '2026-06-07', 10);
    expect(partial.status).toBe('partial');
  });

  it('rejects createLoan for an unknown loanee', async () => {
    repo = await createTestRepository();
    await expect(
      repo.createLoan({
        loaneeId: 'does-not-exist',
        principal: 100,
        interestRate: 1,
        ratePeriod: 'day',
        duration: 5,
        durationUnit: 'days',
        startDate: '2026-06-06',
      }),
    ).rejects.toThrow(/Loanee not found/);
  });

  it('rejects negative received amounts', async () => {
    repo = await createTestRepository();
    const loanee = await repo.createLoanee({ name: 'Negative Test' });
    const loan = await repo.createLoan({
      loaneeId: loanee.id,
      principal: 100,
      interestRate: 1,
      ratePeriod: 'day',
      duration: 5,
      durationUnit: 'days',
      startDate: '2026-06-06',
    });
    await expect(repo.updateDailyEntry(loan.id, '2026-06-06', -5)).rejects.toThrow(
      /non-negative/,
    );
  });

  it('excludes future-dated entries from dashboard charts', async () => {
    repo = await createTestRepository();
    const loanee = await repo.createLoanee({ name: 'Future Test' });
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const startDate = `${yyyy}-${mm}-${dd}`;

    await repo.createLoan({
      loaneeId: loanee.id,
      principal: 100,
      interestRate: 1,
      ratePeriod: 'day',
      duration: 30,
      durationUnit: 'days',
      startDate,
    });

    const stats = await repo.getDashboardStats();
    expect(stats.weeklyBar.every((point) => point.label <= `${mm}-${dd}`)).toBe(true);
    expect(stats.line30d.length).toBeLessThanOrEqual(1);
  });

  it('excludes closed loan payments from totalReceived', async () => {
    repo = await createTestRepository();
    const loanee = await repo.createLoanee({ name: 'Closed Stats' });
    const loan = await repo.createLoan({
      loaneeId: loanee.id,
      principal: 100,
      interestRate: 1,
      ratePeriod: 'day',
      duration: 5,
      durationUnit: 'days',
      startDate: '2026-06-01',
    });
    await repo.updateDailyEntry(loan.id, '2026-06-01', 21);
    await repo.closeLoan(loan.id);

    const stats = await repo.getDashboardStats();
    expect(stats.totalReceived).toBe(0);
    expect(stats.activeCount).toBe(0);
  });

  it('marks overpayment entries as paid', async () => {
    repo = await createTestRepository();
    const loanee = await repo.createLoanee({ name: 'Overpay Test' });
    const loan = await repo.createLoan({
      loaneeId: loanee.id,
      principal: 100,
      interestRate: 1,
      ratePeriod: 'day',
      duration: 5,
      durationUnit: 'days',
      startDate: '2026-06-06',
    });
    expect(loan.dailyExpected).toBe(21);

    const entry = await repo.updateDailyEntry(loan.id, '2026-06-06', 30);
    expect(entry.status).toBe('paid');
    expect(entry.receivedAmount).toBe(30);
  });

  it('persists theme preference in owner settings', async () => {
    repo = await createTestRepository();
    await repo.updateSettings({ theme: 'dark' });
    const settings = await repo.getSettings();
    expect(settings.theme).toBe('dark');
  });

  describe('bulk update', () => {
    async function seedTwoDailyLoans() {
      repo = await createTestRepository();
      const first = await repo.createLoanee({ name: 'Anita' });
      const second = await repo.createLoanee({ name: 'Bhaskar' });
      const loanA = await repo.createLoan({
        loaneeId: first.id,
        principal: 100,
        interestRate: 1,
        ratePeriod: 'day',
        duration: 10,
        durationUnit: 'days',
        startDate: '2026-06-01',
      });
      const loanB = await repo.createLoan({
        loaneeId: second.id,
        principal: 200,
        interestRate: 1,
        ratePeriod: 'day',
        duration: 10,
        durationUnit: 'days',
        startDate: '2026-06-01',
      });
      return { loanA, loanB };
    }

    it('lists one row per running loan due on the date, ordered by loanee name', async () => {
      const { loanA, loanB } = await seedTwoDailyLoans();
      const rows = await repo.listEntriesForDate('2026-06-03');

      expect(rows.map((row) => row.loanee.name)).toEqual(['Anita', 'Bhaskar']);
      expect(rows.map((row) => row.loan.id)).toEqual([loanA.id, loanB.id]);
      expect(rows[0].entry.entryDate).toBe('2026-06-03');
      expect(rows[0].entry.expectedAmount).toBe(11);
    });

    it('excludes loans with no entry on the date', async () => {
      await seedTwoDailyLoans();
      expect(await repo.listEntriesForDate('2026-07-01')).toEqual([]);
    });

    it('excludes closed and refinanced loans', async () => {
      const { loanA, loanB } = await seedTwoDailyLoans();
      await repo.closeLoan(loanA.id);

      const rows = await repo.listEntriesForDate('2026-06-03');
      expect(rows.map((row) => row.loan.id)).toEqual([loanB.id]);
    });

    it('writes every update in one pass and derives each status', async () => {
      const { loanA, loanB } = await seedTwoDailyLoans();
      const result = await repo.bulkUpdateDailyEntries('2026-06-03', [
        { loanId: loanA.id, receivedAmount: 11 },
        { loanId: loanB.id, receivedAmount: 5 },
      ]);

      expect(result).toEqual({ updated: 2, skipped: [] });
      const rows = await repo.listEntriesForDate('2026-06-03');
      expect(rows[0].entry.status).toBe('paid');
      expect(rows[1].entry.status).toBe('partial');
      expect(rows[1].entry.receivedAmount).toBe(5);
    });

    it('records an overpayment as paid', async () => {
      const { loanA } = await seedTwoDailyLoans();
      await repo.bulkUpdateDailyEntries('2026-06-03', [
        { loanId: loanA.id, receivedAmount: 50 },
      ]);

      const entries = await repo.getDailyEntries(loanA.id);
      const entry = entries.find((row) => row.entryDate === '2026-06-03');
      expect(entry?.status).toBe('paid');
      expect(entry?.receivedAmount).toBe(50);
    });

    it('skips a loan closed after the screen loaded', async () => {
      const { loanA, loanB } = await seedTwoDailyLoans();
      await repo.closeLoan(loanA.id);

      const result = await repo.bulkUpdateDailyEntries('2026-06-03', [
        { loanId: loanA.id, receivedAmount: 11 },
        { loanId: loanB.id, receivedAmount: 21 },
      ]);

      expect(result.updated).toBe(1);
      expect(result.skipped).toEqual([loanA.id]);
    });

    it('returns zero updates for a date with no entries', async () => {
      const { loanA } = await seedTwoDailyLoans();
      const result = await repo.bulkUpdateDailyEntries('2026-07-01', [
        { loanId: loanA.id, receivedAmount: 11 },
      ]);
      expect(result).toEqual({ updated: 0, skipped: [loanA.id] });
    });

    it('rejects an invalid amount before writing anything', async () => {
      const { loanA, loanB } = await seedTwoDailyLoans();

      await expect(
        repo.bulkUpdateDailyEntries('2026-06-03', [
          { loanId: loanA.id, receivedAmount: 11 },
          { loanId: loanB.id, receivedAmount: -5 },
        ]),
      ).rejects.toThrow(/non-negative/);

      const rows = await repo.listEntriesForDate('2026-06-03');
      expect(rows.every((row) => row.entry.receivedAmount === 0)).toBe(true);
    });
  });

  describe('refinance', () => {
    async function seedRefinanceCase() {
      repo = await createTestRepository();
      const loanee = await repo.createLoanee({ name: 'Refinance Borrower' });
      const oldLoan = await repo.createLoan({
        loaneeId: loanee.id,
        principal: 100,
        interestRate: 0.1667,
        ratePeriod: 'day',
        duration: 120,
        durationUnit: 'days',
        startDate: '2026-01-01',
      });
      return { loanee, oldLoan };
    }

    const settlement = {
      deduction: 33.33,
      settlementPrincipal: 33.33,
      settlementInterest: 0,
      interestWaived: 6.67,
    };

    it('settles the old loan and links it to the new one', async () => {
      const { loanee, oldLoan } = await seedRefinanceCase();
      const result = await repo.refinanceLoan({
        oldLoanId: oldLoan.id,
        newLoan: {
          loaneeId: loanee.id,
          principal: 150,
          interestRate: 0.1667,
          ratePeriod: 'day',
          duration: 120,
          durationUnit: 'days',
          startDate: '2026-03-22',
        },
        settlement,
      });

      expect(result.oldLoan.status).toBe('refinanced');
      expect(result.oldLoan.closedReason).toBe('refinanced');
      expect(result.oldLoan.closedAt).not.toBeNull();
      expect(result.oldLoan.refinancedToLoanId).toBe(result.newLoan.id);
      expect(result.oldLoan.settlement).toEqual(settlement);

      expect(result.newLoan.status).toBe('active');
      expect(result.newLoan.principal).toBe(150);
      expect(result.newLoan.refinancedFromLoanId).toBe(oldLoan.id);
      expect(result.newLoan.settlement).toBeNull();
    });

    it('leaves the old schedule untouched so no phantom cash is recorded', async () => {
      const { loanee, oldLoan } = await seedRefinanceCase();
      await repo.bulkUpdateDailyEntries('2026-01-01', [
        { loanId: oldLoan.id, receivedAmount: 1 },
      ]);

      await repo.refinanceLoan({
        oldLoanId: oldLoan.id,
        newLoan: {
          loaneeId: loanee.id,
          principal: 150,
          interestRate: 0.1667,
          ratePeriod: 'day',
          duration: 120,
          durationUnit: 'days',
          startDate: '2026-03-22',
        },
        settlement,
      });

      const entries = await repo.getDailyEntries(oldLoan.id);
      expect(entries).toHaveLength(120);
      expect(entries.filter((entry) => entry.status === 'paid')).toHaveLength(1);
    });

    it('drops the old loan from active loans but keeps the new one', async () => {
      const { loanee, oldLoan } = await seedRefinanceCase();
      const { newLoan } = await repo.refinanceLoan({
        oldLoanId: oldLoan.id,
        newLoan: {
          loaneeId: loanee.id,
          principal: 150,
          interestRate: 0.1667,
          ratePeriod: 'day',
          duration: 120,
          durationUnit: 'days',
          startDate: '2026-03-22',
        },
        settlement,
      });

      const active = await repo.listActiveLoans();
      expect(active.map((loan) => loan.id)).toEqual([newLoan.id]);
    });

    it('exposes the chain in both directions', async () => {
      const { loanee, oldLoan } = await seedRefinanceCase();
      const { newLoan } = await repo.refinanceLoan({
        oldLoanId: oldLoan.id,
        newLoan: {
          loaneeId: loanee.id,
          principal: 150,
          interestRate: 0.1667,
          ratePeriod: 'day',
          duration: 120,
          durationUnit: 'days',
          startDate: '2026-03-22',
        },
        settlement,
      });

      const oldChain = await repo.getLoanChain(oldLoan.id);
      expect(oldChain.next?.id).toBe(newLoan.id);
      expect(oldChain.previous).toBeNull();

      const newChain = await repo.getLoanChain(newLoan.id);
      expect(newChain.previous?.id).toBe(oldLoan.id);
      expect(newChain.next).toBeNull();
    });

    it('refuses to refinance the same loan twice', async () => {
      const { loanee, oldLoan } = await seedRefinanceCase();
      const newLoanInput = {
        loaneeId: loanee.id,
        principal: 150,
        interestRate: 0.1667,
        ratePeriod: 'day' as const,
        duration: 120,
        durationUnit: 'days' as const,
        startDate: '2026-03-22',
      };
      await repo.refinanceLoan({ oldLoanId: oldLoan.id, newLoan: newLoanInput, settlement });

      await expect(
        repo.refinanceLoan({ oldLoanId: oldLoan.id, newLoan: newLoanInput, settlement }),
      ).rejects.toThrow(/refinanced/);
    });

    it('still blocks deleting the loanee while the replacement runs, then removes both loans', async () => {
      const { loanee, oldLoan } = await seedRefinanceCase();
      const { newLoan } = await repo.refinanceLoan({
        oldLoanId: oldLoan.id,
        newLoan: {
          loaneeId: loanee.id,
          principal: 150,
          interestRate: 0.1667,
          ratePeriod: 'day',
          duration: 120,
          durationUnit: 'days',
          startDate: '2026-03-22',
        },
        settlement,
      });

      await expect(repo.deleteLoanee(loanee.id)).rejects.toThrow(/active loans/);

      await repo.closeLoan(newLoan.id);
      await repo.deleteLoanee(loanee.id);

      expect(await repo.getLoan(oldLoan.id)).toBeNull();
      expect(await repo.getLoan(newLoan.id)).toBeNull();
      expect(await repo.getDailyEntries(oldLoan.id)).toEqual([]);
    });

    it('excludes a refinanced loan from dashboard totals', async () => {
      const { loanee, oldLoan } = await seedRefinanceCase();
      await repo.refinanceLoan({
        oldLoanId: oldLoan.id,
        newLoan: {
          loaneeId: loanee.id,
          principal: 150,
          interestRate: 0.1667,
          ratePeriod: 'day',
          duration: 120,
          durationUnit: 'days',
          startDate: '2026-03-22',
        },
        settlement,
      });

      const stats = await repo.getDashboardStats();
      expect(stats.activeCount).toBe(1);
      expect(stats.totalLoaned).toBe(150);
    });
  });

  it('reports cumulative principal and interest recovery for active loans', async () => {
    repo = await createTestRepository();
    const loanee = await repo.createLoanee({ name: 'Recovery Borrower' });
    const loan = await repo.createLoan({
      loaneeId: loanee.id,
      principal: 100,
      interestRate: 1,
      ratePeriod: 'day',
      duration: 50,
      durationUnit: 'days',
      startDate: '2026-06-01',
    });

    // 10 days at ₹3 = ₹30 collected against a 100/150 principal share.
    for (let day = 1; day <= 10; day += 1) {
      const entryDate = `2026-06-${String(day).padStart(2, '0')}`;
      await repo.updateDailyEntry(loan.id, entryDate, 3);
    }

    const stats = await repo.getDashboardStats();
    expect(stats.totalReceived).toBe(30);
    expect(stats.principalRecovered).toBe(20);
    expect(stats.interestRecovered).toBe(10);
    expect(stats.principalOutstanding).toBe(80);
    expect(stats.interestOutstanding).toBe(40);
  });

  it('persists loanee data across database reopen', async () => {
    const dbName = `lendledger-persist-${createId()}.db`;
    const db1 = await openDatabaseAsync(dbName);
    await runMigrations(db1);
    const ownerId = await seedDefaultOwner(db1);
    const repo1 = new LocalLoanRepository(db1, ownerId);
    const loanee = await repo1.createLoanee({ name: 'Survives Restart' });
    await db1.closeAsync();

    const db2 = await openDatabaseAsync(dbName);
    await runMigrations(db2);
    const ownerRow = await db2.getFirstAsync<{ id: string }>('SELECT id FROM owners LIMIT 1');
    expect(ownerRow?.id).toBe(ownerId);

    const repo2 = new LocalLoanRepository(db2, ownerRow!.id);
    const loanees = await repo2.listLoanees();
    expect(loanees.some((entry) => entry.id === loanee.id)).toBe(true);

    await db2.closeAsync();
    deleteDatabaseSync(dbName);
  });
});
