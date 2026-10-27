import crypto from 'crypto';
import { IBlockchainAdapter, BlockchainVerificationResult } from './adapter.interface';
import { BlockchainAnchorResult } from '../types';
import { getDb } from '../database';

export class MockBlockchainAdapter implements IBlockchainAdapter {
  private network = 'Polygon Amoy Testnet (Simulated Local Adapter)';
  private blockCounter = 4829100;

  getMode(): string {
    return 'mock';
  }

  getNetwork(): string {
    return this.network;
  }

  /**
   * Generates a deterministic simulated Polygon transaction hash from the payload hash.
   */
  private generateMockTxHash(recordHash: string): string {
    const raw = crypto.createHash('sha256').update(`polygon-amoy:${recordHash}`).digest('hex');
    return `0x${raw}`;
  }

  async anchorRecord(
    entityType: 'BATCH' | 'EVENT',
    entityId: string,
    recordHash: string,
    metadata?: Record<string, unknown>
  ): Promise<BlockchainAnchorResult> {
    const db = getDb();
    const txHash = this.generateMockTxHash(recordHash);
    const blockNumber = ++this.blockCounter;
    const timestamp = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO blockchain_anchors (
        record_hash, entity_type, entity_id, tx_hash, block_number, network, is_mock, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, 1, ?)
    `);

    stmt.run(recordHash, entityType, entityId, txHash, blockNumber, this.network, timestamp);

    return {
      recordHash,
      txHash,
      blockNumber,
      timestamp,
      network: this.network,
      isMock: true,
    };
  }

  async verifyRecord(recordHash: string): Promise<BlockchainVerificationResult> {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT * FROM blockchain_anchors WHERE record_hash = ?
    `);
    const row = stmt.get(recordHash) as {
      record_hash: string;
      entity_type: string;
      entity_id: string;
      tx_hash: string;
      block_number: number;
      network: string;
      is_mock: number;
      timestamp: string;
    } | undefined;

    if (!row) {
      return {
        verified: false,
        recordHash,
        network: this.network,
        isMock: true,
        message: 'Record hash not found on the simulated ledger anchor registry.',
      };
    }

    return {
      verified: true,
      recordHash: row.record_hash,
      txHash: row.tx_hash,
      blockNumber: row.block_number,
      anchoredAt: row.timestamp,
      network: row.network,
      isMock: Boolean(row.is_mock),
      message: 'Cryptographic record hash verified against simulated immutable ledger anchor.',
    };
  }
}
