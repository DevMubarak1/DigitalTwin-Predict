import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import KilnDigitalTwin from './components/KilnDigitalTwin';
import MetricsPanel from './components/MetricsPanel';
import ThermalPanel from './components/ThermalPanel';
import CampaignClock from './components/CampaignClock';
import CampaignBar from './components/CampaignBar';
import TwoChannelVerdict from './components/TwoChannelVerdict';
import AlertSystem from './components/AlertSystem';
import SettingsPage from './components/SettingsPage';
import { kilnState } from './utils/kilnRomSurrogate';
import { thermalState, ZONE_THERMAL, liningAfter, thermalBand } from './utils/kilnThermalChannel';

function App() {
  const [activePage, setActivePage] = useState('Overview');
  const [clearanceMm, setClearanceMm] = useState(0);
  const [alertThreshold, setAlertThreshold] = useState(60);
  const [kData, setKData] = useState(() => kilnState(0));

  // The campaign clock. A fault slider alone shows a snapshot; running the kiln
  // forward in time is what demonstrates a prediction.
  const [campaignDay, setCampaignDay] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);
  const [coatingLost, setCoatingLost] = useState(false);
  // Tyre clearance is not a setting, it is a wear process: the tyre, filler bars
  // and pads wear and the gap opens over a campaign. This is the rate at which
  // it opens, so the fault injector MOVES on its own while the campaign runs.
  const [tyreWearRate, setTyreWearRate] = useState(15);   // mm per year
  const [manualFault, setManualFault] = useState(false);

  useEffect(() => {
    setKData(kilnState(clearanceMm));
  }, [clearanceMm]);

  // Compute live thermal state for the 3D viewer
  const thermalInfo = useMemo(() => {
    const lining = liningAfter(campaignDay, clearanceMm);
    const rows = Object.keys(ZONE_THERMAL).map(z => {
      const t = thermalState(z, lining[z], coatingLost ? 0 : null);
      return t;
    });
    const hottest = rows.reduce((p, c) => (p.t_shell_c > c.t_shell_c ? p : c));
    return { maxTemp: hottest.t_shell_c, band: thermalBand(hottest.t_shell_c) };
  }, [campaignDay, clearanceMm, coatingLost]);

  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => {
      setCampaignDay(d => {
        const next = d + speed;
        if (next >= 365) { setPlaying(false); return 365; }
        return next;
      });
    }, 120);
    return () => clearInterval(id);
  }, [playing, speed]);

  // While the campaign owns the clock, it owns the fault too: clearance grows
  // with the tyre wear rate. Dragging the injector by hand takes control back.
  useEffect(() => {
    if (manualFault) return;
    const grown = Math.round((tyreWearRate * campaignDay / 365) * 10) / 10;
    setClearanceMm(grown);
  }, [campaignDay, tyreWearRate, manualFault]);

  const handleManualClearance = (mm) => {
    setPlaying(false);
    setManualFault(true);
    setClearanceMm(mm);
  };

  const renderContent = () => {
    switch (activePage) {
      case 'Overview':
        return (
          <>
            <KilnDigitalTwin
              clearanceMm={clearanceMm}
              kData={kData}
              campaignDay={campaignDay}
              maxShellTemp={thermalInfo.maxTemp}
              thermalBand={thermalInfo.band}
            />
            <CampaignClock
              day={campaignDay} setDay={(d) => { setManualFault(false); setCampaignDay(d); }}
              playing={playing}
              setPlaying={(p) => { if (p) setManualFault(false); setPlaying(p); }}
              speed={speed} setSpeed={setSpeed}
              coatingLost={coatingLost} setCoatingLost={setCoatingLost}
              tyreWearRate={tyreWearRate} setTyreWearRate={setTyreWearRate}
              manualFault={manualFault} setManualFault={setManualFault}
              minRul={kData.min_rul_days} clearanceMm={clearanceMm}
              setClearanceMm={handleManualClearance}
            />
            <TwoChannelVerdict
              kData={kData} campaignDay={campaignDay}
              clearanceMm={clearanceMm} coatingLost={coatingLost}
            />
            <MetricsPanel kData={kData} />
            <ThermalPanel
              campaignDay={campaignDay} clearanceMm={clearanceMm} coatingLost={coatingLost}
            />
          </>
        );
      case '3D Viewer':
        return (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <KilnDigitalTwin
              isFullScreen={true}
              clearanceMm={clearanceMm}
              kData={kData}
              campaignDay={campaignDay}
              maxShellTemp={thermalInfo.maxTemp}
              thermalBand={thermalInfo.band}
            />
            <CampaignBar
              day={campaignDay} setDay={(d) => { setManualFault(false); setCampaignDay(d); }}
              playing={playing}
              setPlaying={(p) => { if (p) setManualFault(false); setPlaying(p); }}
              speed={speed} setSpeed={setSpeed}
              coatingLost={coatingLost} setCoatingLost={setCoatingLost}
              tyreWearRate={tyreWearRate} setTyreWearRate={setTyreWearRate}
              manualFault={manualFault} setManualFault={setManualFault}
              minRul={kData.min_rul_days} clearanceMm={clearanceMm}
              setClearanceMm={handleManualClearance}
              maxShellTemp={thermalInfo.maxTemp}
              thermalBand={thermalInfo.band}
            />
          </div>
        );
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
      <AlertSystem kData={kData} alertThreshold={alertThreshold} clearanceMm={clearanceMm}
                   campaignDay={campaignDay} coatingLost={coatingLost} />
    </div>
  );
}

export default App;
