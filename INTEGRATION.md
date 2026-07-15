# `kiln_rom_surrogate.py` — Dashboard Integration Guide

**For:** Mubarak (dashboard / software)
**From:** Olawale (FEA)
**What this is:** the physics engine for the **Global Mechanical Fault-Injector** path
(plan §3C). It maps a mechanical fault → shell ovality → per-zone brick wear rate →
Remaining Useful Life. Pure Python, **no dependencies** — just import it.

> This is **not** the thermal generator/estimator (§3A). That's your separate sensor-sim path.
> The two are independent evidence streams that meet in the dashboard; keep them visibly
> separate in the UI.

---

## 1. Quick start

```python
from kiln_rom_surrogate import kiln_state, kiln_state_from_ovality

state = kiln_state(15)              # fault = tyre clearance in mm
# or
state = kiln_state_from_ovality(1.5)   # fault = ovality in %
```

Both return the **same shape**:

```python
{
  "input": "clearance_mm",          # or "ovality_pct"
  "value": 15,
  "governing_zone": "upper_transition",
  "min_rul_days": 202,
  "zones": [
    {"zone": "lower_transition", "station": 1, "omega_pct": 1.60,
     "wear_mm_day": 0.00085, "rul_days": 293},
    {"zone": "burning",          "station": 1, "omega_pct": 1.60, ...},
    {"zone": "upper_transition", "station": 2, "omega_pct": 1.71, ...},
    {"zone": "calcining",        "station": 2, "omega_pct": 1.71, ...}
  ]
}
```

That's everything the dashboard needs from the mechanical path: per-zone ovality, wear rate,
RUL, plus the governing (shortest-RUL) zone.

---

## 2. Which entry point? (pick one — one decision)

| Your fault slider controls… | Call | Notes |
|---|---|---|
| **Tyre clearance / creep** (mm) | `kiln_state(mm)` | Matches the FEA fault axis directly. |
| **Ovality** (%) | `kiln_state_from_ovality(pct)` | Same ovality applied to every zone; the zone with the highest FEA coupling (upper transition) governs. This is the plan's "operator increases ovality" slider. |
| **Settlement / misalignment** | `kiln_state(mm)` for now | Those FEA sweeps aren't run yet — map the slider to clearance and label it "tyre condition." |

Reference points so we both see the same numbers when testing:

- `kiln_state(0)`  → all zones healthy, governing ≈ burning ~500 d
- `kiln_state(15)` → governing **upper_transition ~202 d**
- `kiln_state_from_ovality(0.5)` (the allowable limit) → burning ~450 d
- `kiln_state_from_ovality(1.5)` → upper_transition ~236 d

---

## 3. Where it plugs into the dashboard

```python
state = kiln_state(fault_slider_value)     # 1 call, where your injector fires

for z in state["zones"]:
    draw_rul_bar(z["zone"], z["rul_days"], z["omega_pct"])

highlight(state["governing_zone"])

CRITICAL_DAYS = 60                          # your escalation threshold
if state["min_rul_days"] < CRITICAL_DAYS:
    raise_alert(zone=state["governing_zone"],
                root_cause=f"tyre clearance {state['value']} mm",
                window_days=state["min_rul_days"])
```

The Critical Anomaly Alert (plan §3D) should name the **governing zone**, state the
**mechanical root cause** (the fault value), and give the **maintenance window** (`min_rul_days`).

---

## 4. Two things to honour in the UI (per plan §5/§6)

1. **RUL is a RELATIVE trend indicator, not an absolute countdown.** The coupling coefficients
   `k_z, n` are FEA-derived, but baseline wear rates `w0_z` and lining thicknesses are literature
   values, not plant-calibrated. Present RUL as "Zone A degrading ~3× faster than Zone B," or label
   it "uncalibrated — relative." Don't imply precision we haven't earned.
2. **Keep the mechanical and thermal channels separate on screen.** They're independent — a thick
   burning-zone coating can mask a thinning brick from the thermal (shell-temperature) channel, but
   the mechanical channel doesn't have that blind spot. Showing both is a selling point.

---

## 5. Tuning knobs (all at the top of the file, if we need to adjust)

- `OVALITY_FIT` — the ovality-vs-clearance curve, fitted to the global FEA. **Don't touch** without
  a new FEA run.
- `ZONES` — per-zone `(nearest_station, thickness_mm, w0, k, n)`. `k, n` are FEA-derived; `w0` and
  thickness are the placeholders to swap for calibrated values later.
- `OMEGA_ALLOW = 0.5` — allowable ovality (D/10 rule).

---

## 6. Provenance

Every number traces to **`FEA_Findings_and_Results.md`** (same folder) — global ovality, the
clearance sweep, the modal proof, and the four zone sub-models that produced `k_z, n`. Cite that
document in the report for the mechanical path.
