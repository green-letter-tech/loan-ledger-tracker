import { describe, it, expect, afterEach } from 'vitest';

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
    expect(entries[0].entryDate).toBe('2026-06-06');
    expect(entries[49].entryDate).toBe('2026-07-25');
    expect(loan.dailyExpected).toBe(3);
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
});
