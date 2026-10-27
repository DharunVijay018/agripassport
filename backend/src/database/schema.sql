-- =============================================================================
-- AgriPassport SQLite Database Schema
-- =============================================================================

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

CREATE INDEX IF NOT EXISTS idx_batches_farmer ON batches(farmer_id);
CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(current_status);

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

CREATE INDEX IF NOT EXISTS idx_events_batch_timestamp ON traceability_events(batch_id, timestamp ASC);

CREATE TABLE IF NOT EXISTS blockchain_anchors (
  record_hash TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL, -- 'BATCH' | 'EVENT'
  entity_id TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  block_number INTEGER NOT NULL,
  network TEXT NOT NULL,
  is_mock INTEGER NOT NULL DEFAULT 1,
  timestamp TEXT NOT NULL
);
