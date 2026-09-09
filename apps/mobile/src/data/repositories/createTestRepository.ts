import { deleteDatabaseSync, openDatabaseAsync } from 'expo-sqlite';

import { runMigrations, seedDefaultOwner } from '../db/migrations';
import { createId } from '../db/uuid';
import { LocalLoanRepository } from './LocalLoanRepository';

/** Isolated DB for repository integration tests. */
export async function createTestRepository(): Promise<TestLoanRepository> {
  const dbName = `lendledger-test-${createId()}.db`;
  const db = await openDatabaseAsync(dbName);
  await runMigrations(db);
  const ownerId = await seedDefaultOwner(db);
  const repo = new LocalLoanRepository(db, ownerId) as TestLoanRepository;
  repo.dispose = async () => {
    await db.closeAsync();
    try {
      deleteDatabaseSync(dbName);
    } catch {
      // ignore cleanup errors in test env
    }
  };
  return repo;
}

export type TestLoanRepository = LocalLoanRepository & { dispose(): Promise<void> };
