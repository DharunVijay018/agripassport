import React from 'react';
import { Sprout, QrCode, PlusCircle, Users, ShieldCheck, Home } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand" onClick={() => onSelectTab('dashboard')}>
          <Sprout size={28} className="brand-icon" />
          <span>AgriPassport</span>
          <span className="brand-badge">Simulated Polygon Amoy</span>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-link ${currentTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => onSelectTab('dashboard')}
          >
            <Home size={18} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-link ${currentTab === 'register' ? 'active' : ''}`}
            onClick={() => onSelectTab('register')}
          >
            <PlusCircle size={18} />
            <span>Register Batch</span>
          </button>

          <button
            className={`nav-link ${currentTab === 'consumer' ? 'active' : ''}`}
            onClick={() => onSelectTab('consumer')}
          >
            <QrCode size={18} />
            <span>Verify QR</span>
          </button>

          <button
            className={`nav-link ${currentTab === 'farmers' ? 'active' : ''}`}
            onClick={() => onSelectTab('farmers')}
          >
            <Users size={18} />
            <span>Farmers</span>
          </button>

          <button
            className={`nav-link ${currentTab === 'blockchain' ? 'active' : ''}`}
            onClick={() => onSelectTab('blockchain')}
          >
            <ShieldCheck size={18} />
            <span>Ledger Explorer</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
