import { kilnState } from './kilnRomSurrogate';

/**
 * Obajana Line 4 kiln - THERMAL channel (the shell-scanner estimator)
 * ===================================================================
 * Ported from `kiln_thermal_channel.py`, which is the source of truth.
 *
 * The mechanical channel (kilnRomSurrogate.js) watches ovality. This is the
 * second, physically independent channel: it watches what a shell scanner
 * watches. They meet at the T5 stop trigger, which requires both to agree.
 *
 * PHYSICS
 * -------
 * One-dimensional steady radial conduction through coating, brick and shell,
 * then convection and radiation off the shell:
 *
 *     R       = ln(r_out / r_in) / (2 pi k)      per metre of kiln
 *     R_out   = 1 / (2 pi r_shell h)
 *     q       = (T_face - T_amb) / sum(R)
 *     T_shell = T_amb + q * R_out
 *
 * As the brick wears its resistance falls and the shell gets hotter. That rise
 * is the shell-scanner signal, and it is why a hot spot is a LAGGING indicator:
 * the brick is already thin by the time it appears.
 *
 * CALIBRATION
 * -----------
 * h is back-calculated per zone so the model reproduces the shell temperature
 * used as the FEA sub-model boundary condition at full lining. Three zones land
 * at 31, 34 and 44 W/m2K, which is right for a hot shell. The burning zone lands
 * at 15, below what radiation alone gives, which means the assumed 150 mm
 * coating and 300 C shell are not fully consistent. h is therefore a lumped
 * constant absorbing film, contact resistance and coating irregularity.
 *
 * TREAT THE RISE, NOT THE ABSOLUTE, AS THE OUTPUT.
 *
 * THE COATING BLIND SPOT
 * ----------------------
 * The burning zone's clinker coating (k = 0.74, the most insulating layer)
 * dominates the stack. Shell temperature barely moves as the brick behind it
 * wears: halving the brick raises the shell by only about 33 C while the coating
 * holds. The thermal channel is close to blind there. The mechanical channel is
 * not. That is the argument for running both.
 */

const T_AMB = 40.0;
const R_SHELL_OUT = 2.5;
const R_SHELL_IN = 2.475;
const K_STEEL = 43.0;

export const ZONE_THERMAL = {
    lower_transition: { t_face: 1300.0, k_brick: 2.5,  brick: 0.250, coat: 0.0,   k_coat: 0.74, t_shell_ref: 330.0 },
    burning:          { t_face: 1450.0, k_brick: 5.11, brick: 0.250, coat: 0.150, k_coat: 0.74, t_shell_ref: 300.0 },
    upper_transition: { t_face: 1300.0, k_brick: 3.0,  brick: 0.250, coat: 0.0,   k_coat: 0.74, t_shell_ref: 350.0 },
    calcining:        { t_face: 900.0,  k_brick: 3.0,  brick: 0.200, coat: 0.0,   k_coat: 0.74, t_shell_ref: 250.0 },
};

function rLayer(rIn, rOut, k) {
    if (rOut <= rIn || k <= 0) return 0.0;
    return Math.log(rOut / rIn) / (2.0 * Math.PI * k);
}

function stack(zone, brickMm, coatMm) {
    const z = ZONE_THERMAL[zone];
    const rBrickOut = R_SHELL_IN;
    const rBrickIn = rBrickOut - brickMm / 1000.0;
    const rCoatIn = rBrickIn - coatMm / 1000.0;
    return rLayer(R_SHELL_IN, R_SHELL_OUT, K_STEEL)
         + rLayer(rBrickIn, rBrickOut, z.k_brick)
         + rLayer(rCoatIn, rBrickIn, z.k_coat);
}

function hCalibrated(zone) {
    const z = ZONE_THERMAL[zone];
    const rCond = stack(zone, z.brick * 1000.0, z.coat * 1000.0);
    const q = (z.t_face - z.t_shell_ref) / rCond;
    const rOut = (z.t_shell_ref - T_AMB) / q;
    return 1.0 / (2.0 * Math.PI * R_SHELL_OUT * rOut);
}

export const H_ZONE = Object.fromEntries(
    Object.keys(ZONE_THERMAL).map(z => [z, hCalibrated(z)])
);

export function shellTemperature(zone, brickMm = null, coatMm = null) {
    const z = ZONE_THERMAL[zone];
    let b = brickMm === null ? z.brick * 1000.0 : brickMm;
    let c = coatMm === null ? z.coat * 1000.0 : coatMm;
    b = Math.max(1.0, b);
    c = Math.max(0.0, c);
    const rCond = stack(zone, b, c);
    const rOut = 1.0 / (2.0 * Math.PI * R_SHELL_OUT * H_ZONE[zone]);
    const q = (z.t_face - T_AMB) / (rCond + rOut);
    return T_AMB + q * rOut;
}

// Shell-scanner thresholds. A carbon-steel shell loses strength quickly above
// about 400 C, and the standard plant response is to cool or stop.
export const T_SHELL_WARN = 400.0;
export const T_SHELL_CRIT = 450.0;

export function thermalBand(tShell) {
    if (tShell >= T_SHELL_CRIT) return "red";
    if (tShell >= T_SHELL_WARN) return "amber";
    return "green";
}

export function thermalState(zone, brickMm = null, coatMm = null) {
    const z = ZONE_THERMAL[zone];
    const t = shellTemperature(zone, brickMm, coatMm);
    return {
        zone,
        t_shell_c: t,
        t_shell_ref_c: z.t_shell_ref,
        rise_c: t - z.t_shell_ref,
        band: thermalBand(t),
        coated: (coatMm === null ? z.coat * 1000.0 : coatMm) > 1.0,
    };
}

/**
 * Both channels for the whole kiln at a given lining condition.
 * `wornFraction` is the fraction of the original brick already consumed.
 */
export function thermalKilnState(wornFraction = 0.0, coatingLost = false) {
    const rows = Object.keys(ZONE_THERMAL).map(z => {
        const full = ZONE_THERMAL[z].brick * 1000.0;
        const remaining = full * (1.0 - Math.min(Math.max(wornFraction, 0), 0.95));
        const coat = coatingLost ? 0.0 : null;
        return { ...thermalState(z, remaining, coat), brick_mm: remaining, brick_full_mm: full };
    });
    const worst = rows.reduce((p, c) => (p.t_shell_c > c.t_shell_c ? p : c));
    return {
        zones: rows,
        hottest_zone: worst.zone,
        max_t_shell_c: worst.t_shell_c,
        band: thermalBand(worst.t_shell_c),
    };
}

/**
 * Remaining brick per zone after `day` days at the wear rate the mechanical
 * surrogate predicts for the current clearance. This is what couples the two
 * channels: the mechanical fault sets the wear rate, wear thins the brick, and
 * the thinner brick is what the shell scanner eventually sees.
 */
export function liningAfter(day, clearanceMm) {
  const k = kilnState(clearanceMm);
  const out = {};
  k.zones.forEach(z => {
    const full = ZONE_THERMAL[z.zone].brick * 1000.0;
    out[z.zone] = Math.max(full * 0.05, full - z.wear_mm_day * day);
  });
  return out;
}
