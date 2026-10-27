import React from 'react';
import {
  Sprout,
  CheckCircle,
  Truck,
  Warehouse,
  ShoppingBag,
  ShieldCheck,
  Thermometer,
  Droplets
} from 'lucide-react';
import { TraceabilityEvent, EventType } from '../types';

interface EventTimelineProps {
  events: TraceabilityEvent[];
  onVerifyHash?: (hash: string) => void;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ events, onVerifyHash }) => {
  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'HARVEST_REGISTRATION': return <Sprout size={14} color="#15803d" />;
      case 'PACKHOUSE_GRADING': return <CheckCircle size={14} color="#0284c7" />;
      case 'COLD_CHAIN_PICKUP':
      case 'TRANSIT_CHECKPOINT': return <Truck size={14} color="#7e22ce" />;
      case 'COLD_STORAGE':
      case 'DISTRIBUTION_HUB_ARRIVAL': return <Warehouse size={14} color="#b45309" />;
      case 'RETAIL_STORE_RECEIPT': return <ShoppingBag size={14} color="#15803d" />;
      default: return <ShieldCheck size={14} color="#64748b" />;
    }
  };

  if (!events || events.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
        No traceability events recorded for this batch yet.
      </div>
    );
  }

  return (
    <div className="timeline">
      {events.map((evt, idx) => (
        <div key={evt.eventId || idx} className="timeline-item">
          <div className="timeline-dot">
            {getEventIcon(evt.eventType)}
          </div>

          <div className="timeline-body">
            <div className="timeline-header">
              <span className="timeline-title">
                {evt.eventType.replace(/_/g, ' ')}
              </span>
              <span className="timeline-date">
                {new Date(evt.timestamp).toLocaleString()}
              </span>
            </div>

            <div className="timeline-actor">
              {evt.actorName} ({evt.actorRole.replace(/_/g, ' ')}) • {evt.location}
            </div>

            {(evt.temperatureCelsius !== undefined || evt.humidityPercentage !== undefined) && (
              <div style={{ display: 'flex', gap: '14px', margin: '6px 0', fontSize: '0.8rem', color: '#475569' }}>
                {evt.temperatureCelsius !== undefined && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Thermometer size={14} color="#0284c7" /> {evt.temperatureCelsius}°C
                  </span>
                )}
                {evt.humidityPercentage !== undefined && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Droplets size={14} color="#0284c7" /> {evt.humidityPercentage}% RH
                  </span>
                )}
              </div>
            )}

            <p className="timeline-notes">{evt.notes}</p>

            <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Cryptographic Record SHA-256:
                </span>
                {onVerifyHash && (
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.72rem', padding: '2px 6px' }}
                    onClick={() => onVerifyHash(evt.recordHash)}
                  >
                    Verify Hash
                  </button>
                )}
              </div>
              <div className="hash-pill">{evt.recordHash}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
