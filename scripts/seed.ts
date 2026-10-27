import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getDb, resetDatabase } from '../backend/src/database';
import { getBlockchainAdapter } from '../backend/src/blockchain';

export async function runSeed() {
  console.log('🌾 [AgriPassport Seed] Initializing database and importing sample data...');
  
  const db = getDb();
  const sampleDir = path.resolve(process.cwd(), 'sample-data');
  const adapter = getBlockchainAdapter();

  // 1. Seed Farmers
  const farmersRaw = fs.readFileSync(path.join(sampleDir, 'farmers.json'), 'utf8');
  const farmers = JSON.parse(farmersRaw);
  console.log(`👨‍🌾 Loading ${farmers.length} demonstration farmers...`);

  const insertFarmerStmt = db.prepare(`
    INSERT OR REPLACE INTO farmers (
      farmer_id, name, fpo_name, village, district, state,
      gps_coordinates, organic_certified, contact_placeholder, is_fictional_demo, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);

  for (const f of farmers) {
    insertFarmerStmt.run(
      f.farmerId,
      f.name,
      f.fpoName,
      f.village,
      f.district,
      f.state,
      f.gpsCoordinates,
      f.organicCertified ? 1 : 0,
      f.contactPlaceholder || null,
      new Date().toISOString()
    );
  }

  // 2. Seed Batches
  const batchesRaw = fs.readFileSync(path.join(sampleDir, 'produce-batches.json'), 'utf8');
  const batches = JSON.parse(batchesRaw);
  console.log(`📦 Loading ${batches.length} produce batches...`);

  const insertBatchStmt = db.prepare(`
    INSERT OR REPLACE INTO batches (
      batch_id, farmer_id, farmer_name, crop_name, variety,
      harvest_date, farm_location, gps_coordinates, quantity,
      unit, grade, cultivation_method, storage_conditions,
      initial_freshness_score, estimated_shelf_life_days,
      current_status, created_at, is_fictional_demo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  for (const b of batches) {
    insertBatchStmt.run(
      b.batchId,
      b.farmerId,
      b.farmerName,
      b.cropName,
      b.variety,
      b.harvestDate,
      b.farmLocation,
      b.gpsCoordinates,
      b.quantity,
      b.unit,
      b.grade,
      b.cultivationMethod,
      b.storageConditions,
      b.initialFreshnessScore,
      b.estimatedShelfLifeDays,
      b.currentStatus,
      b.createdAt
    );

    // Anchor batch to blockchain
    const batchHash = crypto.createHash('sha256').update(`BATCH:${b.batchId}:${b.harvestDate}:${b.farmerId}`).digest('hex');
    await adapter.anchorRecord('BATCH', b.batchId, batchHash);
  }

  // 3. Seed Traceability Events
  const eventsRaw = fs.readFileSync(path.join(sampleDir, 'traceability-events.json'), 'utf8');
  const events = JSON.parse(eventsRaw);
  console.log(`🚚 Loading ${events.length} supply-chain traceability events...`);

  const insertEventStmt = db.prepare(`
    INSERT OR REPLACE INTO traceability_events (
      event_id, batch_id, event_type, timestamp, location,
      actor_name, actor_role, temperature_celsius, humidity_percentage,
      notes, record_hash, previous_record_hash, blockchain_tx_hash,
      is_fictional_demo, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);

  // Group events by batch and order chronologically
  const batchEventsMap: Record<string, any[]> = {};
  for (const evt of events) {
    if (!batchEventsMap[evt.batchId]) batchEventsMap[evt.batchId] = [];
    batchEventsMap[evt.batchId].push(evt);
  }

  let totalEventsAnchored = 0;

  for (const [batchId, bEvents] of Object.entries(batchEventsMap)) {
    bEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    let previousHash = '0000000000000000000000000000000000000000000000000000000000000000';

    for (const e of bEvents) {
      const payload = `${previousHash}:${e.batchId}:${e.eventType}:${e.timestamp}:${e.location}:${e.actorName}`;
      const recordHash = crypto.createHash('sha256').update(payload).digest('hex');

      const anchor = await adapter.anchorRecord('EVENT', e.eventId, recordHash);

      insertEventStmt.run(
        e.eventId,
        e.batchId,
        e.eventType,
        e.timestamp,
        e.location,
        e.actorName,
        e.actorRole,
        e.temperatureCelsius ?? null,
        e.humidityPercentage ?? null,
        e.notes,
        recordHash,
        previousHash,
        anchor.txHash,
        e.timestamp
      );

      previousHash = recordHash;
      totalEventsAnchored++;
    }
  }

  console.log('✅ [AgriPassport Seed] Successfully completed!');
  console.log(`   - Farmers: ${farmers.length}`);
  console.log(`   - Batches: ${batches.length}`);
  console.log(`   - Events Anchored: ${totalEventsAnchored}`);
}

// Run if called directly
if (require.main === module || process.argv[1]?.includes('seed')) {
  runSeed().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });
}
