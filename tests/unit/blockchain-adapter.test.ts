import { describe, it, expect, beforeEach } from 'vitest';
import { MockBlockchainAdapter } from '../../backend/src/blockchain/mock-adapter';
import { resetDatabase } from '../../backend/src/database';

describe('Blockchain Mock Adapter Unit Tests', () => {
  let adapter: MockBlockchainAdapter;

  beforeEach(() => {
    resetDatabase(':memory:');
    adapter = new MockBlockchainAdapter();
  });

  it('should anchor record hash with deterministic transaction hash', async () => {
    const testHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    const result = await adapter.anchorRecord('BATCH', 'BATCH-001', testHash);

    expect(result.recordHash).toBe(testHash);
    expect(result.txHash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(result.blockNumber).toBeGreaterThan(0);
    expect(result.isMock).toBe(true);
    expect(result.network).toContain('Polygon Amoy');
  });

  it('should verify an existing anchored record hash', async () => {
    const testHash = 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0';
    await adapter.anchorRecord('EVENT', 'EVT-001', testHash);

    const verification = await adapter.verifyRecord(testHash);
    expect(verification.verified).toBe(true);
    expect(verification.recordHash).toBe(testHash);
    expect(verification.txHash).toBeDefined();
    expect(verification.isMock).toBe(true);
  });

  it('should return verified false for an unknown record hash', async () => {
    const unknownHash = 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
    const verification = await adapter.verifyRecord(unknownHash);

    expect(verification.verified).toBe(false);
    expect(verification.message).toContain('not found');
  });
});
