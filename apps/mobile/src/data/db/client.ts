import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import { DB_NAME } from './schema';
import { runMigrations, seedDefaultOwner } from './migrations';

let database: SQLiteDatabase | null = null;
let initPromise: Promise<DatabaseInitResult> | null = null;

export type DatabaseInitResult = {
  db: SQLiteDatabase;
  ownerId: string;
};

/**
 * Open SQLite, run migrations, seed default owner if needed.
 * Safe to call multiple times — returns the same promise.
 */
export async function initializeDatabase(): Promise<DatabaseInitResult> {
  if (!initPromise) {
    initPromise = (async () => {
      const db = await openDatabaseAsync(DB_NAME);
      await runMigrations(db);
      const ownerId = await seedDefaultOwner(db);
      database = db;
      return { db, ownerId };
    })();
  }

  return initPromise;
}

export function getDatabase(): SQLiteDatabase {
  if (!database) {
    throw new Error('Database not initialized — call initializeDatabase() first');
  }
  return database;
}

export async function resetDatabaseForDev(): Promise<void> {
  if (database) {
    await database.closeAsync();
  }
  database = null;
  initPromise = null;
}
