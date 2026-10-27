import React from 'react';
import { QrCode, ArrowRight, MapPin, Calendar, Scale } from 'lucide-react';
import { ProduceBatch } from '../types';

interface BatchCardProps {
  batch: ProduceBatch;
  onViewDetails: (batchId: string) => void;
  onShowQr: (batch: ProduceBatch) => void;
}

export const BatchCard: React.FC<BatchCardProps> = ({ batch, onViewDetails, onShowQr }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HARVESTED': return 'badge-amber';
      case 'PACKHOUSE_GRADED': return 'badge-blue';
      case 'IN_TRANSIT': return 'badge-purple';
      case 'COLD_STORAGE': return 'badge-blue';
      case 'DISTRIBUTION_HUB': return 'badge-purple';
      case 'RETAIL_READY': return 'badge-green';
      default: return 'badge-gray';
    }
  };

  return (
    <div className="batch-card">
      <div className="batch-header">
        <div>
          <span className="batch-id">{batch.batchId}</span>
          <h3 className="crop-name">{batch.cropName}</h3>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{batch.variety}</span>
        </div>
        <span className={`badge ${getStatusBadge(batch.currentStatus)}`}>
          {batch.currentStatus.replace(/_/g, ' ')}
        </span>
      </div>

      <div style={{ margin: '12px 0', flex: 1 }}>
        <div className="batch-meta-row">
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={14} color="#64748b" /> Farm Origin
          </span>
          <span style={{ fontWeight: 600, color: '#1e293b' }}>{batch.farmerName}</span>
        </div>

        <div className="batch-meta-row">
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} color="#64748b" /> Harvest Date
          </span>
          <span>{new Date(batch.harvestDate).toLocaleDateString()}</span>
        </div>

        <div className="batch-meta-row">
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Scale size={14} color="#64748b" /> Quantity
          </span>
          <span>{batch.quantity} {batch.unit} ({batch.grade})</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
        <button
          className="btn btn-outline btn-sm"
          style={{ flex: 1 }}
          onClick={() => onShowQr(batch)}
        >
          <QrCode size={15} />
          <span>QR Tag</span>
        </button>
        <button
          className="btn btn-primary btn-sm"
          style={{ flex: 1 }}
          onClick={() => onViewDetails(batch.batchId)}
        >
          <span>Trace Journey</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};
