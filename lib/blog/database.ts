import "server-only";

import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

import { blogPaths } from "./config.ts";
import { BLOG_MIGRATIONS } from "./migrations.ts";

export function openBlogDatabase(filename: string): DatabaseSync {
  if (filename !== ":memory:") mkdirSync(dirname(filename), { recursive: true, mode: 0o700 });
  const database = new DatabaseSync(filename, { enableForeignKeyConstraints: true });
  let transaction = false;
  try {
    database.exec("PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL; PRAGMA synchronous = FULL;");
    database.exec("BEGIN IMMEDIATE");
    transaction = true;
    database.exec("CREATE TABLE IF NOT EXISTS blog_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL) STRICT");
    const applied = new Set(database.prepare("SELECT version FROM blog_migrations").all().map(row => Number(row.version)));
    const latest = BLOG_MIGRATIONS.at(-1)?.version ?? 0;
    if ([...applied].some(version => version > latest)) throw new Error("Blog database is newer than this application.");
    for (const migration of BLOG_MIGRATIONS) {
      if (applied.has(migration.version)) continue;
      database.exec(migration.sql);
      database.prepare("INSERT INTO blog_migrations (version, applied_at) VALUES (?, ?)").run(migration.version, new Date().toISOString());
    }
    database.exec("COMMIT");
    return database;
  } catch (error) {
    if (transaction) database.exec("ROLLBACK");
    database.close();
    throw error;
  }
}

// One connection per process/path, including during development hot reloads.
const state = globalThis as typeof globalThis & { blogDatabases?: Map<string, DatabaseSync> };

export function getBlogDatabase(): DatabaseSync {
  const filename = blogPaths().database;
  const connections = state.blogDatabases ??= new Map();
  let database = connections.get(filename);
  if (!database) {
    database = openBlogDatabase(filename);
    connections.set(filename, database);
  }
  return database;
}
