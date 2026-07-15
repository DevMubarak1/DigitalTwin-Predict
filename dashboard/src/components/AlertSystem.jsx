import React from 'react';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';

export default function AlertSystem({ kData, alertThreshold, clearanceMm }) {
  const { min_rul_days, governing_zone, value } = kData || {};
  const isCritical = min_rul_days < alertThreshold;

  return (
    <div className="alert-sidebar glass-panel">
      <h3 style={{ marginBottom: '8px' }}>Active Alerts</h3>
      
      {isCritical && (
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
      )}

      {/* Keeping thermal and maintenance mock alerts for UI completeness */}
      <div className="alert-card warning">
        <div className="alert-header">
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-orange)' }}>
            <AlertTriangle size={16} /> Hot Spot Detected
          </span>
          <span className="alert-time">2 hrs ago</span>
        </div>
        <div className="alert-desc">
          Zone 4 shell temperature exceeded 380°C. Refractory wear accelerated.
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
