import { IBlockchainAdapter } from './adapter.interface';
import { MockBlockchainAdapter } from './mock-adapter';
import { config } from '../config/env';

let adapterInstance: IBlockchainAdapter | null = null;

export function getBlockchainAdapter(): IBlockchainAdapter {
  if (!adapterInstance) {
    if (config.blockchain.mode === 'polygon_amoy' && config.blockchain.contractAddress) {
      // In future live testnet integration, instantiate Ethers/Viem adapter
      // For student MVP and default testing, fallback safely to MockBlockchainAdapter
      adapterInstance = new MockBlockchainAdapter();
    } else {
      adapterInstance = new MockBlockchainAdapter();
    }
  }
  return adapterInstance;
}

export * from './adapter.interface';
export * from './mock-adapter';
