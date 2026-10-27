import { describe, it, expect, beforeEach } from 'vitest';
import { BatchService } from '../../backend/src/services/batch-service';
import { FarmerService } from '../../backend/src/services/farmer-service';
import { getDb, resetDatabase } from '../../backend/src/database';

describe('BatchService Unit Tests', () => {
  beforeEach(() => {
    resetDatabase(':memory:');
    FarmerService.createFarmer({
      farmerId: 'FARM-TEST-001',
      name: 'Ravi Kumar',
      fpoName: 'Delta Agro Cooperative',
      village: 'Kallanai',
      district: 'Thanjavur',
      state: 'Tamil Nadu',
      gpsCoordinates: '10.7870, 79.1378',
      organicCertified: true,
    });
  });

  it('should successfully create a new produce batch and generate QR and initial event', async () => {
    const batch = await BatchService.createBatch({
      farmerId: 'FARM-TEST-001',
      cropName: 'Roma Tomatoes',
      variety: 'Hybrid F1',
      harvestDate: '2026-10-27T06:00:00.000Z',
      quantity: 350,
      unit: 'kg',
      grade: 'Grade A',
    });

    expect(batch).toBeDefined();
    expect(batch.batchId).toMatch(/^AGRI-BATCH-/);
    expect(batch.farmerName).toBe('Ravi Kumar');
    expect(batch.currentStatus).toBe('HARVESTED');
    expect(batch.qrCodeUrl).toContain('data:image/png;base64,');
    expect(batch.events.length).toBe(1);
    expect(batch.events[0].eventType).toBe('HARVEST_REGISTRATION');
  });

  it('should prevent creating a batch with an already existing batch ID', async () => {
    const customId = 'BATCH-CUSTOM-UNIQUE-123';
    await BatchService.createBatch({
      batchId: customId,
      farmerId: 'FARM-TEST-001',
      cropName: 'Cavendish Bananas',
      variety: 'G9',
      harvestDate: '2026-10-27T06:00:00.000Z',
      quantity: 500,
      unit: 'kg',
    });

    await expect(BatchService.createBatch({
      batchId: customId,
      farmerId: 'FARM-TEST-001',
      cropName: 'Cavendish Bananas',
      variety: 'G9',
      harvestDate: '2026-10-27T06:00:00.000Z',
      quantity: 500,
      unit: 'kg',
    })).rejects.toThrow(/already exists/);
  });

  it('should throw an error if the specified farmer does not exist', async () => {
    await expect(BatchService.createBatch({
      farmerId: 'NON-EXISTENT-FARMER',
      cropName: 'Mangoes',
      variety: 'Alphonso',
      harvestDate: '2026-10-27T06:00:00.000Z',
      quantity: 100,
      unit: 'kg',
    })).rejects.toThrow(/Farmer with ID 'NON-EXISTENT-FARMER' not found/);
  });

  it('should return null when retrieving an unknown batch ID', async () => {
    const result = await BatchService.getBatchById('UNKNOWN-BATCH-ID-999');
    expect(result).toBeNull();
  });
});
