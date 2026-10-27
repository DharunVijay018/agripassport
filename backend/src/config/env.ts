import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env at repository root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  databasePath: process.env.DATABASE_PATH || './data/agripassport.sqlite',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  blockchain: {
    mode: (process.env.BLOCKCHAIN_MODE || 'mock') as 'mock' | 'polygon_amoy',
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'https://rpc-amoy.polygon.technology/',
    chainId: parseInt(process.env.BLOCKCHAIN_CHAIN_ID || '80002', 10),
    contractAddress: process.env.BLOCKCHAIN_CONTRACT_ADDRESS || '',
    privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY || '',
  },
  ai: {
    mode: process.env.AI_FRESHNESS_MODE || 'heuristic',
  },
};
