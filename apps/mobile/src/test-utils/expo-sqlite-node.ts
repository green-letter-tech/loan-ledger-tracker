import { existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import Database from 'better-sqlite3';

type BindParams = string | number | null;

export type SQLiteDatabase = {
  execAsync: (source: string) => Promise<void>;
  runAsync: (source: string, ...params: BindParams[]) => Promise<{ changes: number }>;
  getFirstAsync: <T>(source: string, ...params: BindParams[]) => Promise<T | null>;
  getAllAsync: <T>(source: string, ...params: BindParams[]) => Promise<T[]>;
  withTransactionAsync: (task: () => Promise<void>) => Promise<void>;
  closeAsync: () => Promise<void>;
};

const databases = new Map<string, Database.Database>();
const TEST_DB_DIR = join(tmpdir(), 'lendledger-test-dbs');

function databasePath(databaseName: string): string {
  mkdirSync(TEST_DB_DIR, { recursive: true });
  return join(TEST_DB_DIR, databaseName);
}

export async function openDatabaseAsync(databaseName: string): Promise<SQLiteDatabase> {
  const native = new Database(databasePath(databaseName));
  databases.set(databaseName, native);

  return {
    async execAsync(source: string) {
      native.exec(source);
    },
    async runAsync(source: string, ...params: BindParams[]) {
      const result = native.prepare(source).run(...params);
      return { changes: result.changes };
    },
    async getFirstAsync<T>(source: string, ...params: BindParams[]) {
      const row = native.prepare(source).get(...params) as T | undefined;
      return row ?? null;
    },
    async getAllAsync<T>(source: string, ...params: BindParams[]) {
      return native.prepare(source).all(...params) as T[];
    },
    async withTransactionAsync(task: () => Promise<void>) {
      native.exec('BEGIN');
      try {
        await task();
        native.exec('COMMIT');
      } catch (error) {
        native.exec('ROLLBACK');
        throw error;
      }
    },
    async closeAsync() {
      native.close();
      databases.delete(databaseName);
    },
  };
}

export function deleteDatabaseSync(databaseName: string): void {
  const db = databases.get(databaseName);
  if (db) {
    db.close();
    databases.delete(databaseName);
  }

  const filePath = databasePath(databaseName);
  if (existsSync(filePath)) {
    unlinkSync(filePath);
  }
}
