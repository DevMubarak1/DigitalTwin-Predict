import React from 'react';
import { LayoutDashboard, Activity, Wrench, Settings, Zap } from 'lucide-react';

export default function Sidebar({ activePage, setActivePage }) {
  const navItems = [
    { id: 'Overview', icon: LayoutDashboard },
    { id: 'Analytics', icon: Activity },
    { id: 'Maintenance', icon: Wrench },
    { id: 'Settings', icon: Settings },
  ];

  return (
    <div className="sidebar glass-panel">
      <div className="logo">
        <Zap size={28} color="var(--signal)" />
        DigitalTwin
      </div>
      <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {navItems.map((item) => (
          <a
            key={item.id}
            href="#"
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActivePage(item.id);
            }}
          >
            <item.icon size={20} />
            {item.id}
          </a>
        ))}
      </div>
    </div>
  );
}
