import React, { useState, useEffect } from 'react';
import { Sprout, CheckCircle2, ArrowLeft } from 'lucide-react';
import { fetchFarmers, createBatch } from '../services/api';
import { Farmer } from '../types';

interface RegisterBatchPageProps {
  onBatchCreated: (batchId: string) => void;
  onCancel: () => void;
}

export const RegisterBatchPage: React.FC<RegisterBatchPageProps> = ({ onBatchCreated, onCancel }) => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    farmerId: '',
    cropName: 'Roma Tomatoes (Hybrid)',
    variety: 'AP-TOM-01',
    harvestDate: new Date().toISOString().substring(0, 16),
    quantity: 500,
    unit: 'kg',
    grade: 'Grade A',
    cultivationMethod: 'Good Agricultural Practices (GAP)',
    storageConditions: '12°C - 15°C Ambient Packhouse',
    initialFreshnessScore: 95.0,
    estimatedShelfLifeDays: 7,
  });

  useEffect(() => {
    fetchFarmers()
      .then(data => {
        setFarmers(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, farmerId: data[0].farmerId }));
        }
      })
      .catch(err => setError(err.message));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...formData,
        harvestDate: new Date(formData.harvestDate).toISOString(),
        quantity: Number(formData.quantity),
        initialFreshnessScore: Number(formData.initialFreshnessScore),
        estimatedShelfLifeDays: Number(formData.estimatedShelfLifeDays),
      };

      const result = await createBatch(payload);
      onBatchCreated(result.batchId);
    } catch (err: any) {
      setError(err.message || 'Failed to register batch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      <button className="btn btn-outline btn-sm" style={{ marginBottom: '16px' }} onClick={onCancel}>
        <ArrowLeft size={16} />
        <span>Back to Dashboard</span>
      </button>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: '#dcfce7', color: '#15803d', padding: '10px', borderRadius: '10px' }}>
            <Sprout size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
              Register Produce Batch & Mint Digital Passport
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
              Anchors harvest origin metadata to the Polygon Layer 2 ledger and generates an immutable dynamic QR tag.
            </p>
          </div>
        </div>

        {error && (
          <div className="card" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '12px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Farmer Selection */}
          <div className="form-group">
            <label className="form-label">Origin Farmer / FPO Partner *</label>
            <select
              className="form-control"
              value={formData.farmerId}
              onChange={e => setFormData({ ...formData, farmerId: e.target.value })}
              required
            >
              {farmers.map(f => (
                <option key={f.farmerId} value={f.farmerId}>
                  {f.name} — {f.fpoName} ({f.district}, {f.state})
                </option>
              ))}
            </select>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Crop Name *</label>
              <input
                type="text"
                className="form-control"
                value={formData.cropName}
                onChange={e => setFormData({ ...formData, cropName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Variety / Cultivar *</label>
              <input
                type="text"
                className="form-control"
                value={formData.variety}
                onChange={e => setFormData({ ...formData, variety: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Harvest Timestamp *</label>
              <input
                type="datetime-local"
                className="form-control"
                value={formData.harvestDate}
                onChange={e => setFormData({ ...formData, harvestDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Batch Quantity & Unit *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  step="any"
                  min="1"
                  className="form-control"
                  style={{ flex: 2 }}
                  value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                  required
                />
                <select
                  className="form-control"
                  style={{ flex: 1 }}
                  value={formData.unit}
                  onChange={e => setFormData({ ...formData, unit: e.target.value })}
                >
                  <option value="kg">kg</option>
                  <option value="crate">crate</option>
                  <option value="box">box</option>
                  <option value="ton">ton</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Quality Grade</label>
              <select
                className="form-control"
                value={formData.grade}
                onChange={e => setFormData({ ...formData, grade: e.target.value })}
              >
                <option value="Grade A">Grade A (Premium)</option>
                <option value="Grade B">Grade B (Standard)</option>
                <option value="Export Grade">Export Grade</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Cultivation Method</label>
              <input
                type="text"
                className="form-control"
                value={formData.cultivationMethod}
                onChange={e => setFormData({ ...formData, cultivationMethod: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Storage Conditions</label>
            <input
              type="text"
              className="form-control"
              value={formData.storageConditions}
              onChange={e => setFormData({ ...formData, storageConditions: e.target.value })}
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Initial AI Freshness (%)</label>
              <input
                type="number"
                min="50"
                max="100"
                className="form-control"
                value={formData.initialFreshnessScore}
                onChange={e => setFormData({ ...formData, initialFreshnessScore: parseFloat(e.target.value) || 95 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nominal Shelf-Life (Days)</label>
              <input
                type="number"
                min="1"
                max="60"
                className="form-control"
                value={formData.estimatedShelfLifeDays}
                onChange={e => setFormData({ ...formData, estimatedShelfLifeDays: parseInt(e.target.value, 10) || 7 })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
              <CheckCircle2 size={18} />
              <span>{loading ? 'Minting Digital Passport...' : 'Register & Generate QR Tag'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
