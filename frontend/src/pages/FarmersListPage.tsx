import React, { useState, useEffect } from 'react';
import { Users, MapPin, Award, Phone } from 'lucide-react';
import { Farmer } from '../types';
import { fetchFarmers } from '../services/api';

export const FarmersListPage: React.FC = () => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFarmers()
      .then(data => setFarmers(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
          Registered Farmers & Farmer Producer Organizations (FPOs)
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '4px' }}>
          Partner smallholders and agricultural societies registered on the AgriPassport traceability ledger.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          Loading registered growers...
        </div>
      ) : error ? (
        <div className="card" style={{ color: '#dc2626', background: '#fef2f2' }}>
          {error}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {farmers.map(f => (
            <div key={f.farmerId} className="card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span className="batch-id">{f.farmerId}</span>
                <span className={`badge ${f.organicCertified ? 'badge-green' : 'badge-gray'}`}>
                  {f.organicCertified ? 'Organic Certified' : 'GAP Compliant'}
                </span>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                {f.name}
              </h3>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0284c7', marginTop: '2px' }}>
                {f.fpoName}
              </div>

              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', fontSize: '0.85rem', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <MapPin size={14} color="#64748b" />
                  <span>{f.village}, {f.district}, {f.state}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Award size={14} color="#64748b" />
                  <span>GPS: {f.gpsCoordinates}</span>
                </div>
                {f.contactPlaceholder && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} color="#64748b" />
                    <span>Contact: {f.contactPlaceholder}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
