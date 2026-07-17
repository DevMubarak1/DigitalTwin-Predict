import React from 'react';

/**
 * A compact, horizontal control bar for the 3D Viewer page.
 * Shows the campaign timeline, play/pause, fault injector slider moving in
 * real-time, and key live stats — all in a thin strip that doesn't block the
 * 3D view.
 */
export default function CampaignBar({
  day, setDay, playing, setPlaying, speed, setSpeed,
  coatingLost, setCoatingLost, tyreWearRate, setTyreWearRate,
  manualFault, setManualFault, clearanceMm, setClearanceMm,
  minRul, maxShellTemp, thermalBand,
}) {
  const YEAR = 365;
  const daysLeft = Math.max(0, Math.round(minRul - day));
  const bandColors = { green: '#10b981', amber: '#f59e0b', red: '#ef4444' };
  const bandColor = bandColors[thermalBand] || '#10b981';

  return (
    <div className="campaign-bar glass-panel">
      {/* ─── Row 1: Play controls + timeline slider ─── */}
      <div className="cb-row">
        <button
          type="button"
          onClick={() => setPlaying(!playing)}
          className="cb-play-btn"
          style={{ background: playing ? '#d03b3b' : 'var(--accent-blue, #3A6EA5)' }}
        >
          {playing ? '⏸' : '▶'}
        </button>
        <button type="button" onClick={() => { setPlaying(false); setDay(0); }} className="cb-reset-btn">
          ↺
        </button>

        <input type="range" min="0" max={YEAR} step="1" value={day}
          onChange={e => { setPlaying(false); setDay(Number(e.target.value)); }}
          aria-label="Campaign day"
          className="cb-timeline"
        />

        <span className="cb-day-label">
          Day <strong>{day}</strong>
        </span>

        <div className="cb-speed-group">
          {[1, 5, 20].map(s => (
            <button key={s} type="button" onClick={() => setSpeed(s)}
              className={`cb-speed-btn ${speed === s ? 'active' : ''}`}>
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* ─── Row 2: Live stats + fault injector + wear rate ─── */}
      <div className="cb-row cb-row-stats">
        {/* Live stats chips */}
        <div className="cb-chips">
          <div className="cb-chip">
            <span className="cb-chip-label">Clearance</span>
            <span className="cb-chip-value">{clearanceMm} mm</span>
          </div>
          <div className="cb-chip">
            <span className="cb-chip-label">Shell</span>
            <span className="cb-chip-value" style={{ color: bandColor }}>{Math.round(maxShellTemp)}°C</span>
          </div>
          <div className="cb-chip">
            <span className="cb-chip-label">RUL</span>
            <span className="cb-chip-value" style={{ color: daysLeft < 60 ? '#ef4444' : undefined }}>
              {daysLeft > 0 ? `${daysLeft}d` : '—'}
            </span>
          </div>
          <div className="cb-chip">
            <span className="cb-chip-label">Health</span>
            <span className="cb-chip-value" style={{ color: bandColor, fontWeight: 700 }}>
              {thermalBand.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Wear rate slider */}
        <div className="cb-slider-group">
          <span className="cb-slider-label">Wear</span>
          <input type="range" min="0" max="40" step="1" value={tyreWearRate}
            onChange={e => { setManualFault(false); setTyreWearRate(Number(e.target.value)); }}
            className="cb-slider" />
          <span className="cb-slider-val">{tyreWearRate} mm/yr</span>
        </div>

        {/* Fault injector */}
        <div className="cb-slider-group">
          <span className="cb-slider-label">Fault</span>
          <input type="range" min="0" max="30" step="1" value={clearanceMm}
            onChange={e => setClearanceMm && setClearanceMm(Number(e.target.value))}
            className="cb-slider" />
          <span className="cb-slider-val">{clearanceMm} mm</span>
        </div>

        {/* Coating toggle */}
        <label className="cb-coating">
          <input type="checkbox" checked={coatingLost}
            onChange={e => setCoatingLost(e.target.checked)} />
          <span>Coating lost</span>
        </label>

        {manualFault && (
          <span className="cb-manual-badge">Manual</span>
        )}
      </div>
    </div>
  );
}
