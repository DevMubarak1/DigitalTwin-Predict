import React from 'react';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function MaintenancePage() {
  const tasks = [
    { id: 1, zone: 'Zone 4', task: 'Refractory Brick Replacement', status: 'critical', due: 'Today', icon: AlertCircle, color: 'var(--status-red)' },
    { id: 2, zone: 'Zone 3', task: 'Thermal Sensor Calibration', status: 'pending', due: 'In 2 days', icon: Clock, color: 'var(--status-orange)' },
    { id: 3, zone: 'Main Drive', task: 'Lubrication System Check', status: 'completed', due: 'Done yesterday', icon: CheckCircle2, color: 'var(--status-green)' },
    { id: 4, zone: 'Zone 1', task: 'Visual Inspection', status: 'pending', due: 'Next week', icon: Clock, color: 'var(--text-secondary)' },
  ];

  return (
    <div className="glass-panel" style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3>Maintenance Schedule</h3>
        <button onClick={() => alert('New ticket created')} style={{ padding: '8px 16px', background: 'var(--signal)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
          + New Ticket
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {tasks.map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <t.icon size={24} color={t.color} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{t.task}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>{t.zone}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: t.color, fontWeight: 500 }}>{t.status.toUpperCase()}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>{t.due}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
