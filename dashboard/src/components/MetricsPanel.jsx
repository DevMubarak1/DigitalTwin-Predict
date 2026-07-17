import React from 'react';
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function MetricsPanel({ kData }) {
  const { min_rul_days, governing_zone, zones } = kData;
  const latestRul = Math.floor(min_rul_days);

  // Format the zone names for the chart
  const zoneChartData = zones.map(z => ({
    name: z.zone.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    rul: Math.floor(z.rul_days),
    ovality: parseFloat(z.omega_pct.toFixed(2)),
    isGoverning: z.zone === governing_zone
  }));

  const maxOvality = Math.max(...zoneChartData.map(z => z.ovality));

  return (
    <div className="metrics-container" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '24px' }}>


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
