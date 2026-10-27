import React from 'react';
import { X, Download, Printer, ExternalLink } from 'lucide-react';
import { BatchDetailResponse } from '../types';

interface QrModalProps {
  batch: BatchDetailResponse;
  onClose: () => void;
}

export const QrModal: React.FC<QrModalProps> = ({ batch, onClose }) => {
  const downloadPng = () => {
    const a = document.createElement('a');
    a.href = batch.qrCodeUrl;
    a.download = `${batch.batchId}-qrcode.png`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
            AgriPassport Dynamic QR Tag
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{
            display: 'inline-block',
            padding: '16px',
            background: '#ffffff',
            borderRadius: '12px',
            border: '2px solid #bbf7d0',
            boxShadow: 'var(--shadow)'
          }}>
            <img
              src={batch.qrCodeUrl}
              alt={`QR Code for ${batch.batchId}`}
              style={{ width: '220px', height: '220px', display: 'block' }}
            />
          </div>

          <div style={{ marginTop: '12px' }}>
            <span className="batch-id" style={{ fontSize: '1rem', padding: '4px 10px' }}>
              {batch.batchId}
            </span>
          </div>

          <div style={{ marginTop: '6px', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>
            {batch.cropName} ({batch.variety})
          </div>

          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
            Origin: {batch.farmLocation} • Harvested: {new Date(batch.harvestDate).toLocaleDateString()}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={downloadPng}>
            <Download size={16} />
            <span>Save PNG</span>
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handlePrint}>
            <Printer size={16} />
            <span>Print Tag</span>
          </button>
        </div>
      </div>
    </div>
  );
};
