import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import KilnDigitalTwin from './components/KilnDigitalTwin';
import MetricsPanel from './components/MetricsPanel';
import AlertSystem from './components/AlertSystem';
import AnalyticsPage from './components/AnalyticsPage';
import MaintenancePage from './components/MaintenancePage';
import SettingsPage from './components/SettingsPage';

function App() {
  const [activePage, setActivePage] = useState('Overview');

  const renderContent = () => {
    switch (activePage) {
      case 'Overview':
        return (
          <>
            <KilnDigitalTwin />
            <MetricsPanel />
          </>
        );
      case '3D Viewer':
        return <KilnDigitalTwin isFullScreen={true} />;
      case 'Analytics':
        return <AnalyticsPage />;
      case 'Maintenance':
        return <MaintenancePage />;
      case 'Settings':
        return <SettingsPage />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <TopBar activePage={activePage} />
      <div className="main-content">
        {renderContent()}
      </div>
      <AlertSystem />
    </div>
  );
}

export default App;
