import React from 'react';
import { LayoutDashboard, Activity, Wrench, Settings, Zap } from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="sidebar glass-panel">
      <div className="logo">
        <Zap size={28} color="#06b6d4" />
        DigitalTwin
      </div>
      <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <a href="#" className="nav-item active">
          <LayoutDashboard size={20} />
          Overview
        </a>
        <a href="#" className="nav-item">
          <Activity size={20} />
          Analytics
        </a>
        <a href="#" className="nav-item">
          <Wrench size={20} />
          Maintenance
        </a>
        <a href="#" className="nav-item">
          <Settings size={20} />
          Settings
        </a>
      </div>
    </div>
  );
}
