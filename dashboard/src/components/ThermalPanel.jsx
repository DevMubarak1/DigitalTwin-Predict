import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Legend } from 'recharts';
import { thermalState, T_SHELL_WARN, T_SHELL_CRIT, ZONE_THERMAL, liningAfter } from '../utils/kilnThermalChannel';

const LABEL = {
  lower_transition: 'Lower Transition',
  burning: 'Burning',
  upper_transition: 'Upper Transition',
  calcining: 'Calcining',
};
const BAND_COLOR = { green: 'var(--status-green, #0ca30c)', amber: '#fab219', red: '#d03b3b' };
const BAND_TEXT = { green: 'Normal', amber: 'Hot', red: 'Critical' };
const BAND_ICON = { green: '●', amber: '▲', red: '■' };



export default function ThermalPanel({ campaignDay, clearanceMm, coatingLost }) {
  const lining = liningAfter(campaignDay, clearanceMm);

  const rows = Object.keys(ZONE_THERMAL).map(z => {
    const t = thermalState(z, lining[z], coatingLost ? 0 : null);
    const full = ZONE_THERMAL[z].brick * 1000.0;
    return { ...t, brick_mm: lining[z], brick_full_mm: full,
             worn_pct: (1 - lining[z] / full) * 100 };
  });
  const hottest = rows.reduce((p, c) => (p.t_shell_c > c.t_shell_c ? p : c));

  // history for the trend chart, so the reviewer sees the rise rather than a number
  const history = [];
  for (let d = 0; d <= Math.max(campaignDay, 360); d += 15) {
    const lin = liningAfter(d, clearanceMm);
    const pt = { day: d };
    Object.keys(ZONE_THERMAL).forEach(z => {
      pt[z] = Math.round(thermalState(z, lin[z], coatingLost ? 0 : null).t_shell_c);
    });
    history.push(pt);
  }

  const burning = rows.find(r => r.zone === 'burning');

  return (
    <div className="metric-card glass-panel" style={{ flex: '1 1 100%', marginTop: '24px' }}>
      <div className="metric-label" style={{ marginBottom: '4px', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
        Thermal Channel: Shell Scanner Estimator
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
        Independent of the mechanical channel. Predicts shell temperature from remaining lining by
        1-D radial conduction. A rise here is a <strong>lagging</strong> indicator: the brick is
        already thin by the time it shows.
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {rows.map(r => (
          <div key={r.zone} style={{
            flex: '1 1 calc(25% - 12px)', minWidth: '150px', padding: '12px',
            background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
            borderLeft: `3px solid ${BAND_COLOR[r.band]}`,
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{LABEL[r.zone]}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: BAND_COLOR[r.band], lineHeight: 1.2 }}>
              {Math.round(r.t_shell_c)}<span style={{ fontSize: '0.9rem' }}> &deg;C</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              {BAND_ICON[r.band]} {BAND_TEXT[r.band]}
              {r.rise_c > 1 && <> &middot; +{Math.round(r.rise_c)} &deg;C</>}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              brick {Math.round(r.brick_mm)} / {Math.round(r.brick_full_mm)} mm
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: '220px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={11}
                   label={{ value: 'Campaign day', position: 'insideBottom', offset: -4, fill: 'var(--text-secondary)', fontSize: 11 }} />
            <YAxis stroke="var(--text-secondary)" fontSize={11} domain={[200, 700]}
                   label={{ value: 'Shell temp (°C)', angle: -90, position: 'insideLeft', fill: 'var(--text-secondary)', fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '8px' }} />
            <Legend wrapperStyle={{ fontSize: '0.72rem' }} />
            <ReferenceLine y={T_SHELL_WARN} stroke="#fab219" strokeDasharray="5 4"
                           label={{ value: 'Scanner warning 400 °C', fill: '#fab219', fontSize: 10, position: 'insideTopRight' }} />
            <ReferenceLine y={T_SHELL_CRIT} stroke="#d03b3b" strokeDasharray="5 4"
                           label={{ value: 'Critical 450 °C', fill: '#d03b3b', fontSize: 10, position: 'insideTopRight' }} />
            <ReferenceLine x={campaignDay} stroke="var(--text-secondary)" strokeDasharray="2 3" />
            <Line type="monotone" dataKey="upper_transition" name="Upper Transition" stroke="#2a78d6" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="lower_transition" name="Lower Transition" stroke="#1baf7a" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="calcining" name="Calcining" stroke="#eda100" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="burning" name="Burning (coated)" stroke="#e87ba4" dot={false} strokeWidth={2} strokeDasharray="6 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {!coatingLost && burning && (
        <div style={{
          marginTop: '16px', padding: '12px 14px', borderRadius: '10px',
          background: 'rgba(232,123,164,0.08)', border: '1px solid rgba(232,123,164,0.35)',
          fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5,
        }}>
          <strong style={{ color: '#e87ba4' }}>The coating blind spot.</strong> The burning zone is the
          dashed line, and it barely moves. Its 150 mm clinker coating (k = 0.74, the most insulating
          layer in the stack) hides the brick behind it: at {Math.round(burning.worn_pct)} % worn the
          shell there reads {Math.round(burning.t_shell_c)} &deg;C, a rise of only{' '}
          {Math.round(burning.rise_c)} &deg;C. A scanner would call that zone healthy. The mechanical
          channel does not share this blind spot, which is why both channels run.
        </div>
      )}
      {coatingLost && (
        <div style={{
          marginTop: '16px', padding: '12px 14px', borderRadius: '10px',
          background: 'rgba(208,59,59,0.10)', border: '1px solid rgba(208,59,59,0.4)',
          fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5,
        }}>
          <strong style={{ color: '#d03b3b' }}>Coating lost.</strong> With the clinker coating gone the
          burning zone jumps to {Math.round(burning.t_shell_c)} &deg;C. The brick has not changed. The
          only thing that changed is whether the thermal channel can see it.
        </div>
      )}

      <div style={{ marginTop: '12px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
        Hottest zone: {LABEL[hottest.zone]} at {Math.round(hottest.t_shell_c)} &deg;C. Film coefficient
        is calibrated per zone against the FEA sub-model boundary condition, so treat the rise as the
        output rather than the absolute value.
      </div>
    </div>
  );
}
