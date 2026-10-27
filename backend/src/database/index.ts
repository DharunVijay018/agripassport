import fs from 'fs';
import path from 'path';
import { config } from '../config/env';

// node:sqlite is built-in in Node v22.5+
// Using eval('require') cleanly provides runtime access without compiler or bundler resolution conflicts
// @ts-ignore
const nodeRequire = typeof require !== 'undefined' ? require : eval('require');
const { DatabaseSync } = nodeRequire('node:sqlite');

export type DatabaseSync = any;

let dbInstance: any = null;

export function getDb(customPath?: string): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = customPath || config.databasePath;
  
  if (dbPath !== ':memory:') {
    const dir = path.dirname(path.resolve(process.cwd(), dbPath));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  dbInstance = new DatabaseSync(dbPath === ':memory:' ? ':memory:' : path.resolve(process.cwd(), dbPath));
  initSchema(dbInstance);
  return dbInstance;
}

export function initSchema(db: DatabaseSync): void {
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
  } else {
    // Fallback if built
    db.exec(`
      CREATE TABLE IF NOT EXISTS farmers (
        farmer_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        fpo_name TEXT NOT NULL,
        village TEXT NOT NULL,
        district TEXT NOT NULL,
        state TEXT NOT NULL,
        gps_coordinates TEXT NOT NULL,
        organic_certified INTEGER NOT NULL DEFAULT 0,
        contact_placeholder TEXT,
        is_fictional_demo INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS batches (
        batch_id TEXT PRIMARY KEY,
        farmer_id TEXT NOT NULL,
        farmer_name TEXT NOT NULL,
        crop_name TEXT NOT NULL,
        variety TEXT NOT NULL,
        harvest_date TEXT NOT NULL,
        farm_location TEXT NOT NULL,
        gps_coordinates TEXT NOT NULL,
        quantity REAL NOT NULL CHECK(quantity > 0),
        unit TEXT NOT NULL,
        grade TEXT NOT NULL,
        cultivation_method TEXT NOT NULL,
        storage_conditions TEXT NOT NULL,
        initial_freshness_score REAL NOT NULL DEFAULT 95.0,
        estimated_shelf_life_days INTEGER NOT NULL DEFAULT 7,
        current_status TEXT NOT NULL DEFAULT 'HARVESTED',
        created_at TEXT NOT NULL,
        is_fictional_demo INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (farmer_id) REFERENCES farmers(farmer_id)
      );

      CREATE TABLE IF NOT EXISTS traceability_events (
        event_id TEXT PRIMARY KEY,
        batch_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        location TEXT NOT NULL,
        actor_name TEXT NOT NULL,
        actor_role TEXT NOT NULL,
        temperature_celsius REAL,
        humidity_percentage REAL,
        notes TEXT NOT NULL,
        record_hash TEXT NOT NULL,
        previous_record_hash TEXT NOT NULL,
        blockchain_tx_hash TEXT,
        is_fictional_demo INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        FOREIGN KEY (batch_id) REFERENCES batches(batch_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS blockchain_anchors (
        record_hash TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        tx_hash TEXT NOT NULL,
        block_number INTEGER NOT NULL,
        network TEXT NOT NULL,
        is_mock INTEGER NOT NULL DEFAULT 1,
        timestamp TEXT NOT NULL
      );
    `);
  }
}

export function closeDb(): void {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch {
      // ignore
    }
    dbInstance = null;
  }
}

export function resetDatabase(customPath?: string): void {
  closeDb();
  const dbPath = customPath || config.databasePath;
  if (dbPath !== ':memory:') {
    const fullPath = path.resolve(process.cwd(), dbPath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
  getDb(dbPath);
}
