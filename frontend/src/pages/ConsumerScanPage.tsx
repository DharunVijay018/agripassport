import React, { useState } from 'react';
import { QrCode, Search, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { fetchBatchById } from '../services/api';
import { BatchDetailResponse } from '../types';
import { FreshnessIndicator } from '../components/FreshnessIndicator';
import { EventTimeline } from '../components/EventTimeline';
import { BlockchainBadge } from '../components/BlockchainBadge';

interface ConsumerScanPageProps {
  onVerifyHash: (hash: string) => void;
}

export const ConsumerScanPage: React.FC<ConsumerScanPageProps> = ({ onVerifyHash }) => {
  const [searchId, setSearchId] = useState('AGRI-BATCH-2026-TOM01');
  const [batch, setBatch] = useState<BatchDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchId.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchBatchById(searchId.trim());
      setBatch(data);
    } catch (err: any) {
      setError(err.message || 'Batch not found. Please verify the batch ID from your crate or packaging tag.');
      setBatch(null);
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (id: string) => {
    setSearchId(id);
    fetchBatchById(id)
      .then(data => {
        setBatch(data);
        setError(null);
      })
      .catch(err => setError(err.message));
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      {/* Consumer Search Header */}
      <div className="card" style={{ textAlign: 'center', padding: '36px 24px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#dcfce7',
          color: '#15803d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <QrCode size={30} />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
          Consumer Farm-to-Fork Traceability Portal
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '580px', margin: '8px auto 24px' }}>
          Scan the dynamic QR code on your produce packaging or enter the batch passport identifier to verify origin, handling history, and harvest freshness.
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', maxWidth: '540px', margin: '0 auto' }}>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. AGRI-BATCH-2026-TOM01"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            style={{ fontWeight: 600, fontFamily: 'monospace' }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Search size={16} />
            <span>Verify</span>
          </button>
        </form>

        <div style={{ marginTop: '16px', fontSize: '0.8rem', color: '#64748b' }}>
          Try demonstration batches:{' '}
          <button
            type="button"
            onClick={() => loadSample('AGRI-BATCH-2026-TOM01')}
            style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', textDecoration: 'underline', marginRight: '8px' }}
          >
            Roma Tomatoes
          </button>
          •{' '}
          <button
            type="button"
            onClick={() => loadSample('AGRI-BATCH-2026-BAN02')}
            style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', textDecoration: 'underline', margin: '0 8px' }}
          >
            Cavendish Bananas
          </button>
          •{' '}
          <button
            type="button"
            onClick={() => loadSample('AGRI-BATCH-2026-SPN04')}
            style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', textDecoration: 'underline', marginLeft: '8px' }}
          >
            Baby Spinach
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Querying cryptographic registry for {searchId}...
        </div>
      )}

      {error && (
        <div className="card" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <AlertCircle size={20} />
            <div>
              <strong>Batch Record Not Found</strong>
              <div style={{ fontSize: '0.85rem', marginTop: '2px' }}>{error}</div>
            </div>
          </div>
        </div>
      )}

      {batch && (
        <div>
          {/* Verified Origin Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span className="badge badge-green" style={{ marginBottom: '6px' }}>
                  ✓ Authentic Verified Produce Passport
                </span>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
                  {batch.cropName}
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  Cultivar: <strong>{batch.variety}</strong> • Grade: <strong>{batch.grade}</strong>
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="batch-id">{batch.batchId}</span>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                  Harvested: {new Date(batch.harvestDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid #f1f5f9'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>FARM LOCATION</span>
                <div style={{ fontWeight: 700, color: '#1e293b' }}>{batch.farmLocation}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>GPS: {batch.gpsCoordinates}</div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>FARMER / COOPERATIVE</span>
                <div style={{ fontWeight: 700, color: '#1e293b' }}>{batch.farmerName}</div>
                <div style={{ fontSize: '0.8rem', color: '#15803d' }}>
                  {batch.farmer?.organicCertified ? 'Certified Organic' : 'GAP Certified'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>CURRENT STAGE</span>
                <div style={{ fontWeight: 700, color: '#1e293b' }}>{batch.currentStatus.replace(/_/g, ' ')}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{batch.events.length} Verified Checkpoints</div>
              </div>
            </div>

            {batch.blockchainAnchor && (
              <BlockchainBadge anchor={batch.blockchainAnchor} />
            )}
          </div>

          {/* Freshness Card */}
          <div style={{ marginBottom: '24px' }}>
            <FreshnessIndicator freshness={batch.currentFreshness} />
          </div>

          {/* Verified Journey */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              Supply Chain Custody & Checkpoints
            </h3>
            <EventTimeline events={batch.events} onVerifyHash={onVerifyHash} />
          </div>
        </div>
      )}
    </div>
  );
};
