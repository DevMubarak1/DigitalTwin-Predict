/**
 * Obajana Line 4 Kiln — Physics-based ROM surrogate + wear/RUL chain
 * ===================================================================
 * Maps a mechanical fault -> shell ovality (per tyre) -> per-zone wear rate -> RUL.
 * 
 * Ported from the pure Python implementation `kiln_rom_surrogate.py`, which is
 * the source of truth. If the FEA is re-run, update BOTH.
 *
 * Coefficients verified against kiln_rom_surrogate.py on 16 Jul 2026.
 *   kilnState(0)  -> burning,          499 d
 *   kilnState(15) -> upper_transition, 202 d
 */

// 1. OVALITY SURROGATE (REAL — fitted to FEA design points)
const _B = 27.3;
const OVALITY_FIT = {
    // station : [Omega0 [%], A [%]]
    1: [0.070, 4.315],
    2: [0.086, 4.580],   // anchored on all three measured points
    3: [0.055, 3.934],
};

const OMEGA_ALLOW = 0.5;   // % — allowable ovality, D_inside/10 rule

export const CAD_GAP_MM = 90.0;

export function clearanceFromAnsysOffset(offset_mm) {
    /** Ansys contact offset [mm] -> physical radial clearance [mm].
     *  The offset CLOSES the 90 mm CAD gap; what remains is the clearance.
     *  offset 75 -> clearance 15.  Adjust-to-Touch (offset 90) -> clearance 0. */
    return Math.max(0.0, CAD_GAP_MM - offset_mm);
}

export function ovalityFromClearance(clearance_mm, station = 2) {
    /** Shell ovality Omega [%] at a tyre, for a given radial tyre clearance [mm]. */
    const [o0, A] = OVALITY_FIT[station];
    const g = Math.max(0.0, clearance_mm);
    return o0 + A * g / (_B + g);
}

// 2. WEAR MULTIPLIER + RUL (structure REAL, coefficients PLACEHOLDER)
const ZONES = {
    // zone : [nearest_station, thickness_mm, w0_mm_per_day, k, n]
    "lower_transition": [1, 250, 0.35, 0.15, 2.0],  // mag-chrome, 1.0-9.4 m
    "burning":          [1, 250, 0.50, 0.11, 2.0],  // mag-spinel, 9.4-24.6 m
    "upper_transition": [2, 250, 0.45, 0.15, 2.0],  // 24.6-33.2 m
    "calcining":        [2, 200, 0.25, 0.11, 2.0],  // hi-alumina+SiC, 33.2-60.2 m
};

export function wearRate(omega_pct, w0, k, n) {
    /** Coupled thermo-mechanical wear rate [mm/day]. */
    return w0 * (1.0 + k * Math.pow(omega_pct / OMEGA_ALLOW, n));
}

export function zoneState(zone, clearance_mm) {
    /** Full chain for one zone at a given tyre clearance (the fault input). */
    const [station, thick, w0, k, n] = ZONES[zone];
    const omega = ovalityFromClearance(clearance_mm, station);
    const w = wearRate(omega, w0, k, n);
    const rul = thick / w; // days
    return {
        zone,
        station,
        omega_pct: omega,
        wear_mm_day: w,
        rul_days: rul
    };
}

export function kilnState(clearance_mm) {
    /** Whole-kiln snapshot for a fault level (tyre clearance). Dashboard entry point A. */
    const rows = Object.keys(ZONES).map(z => zoneState(z, clearance_mm));
    const worst = rows.reduce((prev, curr) => prev.rul_days < curr.rul_days ? prev : curr);
    
    return {
        input: "clearance_mm",
        value: clearance_mm,
        zones: rows,
        governing_zone: worst.zone,
        min_rul_days: worst.rul_days
    };
}

export function zoneStateFromOvality(zone, omega_pct) {
    const [station, thick, w0, k, n] = ZONES[zone];
    const w = wearRate(omega_pct, w0, k, n);
    return {
        zone,
        station,
        omega_pct: omega_pct,
        wear_mm_day: w,
        rul_days: thick / w
    };
}

export function kilnStateFromOvality(omega_pct) {
    /** Whole-kiln snapshot given ovality directly. Dashboard entry point B. */
    const rows = Object.keys(ZONES).map(z => zoneStateFromOvality(z, omega_pct));
    const worst = rows.reduce((prev, curr) => prev.rul_days < curr.rul_days ? prev : curr);
    
    return {
        input: "ovality_pct",
        value: omega_pct,
        zones: rows,
        governing_zone: worst.zone,
        min_rul_days: worst.rul_days
    };
}
