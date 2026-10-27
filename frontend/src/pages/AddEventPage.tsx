import React, { useState } from 'react';
import { Truck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { addTraceabilityEvent } from '../services/api';
import { EventType, ActorRole } from '../types';

interface AddEventPageProps {
  batchId: string;
  onEventAdded: (batchId: string) => void;
  onCancel: () => void;
}

export const AddEventPage: React.FC<AddEventPageProps> = ({ batchId, onEventAdded, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    eventType: 'TRANSIT_CHECKPOINT' as EventType,
    location: 'Vellore Cold Hub, NH-48, Tamil Nadu',
    actorName: 'Ramesh Transport (TN-24-AQ-8821)',
    actorRole: 'TRANSPORTER' as ActorRole,
    temperatureCelsius: 12.5,
    humidityPercentage: 85.0,
    notes: 'Reefer unit operational. Temperature logged within compliant range.',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      await addTraceabilityEvent({
        batchId,
        eventType: formData.eventType,
        location: formData.location,
        actorName: formData.actorName,
        actorRole: formData.actorRole,
        temperatureCelsius: formData.temperatureCelsius ? Number(formData.temperatureCelsius) : undefined,
        humidityPercentage: formData.humidityPercentage ? Number(formData.humidityPercentage) : undefined,
        notes: formData.notes,
        timestamp: new Date().toISOString(),
      });

      onEventAdded(batchId);
    } catch (err: any) {
      setError(err.message || 'Failed to add event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <button className="btn btn-outline btn-sm" style={{ marginBottom: '16px' }} onClick={onCancel}>
        <ArrowLeft size={16} />
        <span>Back to Batch Details</span>
      </button>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: '#f3e8ff', color: '#7e22ce', padding: '10px', borderRadius: '10px' }}>
            <Truck size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
              Add Traceability Checkpoint
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
              Batch Target: <strong>{batchId}</strong> • Cryptographically links to previous event hash.
            </p>
          </div>
        </div>

        {error && (
          <div className="card" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '12px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Event Stage Type *</label>
            <select
              className="form-control"
              value={formData.eventType}
              onChange={e => setFormData({ ...formData, eventType: e.target.value as EventType })}
              required
            >
              <option value="PACKHOUSE_GRADING">Packhouse Sorting & Grading</option>
              <option value="COLD_CHAIN_PICKUP">Cold Chain Reefer Loading</option>
              <option value="TRANSIT_CHECKPOINT">Highway Transit Checkpoint</option>
              <option value="COLD_STORAGE">Cold Storage Warehouse Inward</option>
              <option value="DISTRIBUTION_HUB_ARRIVAL">Wholesale Distribution Cross-Docking</option>
              <option value="RETAIL_STORE_RECEIPT">Retail Store Intake & Display</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Physical Location *</label>
            <input
              type="text"
              className="form-control"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Actor / Organization Name *</label>
              <input
                type="text"
                className="form-control"
                value={formData.actorName}
                onChange={e => setFormData({ ...formData, actorName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Supply Chain Role *</label>
              <select
                className="form-control"
                value={formData.actorRole}
                onChange={e => setFormData({ ...formData, actorRole: e.target.value as ActorRole })}
                required
              >
                <option value="FPO_QUALITY_INSPECTOR">FPO Quality Inspector</option>
                <option value="TRANSPORTER">Cold Logistics Transporter</option>
                <option value="STORAGE_OPERATOR">Cold Storage Operator</option>
                <option value="AGGREGATOR">Wholesale Aggregator</option>
                <option value="RETAILER">Supermarket Retailer</option>
                <option value="INSPECTOR">Independent Auditor</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Recorded Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                value={formData.temperatureCelsius}
                onChange={e => setFormData({ ...formData, temperatureCelsius: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Relative Humidity (% RH)</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                value={formData.humidityPercentage}
                onChange={e => setFormData({ ...formData, humidityPercentage: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Inspection Notes & Handling Details *</label>
            <textarea
              rows={3}
              className="form-control"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
              <CheckCircle2 size={18} />
              <span>{loading ? 'Anchoring Event...' : 'Record Event & Link Hash'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
