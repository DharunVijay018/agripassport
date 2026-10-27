import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DashboardPage } from './pages/DashboardPage';
import { RegisterBatchPage } from './pages/RegisterBatchPage';
import { BatchDetailPage } from './pages/BatchDetailPage';
import { AddEventPage } from './pages/AddEventPage';
import { ConsumerScanPage } from './pages/ConsumerScanPage';
import { FarmersListPage } from './pages/FarmersListPage';
import { BlockchainExplorerPage } from './pages/BlockchainExplorerPage';

export function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'register' | 'detail' | 'add-event' | 'consumer' | 'farmers' | 'blockchain'>('dashboard');
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [explorerHash, setExplorerHash] = useState<string>('');

  const handleViewBatch = (batchId: string) => {
    setSelectedBatchId(batchId);
    setCurrentTab('detail');
  };

  const handleAddEvent = (batchId: string) => {
    setSelectedBatchId(batchId);
    setCurrentTab('add-event');
  };

  const handleVerifyHash = (hash: string) => {
    setExplorerHash(hash);
    setCurrentTab('blockchain');
  };

  return (
    <div className="app-container">
      <Navbar currentTab={currentTab} onSelectTab={(tab: any) => setCurrentTab(tab)} />

      <main className="main-content">
        {currentTab === 'dashboard' && (
          <DashboardPage
            onViewBatch={handleViewBatch}
            onNavigateRegister={() => setCurrentTab('register')}
          />
        )}

        {currentTab === 'register' && (
          <RegisterBatchPage
            onBatchCreated={batchId => handleViewBatch(batchId)}
            onCancel={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'detail' && selectedBatchId && (
          <BatchDetailPage
            batchId={selectedBatchId}
            onBack={() => setCurrentTab('dashboard')}
            onAddEvent={handleAddEvent}
            onVerifyHash={handleVerifyHash}
          />
        )}

        {currentTab === 'add-event' && selectedBatchId && (
          <AddEventPage
            batchId={selectedBatchId}
            onEventAdded={batchId => handleViewBatch(batchId)}
            onCancel={() => setCurrentTab('detail')}
          />
        )}

        {currentTab === 'consumer' && (
          <ConsumerScanPage onVerifyHash={handleVerifyHash} />
        )}

        {currentTab === 'farmers' && (
          <FarmersListPage />
        )}

        {currentTab === 'blockchain' && (
          <BlockchainExplorerPage initialHash={explorerHash} />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
