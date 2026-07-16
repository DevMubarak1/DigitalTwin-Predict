import React from 'react';

/**
 * The campaign clock.
 *
 * A fault injector alone shows a snapshot: "at 15 mm clearance the kiln looks
 * like this". That demonstrates a formula, not a prediction. Predictive
 * maintenance is a claim about TIME: the tyre loosens over months, the brick
 * thins at the rate that fault implies, and the system says so before anything
 * is hot. Running the clock is what shows that.
 *
 * Day 0 is a fresh lining. Each tick advances the campaign, brick wears at the
 * rate the mechanical surrogate predicts for the current clearance, and the
 * thermal channel follows the thinning lining. The alert fires on its own.
 */
export default function CampaignClock({ day, setDay, playing, setPlaying, speed, setSpeed,
                                        coatingLost, setCoatingLost, minRul,
                                        tyreWearRate, setTyreWearRate,
                                        manualFault, setManualFault, clearanceMm }) {
  const YEAR = 365;
  const pct = Math.min(100, (day / YEAR) * 100);
  const daysLeft = Math.max(0, Math.round(minRul - day));

  return (
    <div className="metric-card glass-panel" style={{ flex: '1 1 100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                    marginBottom: '4px', flexWrap: 'wrap', gap: '8px' }}>
        <div className="metric-label" style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>
          Campaign Clock
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          Day <strong style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>{day}</strong> of a
          fresh lining &middot; {daysLeft > 0
            ? <>predicted life remaining <strong style={{ color: daysLeft < 60 ? '#d03b3b' : 'var(--text-primary)' }}>{daysLeft} d</strong></>
            : <strong style={{ color: '#d03b3b' }}>lining exhausted</strong>}
        </div>
      </div>

      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
        Press play and leave it alone. The tyre wears and the clearance opens, so the fault injector
        below <strong>moves on its own</strong>. Ovality follows it, the brick thins, the shell warms,
        and the alerts fire without anyone touching a slider. That is the prediction.
        {manualFault && <><br /><span style={{ color: '#fab219' }}>Manual override: you set the
        clearance by hand, so the campaign is not driving it. Press play to hand control back.</span></>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
                    marginBottom: '14px', padding: '10px 12px', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)' }}>
        <label htmlFor="wearrate" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          Tyre wear rate
        </label>
        <input id="wearrate" type="range" min="0" max="40" step="1" value={tyreWearRate}
               onChange={e => { setManualFault(false); setTyreWearRate(Number(e.target.value)); }}
               style={{ flex: 1, minWidth: '140px', accentColor: 'var(--accent-blue, #2a78d6)',
                        cursor: 'pointer' }} />
        <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-primary)',
                       fontWeight: 700, minWidth: '92px', textAlign: 'right' }}>
          {tyreWearRate} mm/year
        </span>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
          &rarr; clearance now <strong style={{ color: 'var(--text-primary)' }}>{clearanceMm} mm</strong>
        </span>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setPlaying(!playing)}
          aria-pressed={playing}
          style={{
            padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700,
            border: '1px solid var(--border-glass)', fontSize: '0.85rem',
            background: playing ? '#d03b3b' : 'var(--accent-blue, #2a78d6)', color: '#fff',
          }}>
          {playing ? 'Pause' : day === 0 ? 'Run campaign' : 'Resume'}
        </button>
        <button
          type="button"
          onClick={() => { setPlaying(false); setDay(0); }}
          style={{
            padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
            border: '1px solid var(--border-glass)', background: 'transparent',
            color: 'var(--text-secondary)', fontSize: '0.85rem',
          }}>
          Reset
        </button>

        <div style={{ display: 'flex', gap: '4px', marginLeft: '4px' }}>
          {[1, 5, 20].map(s => (
            <button key={s} type="button" onClick={() => setSpeed(s)}
              aria-pressed={speed === s}
              style={{
                padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem',
                border: '1px solid var(--border-glass)',
                background: speed === s ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: speed === s ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}>
              {s}x
            </button>
          ))}
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '7px', marginLeft: 'auto',
                        fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <input type="checkbox" checked={coatingLost}
                 onChange={e => setCoatingLost(e.target.checked)}
                 style={{ accentColor: '#d03b3b', width: '15px', height: '15px' }} />
          Burning-zone coating lost
        </label>
      </div>

      <input
        type="range" min="0" max={YEAR} step="1" value={day}
        onChange={e => { setPlaying(false); setDay(Number(e.target.value)); }}
        aria-label="Campaign day"
        style={{ width: '100%', marginTop: '14px', accentColor: 'var(--accent-blue, #2a78d6)', cursor: 'pointer' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem',
                    color: 'var(--text-secondary)' }}>
        <span>Day 0, fresh lining</span>
        <span>{Math.round(pct)} % through a one-year campaign</span>
        <span>Day {YEAR}</span>
      </div>
    </div>
  );
}
