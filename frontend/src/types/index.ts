export type ProduceStatus = 
  | 'HARVESTED'
  | 'PACKHOUSE_GRADED'
  | 'IN_TRANSIT'
  | 'COLD_STORAGE'
  | 'DISTRIBUTION_HUB'
  | 'RETAIL_READY'
  | 'CONSUMED';

export type EventType =
  | 'HARVEST_REGISTRATION'
  | 'PACKHOUSE_GRADING'
  | 'COLD_CHAIN_PICKUP'
  | 'TRANSIT_CHECKPOINT'
  | 'COLD_STORAGE'
  | 'DISTRIBUTION_HUB_ARRIVAL'
  | 'RETAIL_STORE_RECEIPT';

export type ActorRole =
  | 'FARMER'
  | 'FPO_QUALITY_INSPECTOR'
  | 'TRANSPORTER'
  | 'STORAGE_OPERATOR'
  | 'AGGREGATOR'
  | 'RETAILER'
  | 'INSPECTOR';

export interface Farmer {
  farmerId: string;
  name: string;
  fpoName: string;
  village: string;
  district: string;
  state: string;
  gpsCoordinates: string;
  organicCertified: boolean;
  contactPlaceholder?: string;
  isFictionalDemo?: boolean;
}

export interface ProduceBatch {
  batchId: string;
  farmerId: string;
  farmerName: string;
  cropName: string;
  variety: string;
  harvestDate: string;
  farmLocation: string;
  gpsCoordinates: string;
  quantity: number;
  unit: string;
  grade: string;
  cultivationMethod: string;
  storageConditions: string;
  initialFreshnessScore: number;
  estimatedShelfLifeDays: number;
  currentStatus: ProduceStatus;
  createdAt: string;
  isFictionalDemo?: boolean;
}

export interface TraceabilityEvent {
  eventId: string;
  batchId: string;
  eventType: EventType;
  timestamp: string;
  location: string;
  actorName: string;
  actorRole: ActorRole;
  temperatureCelsius?: number;
  humidityPercentage?: number;
  notes: string;
  recordHash: string;
  previousRecordHash: string;
  blockchainTxHash?: string;
  createdAt: string;
}

export interface FreshnessEstimate {
  cropName: string;
  freshnessScore: number;
  grade: 'Grade A (Optimal)' | 'Grade B (Acceptable)' | 'Grade C (Expiring Soon)' | 'Degraded';
  estimatedRemainingDays: number;
  temperatureFactor: string;
  elapsedHours: number;
  disclaimer: string;
}

export interface BlockchainAnchorResult {
  recordHash: string;
  txHash: string;
  blockNumber: number;
  timestamp: string;
  network: string;
  isMock: boolean;
}

export interface BatchDetailResponse extends ProduceBatch {
  farmer?: Farmer;
  events: TraceabilityEvent[];
  qrCodeUrl: string;
  qrCodeSvg: string;
  currentFreshness: FreshnessEstimate;
  blockchainAnchor?: BlockchainAnchorResult;
}
