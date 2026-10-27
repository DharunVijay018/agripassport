import crypto from 'crypto';
import { getDb } from '../database';
import { ProduceBatch, BatchDetailResponse, ProduceStatus } from '../types';
import { FarmerService } from './farmer-service';
import { EventService } from './event-service';
import { QRService } from '../qr/qr-service';
import { AIFreshnessService } from '../ai/freshness-service';
import { getBlockchainAdapter } from '../blockchain';

export interface CreateBatchInput {
  batchId?: string;
  farmerId: string;
  cropName: string;
  variety: string;
  harvestDate: string;
  farmLocation?: string;
  gpsCoordinates?: string;
  quantity: number;
  unit: string;
  grade?: string;
  cultivationMethod?: string;
  storageConditions?: string;
  initialFreshnessScore?: number;
  estimatedShelfLifeDays?: number;
}

export class BatchService {
  static getAllBatches(filters?: { farmerId?: string; status?: string; search?: string }): ProduceBatch[] {
    const db = getDb();
    let query = 'SELECT * FROM batches WHERE 1=1';
    const params: any[] = [];

    if (filters?.farmerId) {
      query += ' AND farmer_id = ?';
      params.push(filters.farmerId);
    }

    if (filters?.status) {
      query += ' AND current_status = ?';
      params.push(filters.status);
    }

    if (filters?.search) {
      query += ' AND (crop_name LIKE ? OR batch_id LIKE ? OR farmer_name LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const rows = db.prepare(query).all(...params) as any[];
    return rows.map(this.mapRowToBatch);
  }

  static async getBatchById(batchId: string): Promise<BatchDetailResponse | null> {
    const db = getDb();
    const row = db.prepare('SELECT * FROM batches WHERE batch_id = ?').get(batchId) as any;
    if (!row) return null;

    const batch = this.mapRowToBatch(row);
    const farmer = FarmerService.getFarmerById(batch.farmerId) || undefined;
    const events = EventService.getEventsByBatchId(batch.batchId);
    const qrCodeUrl = await QRService.generateQrDataUrl(batch.batchId);
    const qrCodeSvg = await QRService.generateQrSvg(batch.batchId);

    // Calculate dynamic freshness based on harvest date and recent event temperatures
    const avgTemp = events.length > 0 && events.some(e => e.temperatureCelsius !== undefined)
      ? events.filter(e => e.temperatureCelsius !== undefined).reduce((acc, curr) => acc + (curr.temperatureCelsius || 0), 0) / events.filter(e => e.temperatureCelsius !== undefined).length
      : 15.0;

    const currentFreshness = AIFreshnessService.estimateFreshness({
      cropName: batch.cropName,
      harvestDate: batch.harvestDate,
      initialFreshness: batch.initialFreshnessScore,
      nominalShelfLifeDays: batch.estimatedShelfLifeDays,
      averageTemperatureCelsius: avgTemp,
    });

    // Check blockchain anchor for initial batch
    const adapter = getBlockchainAdapter();
    const batchHash = crypto.createHash('sha256').update(`BATCH:${batch.batchId}:${batch.harvestDate}:${batch.farmerId}`).digest('hex');
    const verification = await adapter.verifyRecord(batchHash);

    return {
      ...batch,
      farmer,
      events,
      qrCodeUrl,
      qrCodeSvg,
      currentFreshness,
      blockchainAnchor: verification.verified ? {
        recordHash: verification.recordHash,
        txHash: verification.txHash || '',
        blockNumber: verification.blockNumber || 0,
        timestamp: verification.anchoredAt || batch.createdAt,
        network: verification.network,
        isMock: verification.isMock,
      } : undefined,
    };
  }

  static async createBatch(input: CreateBatchInput): Promise<BatchDetailResponse> {
    const db = getDb();

    // Verify farmer
    const farmer = FarmerService.getFarmerById(input.farmerId);
    if (!farmer) {
      throw new Error(`Farmer with ID '${input.farmerId}' not found.`);
    }

    const year = new Date().getFullYear();
    const batchId = input.batchId || `AGRI-BATCH-${year}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Prevent duplicate batch ID
    const existing = db.prepare('SELECT batch_id FROM batches WHERE batch_id = ?').get(batchId);
    if (existing) {
      throw new Error(`Batch with ID '${batchId}' already exists.`);
    }

    const farmLocation = input.farmLocation || `${farmer.village}, ${farmer.district}, ${farmer.state}`;
    const gpsCoordinates = input.gpsCoordinates || farmer.gpsCoordinates;
    const initialFreshnessScore = input.initialFreshnessScore ?? 95.0;
    const estimatedShelfLifeDays = input.estimatedShelfLifeDays ?? 7;
    const grade = input.grade || 'Grade A';
    const cultivationMethod = input.cultivationMethod || (farmer.organicCertified ? 'Certified Organic' : 'Standard GAP');
    const storageConditions = input.storageConditions || 'Ambient (15°C - 20°C)';
    const createdAt = new Date().toISOString();

    // 1. Insert Batch record
    const stmt = db.prepare(`
      INSERT INTO batches (
        batch_id, farmer_id, farmer_name, crop_name, variety,
        harvest_date, farm_location, gps_coordinates, quantity,
        unit, grade, cultivation_method, storage_conditions,
        initial_freshness_score, estimated_shelf_life_days,
        current_status, created_at, is_fictional_demo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'HARVESTED', ?, 1)
    `);

    stmt.run(
      batchId,
      farmer.farmerId,
      farmer.name,
      input.cropName,
      input.variety,
      input.harvestDate,
      farmLocation,
      gpsCoordinates,
      input.quantity,
      input.unit,
      grade,
      cultivationMethod,
      storageConditions,
      initialFreshnessScore,
      estimatedShelfLifeDays,
      createdAt
    );

    // 2. Anchor Batch registration hash to blockchain
    const adapter = getBlockchainAdapter();
    const batchHash = crypto.createHash('sha256').update(`BATCH:${batchId}:${input.harvestDate}:${farmer.farmerId}`).digest('hex');
    const anchor = await adapter.anchorRecord('BATCH', batchId, batchHash);

    // 3. Automatically create initial HARVEST_REGISTRATION event
    await EventService.addEvent({
      batchId,
      eventType: 'HARVEST_REGISTRATION',
      timestamp: input.harvestDate,
      location: farmLocation,
      actorName: farmer.name,
      actorRole: 'FARMER',
      temperatureCelsius: 22.0,
      humidityPercentage: 70.0,
      notes: `Batch ${batchId} harvested and registered in AgriPassport platform. Cultivation: ${cultivationMethod}.`,
    });

    const response = await this.getBatchById(batchId);
    if (!response) {
      throw new Error('Failed to retrieve newly created batch.');
    }
    return response;
  }

  private static mapRowToBatch(r: any): ProduceBatch {
    return {
      batchId: r.batch_id,
      farmerId: r.farmer_id,
      farmerName: r.farmer_name,
      cropName: r.crop_name,
      variety: r.variety,
      harvestDate: r.harvest_date,
      farmLocation: r.farm_location,
      gpsCoordinates: r.gps_coordinates,
      quantity: Number(r.quantity),
      unit: r.unit,
      grade: r.grade,
      cultivationMethod: r.cultivation_method,
      storageConditions: r.storage_conditions,
      initialFreshnessScore: Number(r.initial_freshness_score),
      estimatedShelfLifeDays: Number(r.estimated_shelf_life_days),
      currentStatus: r.current_status as ProduceStatus,
      createdAt: r.created_at,
      isFictionalDemo: Boolean(r.is_fictional_demo),
    };
  }
}
