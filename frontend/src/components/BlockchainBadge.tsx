import React from 'react';
import { ShieldCheck, Link2 } from 'lucide-react';
import { BlockchainAnchorResult } from '../types';

interface BlockchainBadgeProps {
  anchor?: BlockchainAnchorResult;
  recordHash?: string;
  txHash?: string;
}

export const BlockchainBadge: React.FC<BlockchainBadgeProps> = ({ anchor, recordHash, txHash }) => {
  const hash = recordHash || anchor?.recordHash;
  const transaction = txHash || anchor?.txHash;

  return (
    <div style={{
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '0.85rem',
      marginTop: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#0369a1' }}>
          <ShieldCheck size={18} />
          <span>Ledger Anchor Verification</span>
        </div>
        <span className="badge badge-blue">
          {anchor?.network || 'Polygon Amoy (Mock)'}
        </span>
      </div>

      {hash && (
        <div style={{ marginBottom: '4px' }}>
          <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>RECORD SHA-256 HASH:</span>
          <div className="hash-pill" style={{ display: 'block', marginTop: '2px' }}>{hash}</div>
        </div>
      )}

      {transaction && (
        <div>
          <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>TX HASH:</span>
          <div className="hash-pill" style={{ display: 'block', marginTop: '2px', color: '#0369a1' }}>
            <Link2 size={12} style={{ display: 'inline', marginRight: '4px' }} />
            {transaction}
          </div>
        </div>
      )}

      {anchor?.blockNumber && (
        <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#64748b' }}>
          Block Height: <strong>#{anchor.blockNumber}</strong> • Anchored: {new Date(anchor.timestamp).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};
