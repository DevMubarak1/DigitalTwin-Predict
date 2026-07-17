import React from 'react';
import { thermalState, T_SHELL_WARN, ZONE_THERMAL, liningAfter } from '../utils/kilnThermalChannel';

const OMEGA_ALLOW = 0.5;
const U_RED = 2.5;   // rounded DOWN from the computed 2.56 at which the governing
                     // zone reaches crushing, so the alarm fires before, not after
const LABEL = {
  lower_transition: 'Lower Transition', burning: 'Burning',
  upper_transition: 'Upper Transition', calcining: 'Calcining',
};

/**
 * The two-channel verdict.
 *
 * The mechanical channel (ovality) and the thermal channel (shell scanner) are
 * physically independent measurements of the same lining. Agreement between two
 * independent channels is evidence. Either one alone is a hypothesis. This is
 * why T5, the stop trigger, requires both, and why the channels are shown side
 * by side rather than blended into one score.
 */
export default function TwoChannelVerdict({ kData, campaignDay, clearanceMm, coatingLost }) {
  const gov = kData.zones.find(z => z.zone === kData.governing_zone);
  const U = gov.omega_pct / OMEGA_ALLOW;
  const mechAlarm = U >= U_RED;

  const lining = liningAfter(campaignDay, clearanceMm);
  const thermRows = Object.keys(ZONE_THERMAL).map(z =>
    thermalState(z, lining[z], coatingLost ? 0 : null));
  const hottest = thermRows.reduce((p, c) => (p.t_shell_c > c.t_shell_c ? p : c));
  const thermAlarm = hottest.t_shell_c >= T_SHELL_WARN;

  let trigger, name, colour, verdict;
  if (mechAlarm && thermAlarm) {
    trigger = 'T5'; name = 'Stop'; colour = '#d03b3b';
    verdict = 'Both channels agree the lining is compromised. Two independent measurements say the '
            + 'same thing, which is evidence rather than a hypothesis. Controlled shutdown.';
  } else if (mechAlarm) {
    trigger = 'T4'; name = 'Escalate'; colour = '#fab219';
    verdict = 'The mechanical channel is past the crushing threshold but the shell is still cool. '
            + 'This is the early warning: ovality leads the temperature by months, and the scanner '
            + 'has not caught up yet. Bring the planned stop forward.';
  } else if (thermAlarm) {
    trigger = 'T4'; name = 'Escalate'; colour = '#fab219';
    verdict = 'The shell is hot but ovality is inside limits, so the cause is probably not '
            + 'mechanical. Look for chemical attack, coating loss or thermal shock. This is the '
            + 'mechanical channel’s blind spot, and it is why the thermal channel runs too.';
  } else {
    trigger = 'T1'; name = 'Monitor'; colour = '#0ca30c';
    verdict = 'Both channels are inside limits. Log ovality at the next planned stop and trend it.';
  }

  const Channel = ({ title, alarm, value, unit, detail, note }) => (
    <div style={{
      flex: '1 1 300px', padding: '14px',
      borderRadius: '10px', background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${alarm ? 'rgba(208,59,59,0.45)' : 'rgba(255,255,255,0.10)'}`,
    }}>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase',
                    letterSpacing: '0.06em', fontWeight: 700 }}>{title}</div>
      <div style={{ fontSize: '1.7rem', fontWeight: 700, lineHeight: 1.25,
                    color: alarm ? '#d03b3b' : 'var(--text-primary)' }}>
        {value}<span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}> {unit}</span>
      </div>
      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{detail}</div>
      <div style={{ fontSize: '0.72rem', marginTop: '6px',
                    color: alarm ? '#d03b3b' : '#0ca30c', fontWeight: 700 }}>
        {alarm ? '■ Alarm' : '● Within limits'}
      </div>
      {note && <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '6px' }}>{note}</div>}
    </div>
  );

  return (
    <div className="metric-card glass-panel" style={{ flex: '1 1 100%', marginTop: '24px',
         borderLeft: `4px solid ${colour}` }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
        <span style={{ background: colour, color: '#fff', borderRadius: '999px', padding: '3px 12px',
                       fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em' }}>
          {trigger} &mdash; {name.toUpperCase()}
        </span>
        <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Governing zone: {LABEL[kData.governing_zone]}
        </span>
      </div>

      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '10px 0 16px',
                    lineHeight: 1.55 }}>
        {verdict}
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <Channel
          title="Mechanical channel &middot; ovality"
          alarm={mechAlarm}
          value={gov.omega_pct.toFixed(2)} unit="%"
          detail={`${U.toFixed(2)}x allowable · crushing at 2.5x`}
          note={`Root cause: tyre clearance ${clearanceMm} mm (Ansys contact offset ${90 - clearanceMm} mm)`}
        />
        <Channel
          title="Thermal channel &middot; shell scanner"
          alarm={thermAlarm}
          value={Math.round(hottest.t_shell_c)} unit="&deg;C"
          detail={`${LABEL[hottest.zone]} · warning at ${T_SHELL_WARN} °C`}
          note={coatingLost
            ? 'Burning-zone coating lost, so the thermal channel can see that zone again.'
            : 'Burning zone is masked by its clinker coating. See the thermal panel below.'}
        />
      </div>
    </div>
  );
}
