import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import KilnDigitalTwin from './components/KilnDigitalTwin';
import MetricsPanel from './components/MetricsPanel';
import AlertSystem from './components/AlertSystem';
import SettingsPage from './components/SettingsPage';
import { kilnState } from './utils/kilnRomSurrogate';

function App() {
  const [activePage, setActivePage] = useState('Overview');
  const [clearanceMm, setClearanceMm] = useState(0);
  const [alertThreshold, setAlertThreshold] = useState(60);
  const [kData, setKData] = useState(() => kilnState(0));

  useEffect(() => {
    setKData(kilnState(clearanceMm));
  }, [clearanceMm]);

  const renderContent = () => {
    switch (activePage) {
      case 'Overview':
        return (
          <>
            <KilnDigitalTwin />
            <MetricsPanel clearanceMm={clearanceMm} setClearanceMm={setClearanceMm} kData={kData} />
          </>
        );
      case '3D Viewer':
        return <KilnDigitalTwin isFullScreen={true} />;
      case 'Settings':
        return <SettingsPage alertThreshold={alertThreshold} setAlertThreshold={setAlertThreshold} />;
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
      <AlertSystem kData={kData} alertThreshold={alertThreshold} clearanceMm={clearanceMm} />
    </div>
  );
}

export default App;
