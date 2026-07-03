import React from 'react';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';

export default function AlertSystem() {
  return (
    <div className="alert-sidebar glass-panel">
      <h3 style={{ marginBottom: '8px' }}>Active Alerts</h3>
      
      <div className="alert-card critical">
        <div className="alert-header">
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-red)' }}>
            <ShieldAlert size={16} /> Hot Spot Detected
          </span>
          <span className="alert-time">Just now</span>
        </div>
        <div className="alert-desc">
          Zone 4 shell temperature exceeded 380°C. Refractory wear critical.
        </div>
      </div>

      <div className="alert-card warning">
        <div className="alert-header">
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-orange)' }}>
            <AlertTriangle size={16} /> RUL Dropping
          </span>
          <span className="alert-time">2 hrs ago</span>
        </div>
        <div className="alert-desc">
          Predicted remaining useful life dropped below 14 days based on recent thermal trends.
        </div>
      </div>

      <div className="alert-card" style={{ borderLeftColor: 'var(--accent-blue)', background: 'rgba(59, 130, 246, 0.05)' }}>
        <div className="alert-header">
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-blue)' }}>
            <Info size={16} /> Maintenance Logged
          </span>
          <span className="alert-time">1 day ago</span>
        </div>
        <div className="alert-desc">
          Scheduled inspection for Zone 3 requested by Wale.
        </div>
      </div>
    </div>
  );
}
