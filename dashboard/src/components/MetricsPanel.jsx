import React from 'react';
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function MetricsPanel({ clearanceMm, setClearanceMm, kData }) {
  const { min_rul_days, governing_zone, zones } = kData;
  const latestRul = Math.floor(min_rul_days);

  // Format the zone names for the chart
  const zoneChartData = zones.map(z => ({
    name: z.zone.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    rul: Math.floor(z.rul_days),
    ovality: parseFloat(z.omega_max.toFixed(2)),
    isGoverning: z.zone === governing_zone
  }));

  const maxOvality = Math.max(...zoneChartData.map(z => z.ovality));

  return (
    <div className="metrics-container" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '24px' }}>
      {/* Fault Injector Panel */}
      <div className="metric-card glass-panel" style={{ flex: '1 1 100%' }}>
        <div className="metric-label" style={{ marginBottom: '16px', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
          Fault Injector: Mechanical Surrogate
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Tyre Clearance / Creep</span>
            <span>{clearanceMm} mm</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="30" 
            step="1" 
            value={clearanceMm} 
            onChange={(e) => setClearanceMm(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-blue)', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span>Healthy (0mm)</span>
            <span>Critical Fault (30mm)</span>
          </div>
        </div>
      </div>

      {/* Ovality Channel (Derived from AI Surrogate) */}
      <div className="metric-card glass-panel" style={{ flex: '1 1 calc(50% - 12px)', display: 'flex', flexDirection: 'column' }}>
        <div className="metric-label">Max Shell Ovality (%)</div>
        <div className="metric-value" style={{ color: maxOvality > 0.3 ? 'var(--status-red)' : 'var(--status-orange)' }}>
          {maxOvality}%
        </div>
        <div style={{ flexGrow: 1, marginTop: '16px', height: '150px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={zoneChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} interval={0} angle={-15} textAnchor="end" height={40} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '8px' }} />
              <Bar dataKey="ovality" radius={[4, 4, 0, 0]} isAnimationActive={true}>
                {
                  zoneChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.ovality > 0.3 ? 'var(--status-red)' : 'var(--status-orange)'} />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mechanical Channel: RUL per Zone */}
      <div className="metric-card glass-panel" style={{ flex: '1 1 calc(50% - 12px)', display: 'flex', flexDirection: 'column' }}>
        <div className="metric-label">Remaining Useful Life (Governing: {governing_zone.replace('_', ' ')})</div>
        <div className="metric-value" style={{ color: min_rul_days < 60 ? 'var(--status-red)' : 'var(--accent-cyan)' }}>
          {latestRul} Days
        </div>
        <div style={{ flexGrow: 1, marginTop: '16px', height: '150px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={zoneChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} interval={0} angle={-15} textAnchor="end" height={40} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '8px' }} />
              <Bar dataKey="rul" radius={[4, 4, 0, 0]} isAnimationActive={true}>
                {
                  zoneChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isGoverning ? 'var(--status-red)' : 'var(--accent-cyan)'} />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
