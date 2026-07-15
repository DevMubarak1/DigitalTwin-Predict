import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export default function AlertSystem({ kData, alertThreshold, clearanceMm }) {
  const { min_rul_days, governing_zone, value } = kData || {};
  const isCritical = min_rul_days < alertThreshold;

  return (
    <div className="alert-sidebar glass-panel">
      <h3 style={{ marginBottom: '8px' }}>Active Alerts</h3>
      
      {isCritical ? (
        <div className="alert-card critical" style={{ borderLeftColor: 'var(--status-red)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <div className="alert-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-red)' }}>
              <ShieldAlert size={16} /> Critical Wear Detected
            </span>
            <span className="alert-time">Just now</span>
          </div>
          <div className="alert-desc">
            {governing_zone?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} RUL dropped below {alertThreshold} days (currently {Math.floor(min_rul_days)} days). 
            <br />
            <strong>Root cause:</strong> tyre clearance {value} mm.
          </div>
        </div>
      ) : (
        <div className="alert-card" style={{ borderLeftColor: 'var(--status-green)', background: 'rgba(16, 185, 129, 0.05)' }}>
          <div className="alert-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-green)' }}>
              <Info size={16} /> System Healthy
            </span>
            <span className="alert-time">Live</span>
          </div>
          <div className="alert-desc">
            All structural parameters are within acceptable limits. No active alerts.
          </div>
        </div>
      )}
    </div>
  );
}
