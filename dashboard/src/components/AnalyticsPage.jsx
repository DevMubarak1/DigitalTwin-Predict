import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const historicalData = Array.from({ length: 7 }).map((_, i) => ({
  day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
  efficiency: 80 + Math.random() * 15,
  output: 400 + Math.random() * 100,
}));

export default function AnalyticsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{ flex: '1 1 300px', padding: '24px' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '8px' }}>Weekly Efficiency (%)</h3>
          <div className="metric-value" style={{ color: 'var(--signal)', marginBottom: '16px' }}>87.4%</div>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} domain={[60, 100]} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-glass)' }} />
                <Area type="monotone" dataKey="efficiency" stroke="var(--signal)" fill="var(--signal)" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-panel" style={{ flex: '1 1 300px', padding: '24px' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '8px' }}>Production Output (Tons)</h3>
          <div className="metric-value" style={{ color: 'var(--heat-low)', marginBottom: '16px' }}>3,240 t</div>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-glass)' }} />
                <Bar dataKey="output" fill="var(--heat-low)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="glass-panel" style={{ flex: 1, padding: '24px' }}>
        <h3>Key Performance Indicators</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Advanced predictive analytics and historical reporting modules are active.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '24px' }}>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Energy Consumption</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--heat-mid)', marginTop: '4px' }}>4.2 GJ/t</div>
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Emissions (CO2)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--status-green)', marginTop: '4px' }}>-12% (MoM)</div>
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Uptime</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--heat-low)', marginTop: '4px' }}>98.5%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
