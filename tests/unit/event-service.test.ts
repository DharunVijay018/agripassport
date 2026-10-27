import { describe, it, expect, beforeEach } from 'vitest';
import { EventService } from '../../backend/src/services/event-service';
import { BatchService } from '../../backend/src/services/batch-service';
import { FarmerService } from '../../backend/src/services/farmer-service';
import { resetDatabase } from '../../backend/src/database';

describe('EventService Unit Tests', () => {
  let testBatchId: string;

  beforeEach(async () => {
    resetDatabase(':memory:');
    FarmerService.createFarmer({
      farmerId: 'FARM-001',
      name: 'Palanisamy',
      fpoName: 'Krishnagiri FPO',
      village: 'Rayakottai',
      district: 'Krishnagiri',
      state: 'Tamil Nadu',
      gpsCoordinates: '12.5266, 78.2148',
      organicCertified: false,
    });

    const b = await BatchService.createBatch({
      farmerId: 'FARM-001',
      cropName: 'Tomatoes',
      variety: 'Roma',
      harvestDate: '2026-10-27T06:00:00.000Z',
      quantity: 200,
      unit: 'kg',
    });
    testBatchId = b.batchId;
  });

  it('should successfully add a valid traceability event and chain cryptographic hashes', async () => {
    const event1 = await EventService.addEvent({
      batchId: testBatchId,
      eventType: 'PACKHOUSE_GRADING',
      location: 'Krishnagiri Sorting Bay',
      actorName: 'Inspector Kumar',
      actorRole: 'FPO_QUALITY_INSPECTOR',
      temperatureCelsius: 18.0,
      humidityPercentage: 80.0,
      notes: 'Optical grading passed',
    });

    expect(event1).toBeDefined();
    expect(event1.recordHash).toBeDefined();
    expect(event1.blockchainTxHash).toMatch(/^0x[a-f0-9]{64}$/);

    const event2 = await EventService.addEvent({
      batchId: testBatchId,
      eventType: 'COLD_CHAIN_PICKUP',
      location: 'Krishnagiri Reefer Bay',
      actorName: 'Driver Murugan',
      actorRole: 'TRANSPORTER',
      temperatureCelsius: 12.0,
      humidityPercentage: 85.0,
      notes: 'Reefer truck en route to Chennai',
    });

    // The second event previousRecordHash must equal the first event recordHash
    expect(event2.previousRecordHash).toBe(event1.recordHash);
    expect(event2.recordHash).not.toBe(event1.recordHash);
  });

  it('should reject adding an event to a nonexistent batch', async () => {
    await expect(EventService.addEvent({
      batchId: 'NON-EXISTENT-BATCH',
      eventType: 'DISTRIBUTION_HUB_ARRIVAL',
      location: 'Chennai Hub',
      actorName: 'Manager',
      actorRole: 'AGGREGATOR',
      notes: 'Arrival test',
    })).rejects.toThrow(/does not exist/);
  });

  it('should update batch currentStatus when event is added', async () => {
    await EventService.addEvent({
      batchId: testBatchId,
      eventType: 'RETAIL_STORE_RECEIPT',
      location: 'Chennai Supermarket',
      actorName: 'Retail Manager',
      actorRole: 'RETAILER',
      notes: 'Received in display counter',
    });

    const updatedBatch = await BatchService.getBatchById(testBatchId);
    expect(updatedBatch?.currentStatus).toBe('RETAIL_READY');
  });
});
