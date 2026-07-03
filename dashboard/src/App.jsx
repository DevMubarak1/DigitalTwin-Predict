import React from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import KilnDigitalTwin from './components/KilnDigitalTwin';
import MetricsPanel from './components/MetricsPanel';
import AlertSystem from './components/AlertSystem';

function App() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <TopBar />
      <div className="main-content">
        <KilnDigitalTwin />
        <MetricsPanel />
      </div>
      <AlertSystem />
    </div>
  );
}

export default App;
