import React from 'react';
import { AlertCircle, Clock, Thermometer, CheckCircle2 } from 'lucide-react';
import { FreshnessEstimate } from '../types';

interface FreshnessIndicatorProps {
  freshness: FreshnessEstimate;
}

export const FreshnessIndicator: React.FC<FreshnessIndicatorProps> = ({ freshness }) => {
  let gradeColor = '#15803d';
  let badgeClass = 'badge-green';

  if (freshness.grade.includes('Grade B')) {
    gradeColor = '#0369a1';
    badgeClass = 'badge-blue';
  } else if (freshness.grade.includes('Grade C')) {
    gradeColor = '#d97706';
    badgeClass = 'badge-amber';
  } else if (freshness.grade === 'Degraded') {
    gradeColor = '#dc2626';
    badgeClass = 'badge-gray';
  }

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>
          AI Freshness & Shelf-Life Estimate
        </h3>
        <span className={`badge ${badgeClass}`}>
          {freshness.grade}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div style={{
          background: '#f8fafc',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #f1f5f9'
        }}>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: gradeColor }}>
            {freshness.freshnessScore}%
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, marginTop: '4px' }}>
            Estimated Freshness Index
          </div>
        </div>

        <div style={{
          background: '#f8fafc',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #f1f5f9'
        }}>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a' }}>
            {freshness.estimatedRemainingDays} <span style={{ fontSize: '1rem', fontWeight: 500 }}>Days</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, marginTop: '4px' }}>
            Remaining Shelf-Life
          </div>
        </div>
      </div>

      <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={16} color="#64748b" />
          <span>Elapsed Time: <strong>{freshness.elapsedHours} hours</strong> since harvest</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Thermometer size={16} color="#64748b" />
          <span>Temperature Impact: {freshness.temperatureFactor}</span>
        </div>
      </div>

      <div className="disclaimer-box">
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{freshness.disclaimer}</span>
        </div>
      </div>
    </div>
  );
};
