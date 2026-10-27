import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p>
          <strong>AgriPassport: AI-Powered Blockchain Digital Passport for Farm-to-Fork Traceability</strong>
        </p>
        <p style={{ marginTop: '4px', fontSize: '0.8rem' }}>
          Department of Computer Science and Engineering | Innovative Design Lab–I (Batch 2025–2029)
        </p>
        <p style={{ marginTop: '2px', fontSize: '0.8rem' }}>
          <strong>Sri Sairam Engineering College</strong> (Autonomous, Affiliated to Anna University, Chennai - 600 044)
        </p>
        <div className="footer-team">
          Team: Dharun Vijay M (2503412510421063) • Bharani R (2503412510421047) • Mithilesh N (2503412510421159)
        </div>
        <p style={{ marginTop: '12px', fontSize: '0.75rem', color: '#94a3b8' }}>
          MIT Licensed Open Source Project • Simulated Local Blockchain & Heuristic AI Quality Guide
        </p>
      </div>
    </footer>
  );
};
