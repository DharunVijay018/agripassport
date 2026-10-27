import { Farmer, ProduceBatch, BatchDetailResponse, TraceabilityEvent } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export async function fetchHealth(): Promise<any> {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchBatches(params?: { farmerId?: string; status?: string; search?: string }): Promise<ProduceBatch[]> {
  const query = new URLSearchParams();
  if (params?.farmerId) query.set('farmerId', params.farmerId);
  if (params?.status) query.set('status', params.status);
  if (params?.search) query.set('search', params.search);

  const res = await fetch(`${API_BASE}/batches?${query.toString()}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch batches');
  return data.data;
}

export async function fetchBatchById(batchId: string): Promise<BatchDetailResponse> {
  const res = await fetch(`${API_BASE}/batches/${batchId}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Batch not found');
  return data.data;
}

export async function createBatch(payload: any): Promise<BatchDetailResponse> {
  const res = await fetch(`${API_BASE}/batches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.success) {
    const errorMsg = data.details
      ? data.details.map((d: any) => `${d.field}: ${d.message}`).join(', ')
      : data.error || 'Failed to register batch';
    throw new Error(errorMsg);
  }
  return data.data;
}

export async function fetchFarmers(): Promise<Farmer[]> {
  const res = await fetch(`${API_BASE}/farmers`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch farmers');
  return data.data;
}

export async function addTraceabilityEvent(payload: any): Promise<TraceabilityEvent> {
  const res = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.success) {
    const errorMsg = data.details
      ? data.details.map((d: any) => `${d.field}: ${d.message}`).join(', ')
      : data.error || 'Failed to add event';
    throw new Error(errorMsg);
  }
  return data.data;
}

export async function verifyRecordHash(recordHash: string): Promise<any> {
  const res = await fetch(`${API_BASE}/verify-hash`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recordHash }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Verification failed');
  return data.data;
}
