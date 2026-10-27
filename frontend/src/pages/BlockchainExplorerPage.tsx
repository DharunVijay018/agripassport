import React, { useState } from 'react';
import { ShieldCheck, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { verifyRecordHash } from '../services/api';

interface BlockchainExplorerPageProps {
  initialHash?: string;
}

export const BlockchainExplorerPage: React.FC<BlockchainExplorerPageProps> = ({ initialHash = '' }) => {
  const [hashInput, setHashInput] = useState(initialHash);
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hashInput.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const res = await verifyRecordHash(hashInput.trim());
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '10px', borderRadius: '10px' }}>
            <ShieldCheck size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
              Ledger Anchor Verification Explorer
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
              Verify cryptographic SHA-256 hashes against simulated Polygon Layer 2 ledger anchor records.
            </p>
          </div>
        </div>

        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label className="form-label">Enter 64-Character SHA-256 Record Hash *</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Paste SHA-256 hash here..."
                value={hashInput}
                onChange={e => setHashInput(e.target.value)}
                style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Search size={16} />
                <span>{loading ? 'Verifying...' : 'Verify'}</span>
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="card" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', marginTop: '16px' }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{
            marginTop: '20px',
            padding: '20px',
            borderRadius: '8px',
            background: result.verified ? '#f0fdf4' : '#fff1f2',
            border: `1px solid ${result.verified ? '#bbf7d0' : '#fecdd3'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              {result.verified ? (
                <CheckCircle2 size={22} color="#15803d" />
              ) : (
                <AlertCircle size={22} color="#be123c" />
              )}
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: result.verified ? '#15803d' : '#be123c' }}>
                {result.verified ? 'Cryptographic Hash Match Verified' : 'Hash Not Found in Ledger'}
              </h3>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '14px' }}>
              {result.message}
            </p>

            {result.verified && (
              <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>Network:</span> {result.network}
                </div>
                <div>
                  <span style={{ fontWeight: 600 }}>Simulated Tx Hash:</span>{' '}
                  <span className="hash-pill" style={{ color: '#0369a1' }}>{result.txHash}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 600 }}>Block Number:</span> #{result.blockNumber}
                </div>
                <div>
                  <span style={{ fontWeight: 600 }}>Anchored Timestamp:</span> {result.anchoredAt ? new Date(result.anchoredAt).toLocaleString() : 'N/A'}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
