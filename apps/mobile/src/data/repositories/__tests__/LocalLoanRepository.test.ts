import { describe, it, expect, afterEach } from 'vitest';

import { deleteDatabaseSync, openDatabaseAsync } from 'expo-sqlite';

import { runMigrations, seedDefaultOwner } from '../../db/migrations';
import { createId } from '../../db/uuid';
import { LocalLoanRepository } from '../LocalLoanRepository';
import {
  createTestRepository,
  type TestLoanRepository,
} from '../createTestRepository';

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
