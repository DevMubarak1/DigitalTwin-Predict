import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const mockData = Array.from({ length: 24 }).map((_, i) => ({
  time: `${i}:00`,
  temp: 200 + Math.random() * 50 + (i > 15 ? i * 5 : 0),
  rul: 28 - (i > 15 ? (i - 15) * 0.8 : i * 0.1)
}));

export default function MetricsPanel() {
  return (
    <div className="metrics-container">
      <div className="metric-card glass-panel">
        <div className="metric-label">Max Shell Temperature (°C)</div>
        <div className="metric-value" style={{ color: 'var(--status-red)' }}>384°C</div>
        <div style={{ flexGrow: 1, marginTop: '16px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={12} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} domain={['dataMin - 20', 'dataMax + 20']} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="temp" stroke="var(--status-red)" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="metric-card glass-panel">
        <div className="metric-label">Remaining Useful Life (Days)</div>
        <div className="metric-value" style={{ color: 'var(--status-orange)' }}>12.4 Days</div>
        <div style={{ flexGrow: 1, marginTop: '16px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={12} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} domain={[0, 30]} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="rul" stroke="var(--accent-cyan)" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
