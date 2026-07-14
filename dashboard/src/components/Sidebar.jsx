import React from 'react';
import { LayoutDashboard, Activity, Wrench, Settings, Zap, Box } from 'lucide-react';

export default function Sidebar({ activePage, setActivePage }) {
  const navItems = [
    { id: 'Overview', icon: LayoutDashboard },
    { id: '3D Viewer', icon: Box },
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
            style={item.id === '3D Viewer' ? { 
              background: 'linear-gradient(90deg, rgba(242, 193, 78, 0.1), rgba(232, 67, 46, 0.1))',
              border: '1px solid rgba(242, 193, 78, 0.3)',
              boxShadow: '0 4px 12px rgba(242, 193, 78, 0.15)'
            } : {}}
            onClick={(e) => {
              e.preventDefault();
              setActivePage(item.id);
            }}
          >
            <item.icon size={20} color={item.id === '3D Viewer' ? 'var(--signal)' : 'currentColor'} />
            <span style={item.id === '3D Viewer' ? { color: 'var(--signal)', fontWeight: 600 } : {}}>{item.id}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
