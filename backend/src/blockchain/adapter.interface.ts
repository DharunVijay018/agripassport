import { BlockchainAnchorResult } from '../types';

export interface BlockchainVerificationResult {
  verified: boolean;
  recordHash: string;
  txHash?: string;
  blockNumber?: number;
  anchoredAt?: string;
  network: string;
  isMock: boolean;
  message: string;
}

export interface IBlockchainAdapter {
  getMode(): string;
  getNetwork(): string;
  anchorRecord(
    entityType: 'BATCH' | 'EVENT',
    entityId: string,
    recordHash: string,
    metadata?: Record<string, unknown>
  ): Promise<BlockchainAnchorResult>;
  verifyRecord(recordHash: string): Promise<BlockchainVerificationResult>;
}
