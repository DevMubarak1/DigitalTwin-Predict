import React from 'react';
import { Bell, User } from 'lucide-react';

export default function TopBar() {
  return (
    <div className="topbar glass-panel">
      <div>
        <h2>Kiln Health Overview</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Real-time monitoring & RUL prediction</p>
      </div>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <Bell size={20} color="var(--text-secondary)" />
          <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', background: 'var(--status-red)', borderRadius: '50%' }}></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '20px' }}>
          <User size={16} />
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Admin (Plant 1)</span>
        </div>
      </div>
    </div>
  );
}
