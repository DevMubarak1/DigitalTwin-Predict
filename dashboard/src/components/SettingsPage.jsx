import React from 'react';

export default function SettingsPage({ alertThreshold, setAlertThreshold }) {
  return (
    <div className="glass-panel" style={{ padding: '24px', flexGrow: 1 }}>
      <h3 style={{ marginBottom: '24px' }}>System Configuration</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Mechanical Fault Alert Threshold (Days)</label>
          <input 
            type="number" 
            value={alertThreshold} 
            onChange={(e) => setAlertThreshold(Number(e.target.value))}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', color: 'white', outline: 'none' }} 
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Alert Threshold: Critical Temp (°C)</label>
          <input type="number" defaultValue={380} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', color: 'white', outline: 'none' }} />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Data Refresh Rate (seconds)</label>
          <select style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', color: 'white', outline: 'none' }}>
            <option>2 seconds</option>
            <option>5 seconds</option>
            <option>10 seconds</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input type="checkbox" id="emailAlerts" defaultChecked style={{ width: '20px', height: '20px', accentColor: 'var(--signal)' }} />
          <label htmlFor="emailAlerts" style={{ cursor: 'pointer' }}>Enable Email Notifications for Critical Alerts</label>
        </div>

        <button onClick={() => alert('Settings Saved successfully')} style={{ marginTop: '16px', padding: '12px 24px', background: 'var(--signal)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' }}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
