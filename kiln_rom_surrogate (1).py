"""
Obajana Line 4 Kiln — Physics-based ROM surrogate + wear/RUL chain
===================================================================
Maps a mechanical fault -> shell ovality (per tyre) -> per-zone wear rate -> RUL.

This is the real-time surrogate the dashboard fault-injector calls. It replaces
a live FEA solve with a curve fitted to FEA design points, exactly as an Ansys
Twin Builder static ROM would — same idea, transparent implementation.

WHAT IS REAL vs PLACEHOLDER
---------------------------
  REAL (from the solved global shell FEA, 15 Jul 2026):
    - ovality-vs-tyre-clearance at all three tyres  -> OVALITY_FIT below
    - the modal check proving static is valid (DAF 1.0008), so these Omega
      values are the full response, no dynamic correction.
  PLACEHOLDER — must be confirmed/calibrated before any absolute RUL is quoted:
    - w0_z  baseline wear rates      (literature campaign lives — CONFIRM)
    - k_z, n coupling coefficients   (from the thermal sub-models — NOT YET RUN)
    - lining thicknesses             (from the Line 4 lining schedule — CONFIRM)
  Per the plan (S2C, S5): until k_z is calibrated, treat RUL as a RELATIVE trend
  indicator ("zone A degrading 3x faster than B"), not an absolute countdown.
"""

import math

# ---------------------------------------------------------------------------
# 1. OVALITY SURROGATE  (REAL — fitted to FEA design points)
# ---------------------------------------------------------------------------
# FEA design points, ovality Omega [%] vs tyre radial clearance [mm]:
#     clearance:     0 mm     15 mm     90 mm
#   station 1:      0.070     1.60      (–)
#   station 2:      0.086     1.71      3.60      <- governing (middle, most loaded)
#   station 3:      0.055     1.45      (–)
# Saturating fit  Omega(g) = Omega0 + A * g / (B + g)   [%], g in mm.
# B shared (=27.3, fixed by the station-2 0/15/90 points); Omega0 and A per station.

_B = 27.3
OVALITY_FIT = {
    #   station : (Omega0 [%], A [%])
    1: (0.070, 4.315),
    2: (0.086, 4.580),   # anchored on all three measured points
    3: (0.055, 3.934),
}

OMEGA_ALLOW = 0.5   # % — allowable ovality, D_inside/10 rule (Gebhart); 5 m kiln cap

def ovality_from_clearance(clearance_mm, station=2):
    """Shell ovality Omega [%] at a tyre, for a given radial tyre clearance [mm].
    clearance 0 = snug/hot operating; larger = worn/loose tyre (the fault)."""
    o0, A = OVALITY_FIT[station]
    g = max(0.0, clearance_mm)
    return o0 + A * g / (_B + g)

# ---------------------------------------------------------------------------
# 2. WEAR MULTIPLIER + RUL  (structure REAL, coefficients PLACEHOLDER)
# ---------------------------------------------------------------------------
#     w_z = w0_z * [ 1 + k_z * (Omega / Omega_allow) ** n ]      (plan S2C)
#     RUL_z = remaining_thickness_z / w_z        [days]
#
# Each lining zone is driven by the ovality of its NEAREST tyre.
# Zone spans (m) from the Line 4 lining schedule; tyres at 8 / 36 / 64 m.

ZONES = {
    # zone            : (nearest_station, thickness_mm, w0_mm_per_day, k, n)
    "lower_transition": (1, 250, 0.35, 0.14, 2.0),  # mag-chrome,  1.0-9.4 m
    "burning":          (1, 250, 0.50, 0.11, 2.0),  # mag-spinel,  9.4-24.6 m  (coated)
    "upper_transition": (2, 250, 0.45, 0.15, 2.0),  # 24.6-33.2 m
    "calcining":        (2, 200, 0.25, 0.11, 2.0),  # hi-alumina+SiC, 33.2-60.2 m
}
# ^ k_z, n are now FEA-DERIVED (2-D thermo-mechanical sub-models, cold sigma_crush):
#   k_z = (0.5*c_z/sigma_crush)^2, n=2, where c_z = brick crushing stress per % ovality.
#   Against HOT strength k_z rises ~2-4x. w0_z and thicknesses remain literature values
#   to confirm; calibrate all against plant history before quoting absolute RUL.

def wear_rate(omega_pct, w0, k, n):
    """Coupled thermo-mechanical wear rate [mm/day]."""
    return w0 * (1.0 + k * (omega_pct / OMEGA_ALLOW) ** n)

def zone_state(zone, clearance_mm):
    """Full chain for one zone at a given tyre clearance (the fault input)."""
    station, thick, w0, k, n = ZONES[zone]
    omega = ovality_from_clearance(clearance_mm, station)
    w = wear_rate(omega, w0, k, n)
    rul = thick / w                      # days (fresh lining; subtract used thickness in service)
    return {"zone": zone, "station": station, "omega_pct": omega,
            "wear_mm_day": w, "rul_days": rul}

def kiln_state(clearance_mm):
    """Whole-kiln snapshot for a fault level (tyre clearance). Dashboard entry point A."""
    rows = [zone_state(z, clearance_mm) for z in ZONES]
    worst = min(rows, key=lambda r: r["rul_days"])
    return {"input": "clearance_mm", "value": clearance_mm, "zones": rows,
            "governing_zone": worst["zone"], "min_rul_days": worst["rul_days"]}

# --- Entry point B: dashboard drives OVALITY directly (an ovality slider) ---
def zone_state_from_ovality(zone, omega_pct):
    station, thick, w0, k, n = ZONES[zone]
    w = wear_rate(omega_pct, w0, k, n)
    return {"zone": zone, "station": station, "omega_pct": omega_pct,
            "wear_mm_day": w, "rul_days": thick / w}

def kiln_state_from_ovality(omega_pct):
    """Whole-kiln snapshot given ovality directly. Same ovality applied to every
    zone; each responds per its own FEA-derived k_z, n, so the zone that 'absorbs'
    the stress (highest k_z) governs. Dashboard entry point B."""
    rows = [zone_state_from_ovality(z, omega_pct) for z in ZONES]
    worst = min(rows, key=lambda r: r["rul_days"])
    return {"input": "ovality_pct", "value": omega_pct, "zones": rows,
            "governing_zone": worst["zone"], "min_rul_days": worst["rul_days"]}

# ---------------------------------------------------------------------------
# 3. DEMO
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    print("Omega surrogate (station 2, governing):")
    for g in (0, 5, 10, 15, 30, 60, 90):
        print(f"   clearance {g:3d} mm  ->  Omega = {ovality_from_clearance(g,2):.3f} %"
              f"   ({ovality_from_clearance(g,2)/OMEGA_ALLOW:.2f} x allowable)")

    print("\nWhole-kiln RUL vs fault level (PLACEHOLDER coefficients - relative trend only):")
    hdr = f"{'clearance':>9} | " + " | ".join(f"{z[:9]:>9}" for z in ZONES) + " || governing"
    print(hdr); print("-"*len(hdr))
    for g in (0, 5, 10, 15, 30):
        s = kiln_state(g)
        ruls = {r["zone"]: r["rul_days"] for r in s["zones"]}
        line = f"{g:6d} mm | " + " | ".join(f"{ruls[z]:9.0f}" for z in ZONES)
        line += f" || {s['governing_zone']} ({s['min_rul_days']:.0f} d)"
        print(line)
    print("\n(RUL in days. Numbers are RELATIVE until k_z, n, w0_z are calibrated.)")
