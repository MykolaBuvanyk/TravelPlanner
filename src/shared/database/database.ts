import {
  open,
  type NitroSQLiteConnection,
} from 'react-native-nitro-sqlite';

import { useDatabaseStatus } from './databaseStatus.store';

const databaseName = 'travel-planner.sqlite';
const schemaVersion = 1;

let database: NitroSQLiteConnection | undefined;
let initialization: Promise<void> | undefined;

export function getDatabase() {
  if (!database) {
    database = open({ name: databaseName });
  }

  return database;
}

async function createSchema() {
  const db = getDatabase();

  await db.executeAsync('PRAGMA foreign_keys = ON');
  await db.executeAsync('PRAGMA journal_mode = WAL');

  const versionResult = await db.executeAsync<{ user_version: number }>(
    'PRAGMA user_version',
  );
  const currentVersion = Number(versionResult.rows.item(0)?.user_version ?? 0);

  if (currentVersion > schemaVersion) {
    throw new Error('The local database was created by a newer app version.');
  }

  if (currentVersion === 0) {
    await db.executeBatchAsync([
      {
        query: `CREATE TABLE IF NOT EXISTS places (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          address TEXT,
          description TEXT,
          notes TEXT,
          category TEXT NOT NULL,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          is_favorite INTEGER NOT NULL DEFAULT 0,
          source TEXT NOT NULL,
          external_id TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )`,
      },
      {
        query: `CREATE TABLE IF NOT EXISTS trips (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )`,
      },
      {
        query: `CREATE TABLE IF NOT EXISTS trip_places (
          trip_id TEXT NOT NULL,
          place_id TEXT NOT NULL,
          position INTEGER NOT NULL,
          is_visited INTEGER NOT NULL DEFAULT 0,
          added_at TEXT NOT NULL,
          PRIMARY KEY (trip_id, place_id),
          FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
          FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
        )`,
      },
      {
        query:
          'CREATE INDEX IF NOT EXISTS trip_places_order_idx ON trip_places(trip_id, position)',
      },
      {
        query: `CREATE TABLE IF NOT EXISTS place_search_cache (
          query TEXT PRIMARY KEY NOT NULL,
          cached_at TEXT NOT NULL,
          results_json TEXT NOT NULL
        )`,
      },
      {
        query: `CREATE TABLE IF NOT EXISTS app_metadata (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        )`,
      },
      { query: `PRAGMA user_version = ${schemaVersion}` },
    ]);
  }
}

export function initializeDatabase() {
  if (!initialization) {
    initialization = createSchema().catch(error => {
      initialization = undefined;
      throw error;
    });
  }

  return initialization;
}

export async function runDatabaseWrite(write: () => Promise<void>) {
  try {
    await write();
    useDatabaseStatus.getState().setWriteError(false);
    return true;
  } catch {
    useDatabaseStatus.getState().setWriteError(true);
    return false;
  }
}

export async function getMetadata(key: string) {
  const result = await getDatabase().executeAsync<{ value: string }>(
    'SELECT value FROM app_metadata WHERE key = ? LIMIT 1',
    [key],
  );

  return result.rows.item(0)?.value;
}

export async function setMetadata(key: string, value: string) {
  await getDatabase().executeAsync(
    `INSERT INTO app_metadata (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, value],
  );
}
