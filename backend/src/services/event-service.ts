import crypto from 'crypto';
import { getDb } from '../database';
import { TraceabilityEvent, EventType, ActorRole, ProduceStatus } from '../types';
import { getBlockchainAdapter } from '../blockchain';

export interface CreateEventInput {
  batchId: string;
  eventType: EventType;
  timestamp?: string;
  location: string;
  actorName: string;
  actorRole: ActorRole;
  temperatureCelsius?: number;
  humidityPercentage?: number;
  notes: string;
}

export class EventService {
  static getEventsByBatchId(batchId: string): TraceabilityEvent[] {
    const db = getDb();
    const rows = db.prepare(`
      SELECT * FROM traceability_events 
      WHERE batch_id = ? 
      ORDER BY timestamp ASC, created_at ASC
    `).all(batchId) as any[];

    return rows.map(r => ({
      eventId: r.event_id,
      batchId: r.batch_id,
      eventType: r.event_type as EventType,
      timestamp: r.timestamp,
      location: r.location,
      actorName: r.actor_name,
      actorRole: r.actor_role as ActorRole,
      temperatureCelsius: r.temperature_celsius ?? undefined,
      humidityPercentage: r.humidity_percentage ?? undefined,
      notes: r.notes,
      recordHash: r.record_hash,
      previousRecordHash: r.previous_record_hash,
      blockchainTxHash: r.blockchain_tx_hash ?? undefined,
      isFictionalDemo: Boolean(r.is_fictional_demo),
      createdAt: r.created_at,
    }));
  }

  static calculateEventHash(params: {
    batchId: string;
    eventType: string;
    timestamp: string;
    location: string;
    actorName: string;
    previousRecordHash: string;
  }): string {
    const payload = `${params.previousRecordHash}:${params.batchId}:${params.eventType}:${params.timestamp}:${params.location}:${params.actorName}`;
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  static async addEvent(input: CreateEventInput): Promise<TraceabilityEvent> {
    const db = getDb();

    // Check batch existence
    const batchRow = db.prepare('SELECT batch_id, current_status FROM batches WHERE batch_id = ?').get(input.batchId) as any;
    if (!batchRow) {
      throw new Error(`Batch with ID '${input.batchId}' does not exist.`);
    }

    // Get last event to establish hash chain
    const lastEvent = db.prepare(`
      SELECT record_hash FROM traceability_events 
      WHERE batch_id = ? 
      ORDER BY timestamp DESC, created_at DESC 
      LIMIT 1
    `).get(input.batchId) as { record_hash: string } | undefined;

    const previousRecordHash = lastEvent ? lastEvent.record_hash : '0000000000000000000000000000000000000000000000000000000000000000';
    const timestamp = input.timestamp || new Date().toISOString();
    const createdAt = new Date().toISOString();
    const eventId = `EVT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const recordHash = this.calculateEventHash({
      batchId: input.batchId,
      eventType: input.eventType,
      timestamp,
      location: input.location,
      actorName: input.actorName,
      previousRecordHash,
    });

    // Anchor to blockchain
    const adapter = getBlockchainAdapter();
    const anchor = await adapter.anchorRecord('EVENT', eventId, recordHash);

    const stmt = db.prepare(`
      INSERT INTO traceability_events (
        event_id, batch_id, event_type, timestamp, location,
        actor_name, actor_role, temperature_celsius, humidity_percentage,
        notes, record_hash, previous_record_hash, blockchain_tx_hash,
        is_fictional_demo, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);

    stmt.run(
      eventId,
      input.batchId,
      input.eventType,
      timestamp,
      input.location,
      input.actorName,
      input.actorRole,
      input.temperatureCelsius ?? null,
      input.humidityPercentage ?? null,
      input.notes,
      recordHash,
      previousRecordHash,
      anchor.txHash,
      createdAt
    );

    // Update batch status based on event type
    const newStatus = this.mapEventToProduceStatus(input.eventType);
    if (newStatus) {
      db.prepare('UPDATE batches SET current_status = ? WHERE batch_id = ?').run(newStatus, input.batchId);
    }

    return {
      eventId,
      batchId: input.batchId,
      eventType: input.eventType,
      timestamp,
      location: input.location,
      actorName: input.actorName,
      actorRole: input.actorRole,
      temperatureCelsius: input.temperatureCelsius,
      humidityPercentage: input.humidityPercentage,
      notes: input.notes,
      recordHash,
      previousRecordHash,
      blockchainTxHash: anchor.txHash,
      isFictionalDemo: true,
      createdAt,
    };
  }

  private static mapEventToProduceStatus(eventType: EventType): ProduceStatus | null {
    switch (eventType) {
      case 'HARVEST_REGISTRATION':
        return 'HARVESTED';
      case 'PACKHOUSE_GRADING':
        return 'PACKHOUSE_GRADED';
      case 'COLD_CHAIN_PICKUP':
      case 'TRANSIT_CHECKPOINT':
        return 'IN_TRANSIT';
      case 'COLD_STORAGE':
        return 'COLD_STORAGE';
      case 'DISTRIBUTION_HUB_ARRIVAL':
        return 'DISTRIBUTION_HUB';
      case 'RETAIL_STORE_RECEIPT':
        return 'RETAIL_READY';
      default:
        return null;
    }
  }
}
