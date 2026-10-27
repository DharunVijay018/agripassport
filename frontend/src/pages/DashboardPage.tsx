import React, { useState, useEffect } from 'react';
import { Package, Truck, ShieldCheck, Sparkles, Search, Filter } from 'lucide-react';
import { ProduceBatch } from '../types';
import { fetchBatches } from '../services/api';
import { BatchCard } from '../components/BatchCard';
import { QrModal } from '../components/QrModal';

interface DashboardPageProps {
  onViewBatch: (batchId: string) => void;
  onNavigateRegister: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onViewBatch, onNavigateRegister }) => {
  const [batches, setBatches] = useState<ProduceBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBatchForQr, setSelectedBatchForQr] = useState<any | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBatches({
        status: statusFilter || undefined,
        search: searchTerm || undefined,
      });
      setBatches(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // Stats calculation
  const totalBatches = batches.length;
  const inTransitCount = batches.filter(b => b.currentStatus === 'IN_TRANSIT').length;
  const retailReadyCount = batches.filter(b => b.currentStatus === 'RETAIL_READY').length;
  const avgFreshness = batches.length > 0
    ? Math.round(batches.reduce((acc, b) => acc + b.initialFreshnessScore, 0) / batches.length)
    : 94;

  return (
    <div>
      {/* Top Banner */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
          AgriPassport Produce Traceability Hub
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '4px' }}>
          Cryptographically-backed digital passports and AI-assisted freshness estimation for farm-to-fork horticultural supply chains.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><Package size={24} /></div>
          <div>
            <div className="stat-val">{totalBatches}</div>
            <div className="stat-label">Total Produce Batches</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
            <Truck size={24} />
          </div>
          <div>
            <div className="stat-val">{inTransitCount}</div>
            <div className="stat-label">In Cold Transit</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="stat-val">{retailReadyCount}</div>
            <div className="stat-label">Retail Verified</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <div className="stat-val">{avgFreshness}%</div>
            <div className="stat-label">Mean Freshness Score</div>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by crop (e.g. Tomatoes, Bananas) or Batch ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ width: '180px' }}>
            <select
              className="form-control"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="HARVESTED">Harvested</option>
              <option value="PACKHOUSE_GRADED">Packhouse Graded</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="COLD_STORAGE">Cold Storage</option>
              <option value="DISTRIBUTION_HUB">Distribution Hub</option>
              <option value="RETAIL_READY">Retail Ready</option>
            </select>
          </div>

          <button type="submit" className="btn btn-outline">
            <Search size={16} />
            <span>Search</span>
          </button>

          <button type="button" className="btn btn-primary" onClick={onNavigateRegister}>
            + New Batch
          </button>
        </form>
      </div>

      {/* Batches Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          Loading registered produce batches...
        </div>
      ) : error ? (
        <div className="card" style={{ color: '#dc2626', background: '#fef2f2' }}>
          {error}
        </div>
      ) : batches.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
          <h3>No batches found matching criteria.</h3>
          <p style={{ marginTop: '8px' }}>Try resetting your filter or register a new produce batch.</p>
        </div>
      ) : (
        <div className="batches-grid">
          {batches.map(b => (
            <BatchCard
              key={b.batchId}
              batch={b}
              onViewDetails={onViewBatch}
              onShowQr={async () => {
                // Fetch full batch details for QR modal
                try {
                  const full = await fetchBatches({ search: b.batchId });
                  if (full && full.length > 0) {
                    onViewBatch(b.batchId);
                  }
                } catch {
                  onViewBatch(b.batchId);
                }
              }}
            />
          ))}
        </div>
      )}

      {selectedBatchForQr && (
        <QrModal batch={selectedBatchForQr} onClose={() => setSelectedBatchForQr(null)} />
      )}
    </div>
  );
};
