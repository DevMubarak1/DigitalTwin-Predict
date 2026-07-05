import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function MetricsPanel() {
  const [data, setData] = useState(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      time: `${i}:00`,
      temp: 200 + Math.random() * 50 + (i > 15 ? i * 5 : 0),
      rul: 28 - (i > 15 ? (i - 15) * 0.8 : i * 0.1)
    }));
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prevData) => {
        const newData = [...prevData.slice(1)];
        const lastItem = prevData[prevData.length - 1];
        
        let [hours, minutes] = lastItem.time.split(':').map(Number);
        minutes += 15;
        if (minutes >= 60) {
          minutes = 0;
          hours = (hours + 1) % 24;
        }
        const timeStr = `${hours}:${minutes.toString().padStart(2, '0')}`;
        
        newData.push({
          time: timeStr,
          temp: 200 + Math.random() * 50 + (hours > 15 ? hours * 5 : 0),
          rul: Math.max(0, lastItem.rul - 0.05 - Math.random() * 0.05)
        });
        
        return newData;
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const latestTemp = data[data.length - 1].temp.toFixed(1);
  const latestRul = data[data.length - 1].rul.toFixed(1);

  return (
    <div className="metrics-container">
      <div className="metric-card glass-panel">
        <div className="metric-label">Max Shell Temperature (°C)</div>
        <div className="metric-value" style={{ color: 'var(--status-red)' }}>{latestTemp}°C</div>
        <div style={{ flexGrow: 1, marginTop: '16px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={12} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} domain={['dataMin - 20', 'dataMax + 20']} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="temp" stroke="var(--status-red)" strokeWidth={3} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="metric-card glass-panel">
        <div className="metric-label">Remaining Useful Life (Days)</div>
        <div className="metric-value" style={{ color: 'var(--status-orange)' }}>{latestRul} Days</div>
        <div style={{ flexGrow: 1, marginTop: '16px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={12} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} domain={[0, 30]} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="rul" stroke="var(--accent-cyan)" strokeWidth={3} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
