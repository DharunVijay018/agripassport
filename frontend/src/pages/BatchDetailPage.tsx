import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  QrCode,
  PlusCircle,
  MapPin,
  Calendar,
  Scale,
  CheckCircle2,
  Printer,
  Download,
  Share2
} from 'lucide-react';
import { BatchDetailResponse } from '../types';
import { fetchBatchById } from '../services/api';
import { EventTimeline } from '../components/EventTimeline';
import { FreshnessIndicator } from '../components/FreshnessIndicator';
import { BlockchainBadge } from '../components/BlockchainBadge';
import { QrModal } from '../components/QrModal';

interface BatchDetailPageProps {
  batchId: string;
  onBack: () => void;
  onAddEvent: (batchId: string) => void;
  onVerifyHash: (hash: string) => void;
}

export const BatchDetailPage: React.FC<BatchDetailPageProps> = ({
  batchId,
  onBack,
  onAddEvent,
  onVerifyHash,
}) => {
  const [batch, setBatch] = useState<BatchDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBatchById(batchId);
      setBatch(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load batch passport');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [batchId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
        Loading batch digital passport #{batchId}...
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="card" style={{ color: '#dc2626', background: '#fef2f2' }}>
        <h3>Error loading batch</h3>
        <p>{error || 'Batch not found'}</p>
        <button className="btn btn-outline" style={{ marginTop: '12px' }} onClick={onBack}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div>
      <button className="btn btn-outline btn-sm" style={{ marginBottom: '16px' }} onClick={onBack}>
        <ArrowLeft size={16} />
        <span>Back to Batches</span>
      </button>

      {/* Main Header Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="batch-id" style={{ fontSize: '1.1rem', padding: '4px 10px' }}>
                {batch.batchId}
              </span>
              <span className="badge badge-green">
                {batch.currentStatus.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>
              {batch.cropName}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Cultivar: <strong>{batch.variety}</strong> • Grade: <strong>{batch.grade}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-outline" onClick={() => setShowQrModal(true)}>
              <QrCode size={18} />
              <span>Crate QR Tag</span>
            </button>
            <button className="btn btn-primary" onClick={() => onAddEvent(batch.batchId)}>
              <PlusCircle size={18} />
              <span>Add Event</span>
            </button>
          </div>
        </div>

        {/* Origin & Metadata Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #f1f5f9'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>FARM ORIGIN</span>
            <div style={{ fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>
              {batch.farmerName}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {batch.farmer?.fpoName || batch.farmLocation}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>GPS COORDINATES</span>
            <div style={{ fontWeight: 600, color: '#1e293b', marginTop: '2px', fontFamily: 'monospace' }}>
              {batch.gpsCoordinates}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#15803d' }}>
              {batch.farmer?.organicCertified ? '✓ Certified Organic' : '✓ GAP Compliant'}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>HARVEST DATE</span>
            <div style={{ fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>
              {new Date(batch.harvestDate).toLocaleDateString()}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {new Date(batch.harvestDate).toLocaleTimeString()}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>CONSIGNMENT SIZE</span>
            <div style={{ fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>
              {batch.quantity} {batch.unit}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {batch.storageConditions}
            </div>
          </div>
        </div>

        {/* Blockchain Anchor */}
        {batch.blockchainAnchor && (
          <BlockchainBadge anchor={batch.blockchainAnchor} />
        )}
      </div>

      {/* Freshness & Quality Guide */}
      <div style={{ marginBottom: '24px' }}>
        <FreshnessIndicator freshness={batch.currentFreshness} />
      </div>

      {/* Traceability Journey */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
              Traceability Journey & Custody Chain
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Cryptographically chained checkpoints linking harvest to retail shelf.
            </p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => onAddEvent(batch.batchId)}>
            <PlusCircle size={15} />
            <span>Add Checkpoint</span>
          </button>
        </div>

        <EventTimeline events={batch.events} onVerifyHash={onVerifyHash} />
      </div>

      {showQrModal && (
        <QrModal batch={batch} onClose={() => setShowQrModal(false)} />
      )}
    </div>
  );
};
