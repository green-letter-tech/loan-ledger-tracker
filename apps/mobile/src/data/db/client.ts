import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';

import { DB_NAME } from './schema';
import { runMigrations, seedDefaultOwner } from './migrations';

const INIT_TIMEOUT_MS = 15_000;

let database: SQLiteDatabase | null = null;
let initPromise: Promise<DatabaseInitResult> | null = null;

function withTimeout<T>(promise: Promise<T>, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), INIT_TIMEOUT_MS);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error: unknown) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

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
      try {
        const work = (async () => {
          const db = await openDatabaseAsync(DB_NAME);
          await runMigrations(db);
          const ownerId = await seedDefaultOwner(db);
          database = db;
          return { db, ownerId };
        })();

        const timeoutHint =
          Platform.OS === 'web'
            ? 'SQLite web init timed out. Stop the dev server (Ctrl+C), run npm run mobile:web again, then hard-refresh the browser. Android dev builds do not need this.'
            : 'Database init timed out.';

        return await withTimeout(work, timeoutHint);
      } catch (error) {
        initPromise = null;
        throw error;
      }
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
