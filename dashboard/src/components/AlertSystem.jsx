import React from 'react';
import { ShieldAlert, Info, Thermometer, Activity, Clock } from 'lucide-react';
import { thermalState, T_SHELL_WARN, T_SHELL_CRIT, ZONE_THERMAL, liningAfter } from '../utils/kilnThermalChannel';
const OMEGA_ALLOW = 0.5;
const U_AMBER = 1.0;
const U_RED = 2.5;   // rounded down from the computed 2.56 at which the governing
                     // zone reaches crushing, so the alarm leads the event

const NICE = z => (z || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

/**
 * Active alerts.
 *
 * This used to watch a single number, remaining useful life against a fixed
 * threshold. At a healthy clearance that number never moved, so the panel never
 * said anything: it was a permanent "System Healthy" card.
 *
 * It now watches the campaign. As the tyre wears the clearance opens, ovality
 * rises, the lining thins and the shell warms. Each crossing raises its own
 * alert under the trigger that owns it.
 */
export default function AlertSystem({ kData, alertThreshold, clearanceMm, campaignDay = 0,
                                      coatingLost = false }) {
  const { min_rul_days, governing_zone, zones } = kData || {};
  const gov = zones?.find(z => z.zone === governing_zone);
  const U = gov ? gov.omega_pct / OMEGA_ALLOW : 0;

  // life left is what the surrogate predicts, minus what the campaign has spent
  const lifeLeft = Math.round((min_rul_days ?? 0) - campaignDay);

  const lining = liningAfter(campaignDay, clearanceMm);
  const therm = Object.keys(ZONE_THERMAL).map(z =>
    thermalState(z, lining[z], coatingLost ? 0 : null));
  const hottest = therm.reduce((p, c) => (p.t_shell_c > c.t_shell_c ? p : c));

  const alerts = [];

  // T5. Two independent channels agreeing is evidence; either alone is a hypothesis.
  if (U >= U_RED && hottest.t_shell_c >= T_SHELL_WARN) {
    alerts.push({
      key: 't5', tone: 'red', icon: <ShieldAlert size={16} />, title: 'T5 — Stop',
      time: `Day ${campaignDay}`,
      body: <>Both channels agree. Ovality is <strong>{U.toFixed(2)}x</strong> allowable and the
             shell reads <strong>{Math.round(hottest.t_shell_c)} &deg;C</strong> in the{' '}
             {NICE(hottest.zone)}. Two independent measurements say the same thing. Controlled
             shutdown.</>,
    });
  }

  if (lifeLeft < alertThreshold) {
    alerts.push({
      key: 'rul', tone: lifeLeft <= 0 ? 'red' : 'amber', icon: <Clock size={16} />,
      title: lifeLeft <= 0 ? 'Lining exhausted' : 'T4 — Escalate',
      time: `Day ${campaignDay}`,
      body: <>{NICE(governing_zone)} has <strong>{Math.max(0, lifeLeft)} days</strong> left, below
             the {alertThreshold}-day threshold.<br />
             <strong>Root cause:</strong> tyre clearance {clearanceMm} mm (Ansys contact offset{' '}
             {Math.round((90 - clearanceMm) * 10) / 10} mm).</>,
    });
  }

  if (U >= U_RED) {
    alerts.push({
      key: 'mech', tone: 'red', icon: <Activity size={16} />,
      title: 'Mechanical — brick at crushing strength',
      time: `Day ${campaignDay}`,
      body: <>Ovality {gov.omega_pct.toFixed(2)} % is <strong>{U.toFixed(2)}x</strong> allowable,
             past the 2.5x threshold at which the {NICE(governing_zone)} brick reaches its crushing
             strength. Every further day of running consumes lining.</>,
    });
  } else if (U >= U_AMBER) {
    alerts.push({
      key: 'mech', tone: 'amber', icon: <Activity size={16} />,
      title: 'T2 — Ovality over allowable',
      time: `Day ${campaignDay}`,
      body: <>Ovality {gov.omega_pct.toFixed(2)} % is {U.toFixed(2)}x allowable. Wear now
             accelerates as the square of that ratio. Confirm with a second measurement and inspect
             the tyre, filler bars and pads.</>,
    });
  }

  if (hottest.t_shell_c >= T_SHELL_WARN) {
    alerts.push({
      key: 'therm', tone: hottest.t_shell_c >= T_SHELL_CRIT ? 'red' : 'amber',
      icon: <Thermometer size={16} />,
      title: `Thermal — shell ${Math.round(hottest.t_shell_c)} °C`,
      time: `Day ${campaignDay}`,
      body: <>{NICE(hottest.zone)} shell is {Math.round(hottest.rise_c)} &deg;C above its healthy
             baseline. A carbon-steel shell loses strength quickly past 400 &deg;C.
             {!coatingLost && <> The burning zone stays cool while its coating holds, so this
             channel is blind there.</>}</>,
    });
  }

  if (!alerts.length) {
    alerts.push({
      key: 'ok', tone: 'green', icon: <Info size={16} />, title: 'System Healthy',
      time: campaignDay > 0 ? `Day ${campaignDay}` : 'Live',
      body: <>Both channels inside limits. Ovality {gov ? gov.omega_pct.toFixed(2) : '0.00'} %
             ({U.toFixed(2)}x allowable), hottest shell {Math.round(hottest.t_shell_c)} &deg;C.
             Predicted life remaining {lifeLeft} days.</>,
    });
  }

  const TONE = {
    red:   { c: 'var(--status-red)',   bg: 'rgba(239, 68, 68, 0.06)' },
    amber: { c: '#fab219',             bg: 'rgba(250, 178, 25, 0.06)' },
    green: { c: 'var(--status-green)', bg: 'rgba(16, 185, 129, 0.05)' },
  };

  return (
    <div className="alert-sidebar glass-panel">
      <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        Active Alerts
        {alerts.length > 1 && (
          <span style={{ fontSize: '0.7rem', fontWeight: 700, background: 'var(--status-red)',
                         color: '#fff', borderRadius: '999px', padding: '2px 8px' }}>
            {alerts.length}
          </span>
        )}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px',
                    overflowY: 'auto', minHeight: 0 }}>
        {alerts.map(a => (
          <div key={a.key} className="alert-card"
               style={{ borderLeftColor: TONE[a.tone].c, background: TONE[a.tone].bg }}>
            <div className="alert-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px',
                             color: TONE[a.tone].c, fontWeight: 700 }}>
                {a.icon} {a.title}
              </span>
              <span className="alert-time">{a.time}</span>
            </div>
            <div className="alert-desc">{a.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
