import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../backend/src/app';
import { resetDatabase } from '../../backend/src/database';
import { runSeed } from '../../scripts/seed';

describe('API Endpoints Integration Tests', () => {
  const app = createApp();

  beforeEach(async () => {
    resetDatabase(':memory:');
    await runSeed();
  });

  it('GET /api/health returns system status and mock blockchain info', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.project).toBe('AgriPassport');
    expect(res.body.blockchain.mode).toBe('mock');
  });

  it('GET /api/farmers returns list of seeded demonstration farmers', async () => {
    const res = await request(app).get('/api/farmers');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(4);
    expect(res.body.data[0]).toHaveProperty('farmerId');
    expect(res.body.data[0]).toHaveProperty('fpoName');
  });

  it('GET /api/batches returns list of seeded produce batches', async () => {
    const res = await request(app).get('/api/batches');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(5);
  });

  it('GET /api/batches/:id returns batch details, QR code, and freshness score', async () => {
    const res = await request(app).get('/api/batches/AGRI-BATCH-2026-TOM01');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.batchId).toBe('AGRI-BATCH-2026-TOM01');
    expect(res.body.data.qrCodeUrl).toMatch(/^data:image\/png;base64,/);
    expect(res.body.data.currentFreshness).toBeDefined();
    expect(res.body.data.events.length).toBeGreaterThan(0);
  });

  it('POST /api/batches rejects invalid payload missing required fields', async () => {
    const res = await request(app)
      .post('/api/batches')
      .send({
        // Missing farmerId, harvestDate, quantity, unit
        cropName: 'Incomplete Crop',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Validation Error');
    expect(res.body.details.length).toBeGreaterThan(0);
  });

  it('POST /api/batches successfully registers a valid batch', async () => {
    const res = await request(app)
      .post('/api/batches')
      .send({
        farmerId: 'FARM-TN-101',
        cropName: 'Organic Guava',
        variety: 'Lucknow 49',
        harvestDate: '2026-10-27T08:00:00.000Z',
        quantity: 150,
        unit: 'kg',
        grade: 'Grade A',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.batchId).toBeDefined();
    expect(res.body.data.cropName).toBe('Organic Guava');
  });

  it('POST /api/events adds a valid event and links hash chain', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({
        batchId: 'AGRI-BATCH-2026-TOM01',
        eventType: 'TRANSIT_CHECKPOINT',
        location: 'Vellore Tollway Checkpoint, NH-48',
        actorName: 'Inspector Kumar',
        actorRole: 'INSPECTOR',
        temperatureCelsius: 13.5,
        humidityPercentage: 82.0,
        notes: 'Mid-transit cold chain audit passed.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.recordHash).toBeDefined();
    expect(res.body.data.blockchainTxHash).toBeDefined();
  });

  it('POST /api/verify-hash verifies an anchored hash', async () => {
    // Get batch to obtain record hash
    const batchRes = await request(app).get('/api/batches/AGRI-BATCH-2026-TOM01');
    const firstEvent = batchRes.body.data.events[0];

    const verifyRes = await request(app)
      .post('/api/verify-hash')
      .send({ recordHash: firstEvent.recordHash });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.data.verified).toBe(true);
  });
});
