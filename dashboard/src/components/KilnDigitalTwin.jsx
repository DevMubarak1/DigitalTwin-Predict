import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useGLTF, Center, Bounds } from '@react-three/drei';
import * as THREE from 'three';

/* ───────────────────────────── colour helpers ───────────────────────────── */

/** Map a temperature (°C) to an RGB colour on a cool-to-hot ramp. */
function tempToColor(t) {
  // 200 °C → deep blue,  350 °C → orange,  450+ °C → angry red
  const lo = 200, mid = 350, hi = 450;
  const r = new THREE.Color();
  if (t <= lo) return r.setRGB(0.15, 0.35, 0.65);          // cool blue
  if (t <= mid) {
    const f = (t - lo) / (mid - lo);
    return r.setRGB(0.15 + f * 0.75, 0.35 + f * 0.20, 0.65 - f * 0.35);  // → orange
  }
  const f = Math.min(1, (t - mid) / (hi - mid));
  return r.setRGB(0.90, 0.55 - f * 0.40, 0.30 - f * 0.30);  // → red
}

/** A severity fraction from 0 (healthy) to 1 (critical). */
function severityFraction(clearanceMm, maxTemp) {
  const c = Math.min(clearanceMm / 30, 1);
  const t = Math.max(0, Math.min((maxTemp - 250) / 200, 1));
  return Math.max(c, t);
}

/* ──────────────────────────── inner 3-D model ───────────────────────────── */

function KilnModel({ clearanceMm, maxShellTemp, maxOvality }) {
  const { scene, nodes } = useGLTF('/kiln.glb');
  const rotorRef = useRef(null);
  const baseRotSpeed = useRef(0.005);

  // Track severity smoothly
  const severity = useRef(0);

  // Find the rotor node once
  useEffect(() => {
    rotorRef.current = nodes['kiln_rotor-1'] || null;
  }, [nodes]);

  /* On every frame, apply live visual effects driven by the AI state. */
  useFrame((_, delta) => {
    const rotor = rotorRef.current;
    if (!rotor) return;

    const sev = severityFraction(clearanceMm, maxShellTemp);
    // Smooth the severity toward target so the visual doesn't jerk
    severity.current += (sev - severity.current) * Math.min(1, delta * 4);
    const s = severity.current;

    /* 1. Rotation — healthy kiln spins at full speed, faulty kiln slows */
    const rotSpeed = baseRotSpeed.current * (1.0 - s * 0.6);
    rotor.rotation.x -= rotSpeed;

    /* 2. Ovality deformation — squash one radial axis, stretch the other.
     *    At 0 clearance the kiln is perfectly round (scale 1, 1, 1).
     *    At max clearance the cross-section is visibly oval.
     *    We use Y & Z (the radial axes) while X is the longitudinal spin axis. */
    const ovalityScale = 1 + (maxOvality / 100) * 0.5;  // e.g. 4% → 1.02
    rotor.scale.y = THREE.MathUtils.lerp(rotor.scale.y, ovalityScale, delta * 3);
    rotor.scale.z = THREE.MathUtils.lerp(rotor.scale.z, 1 / ovalityScale, delta * 3);

    /* 3. Shell colour — traverse meshes and tint them by severity.
     *    We only tint MeshStandardMaterials. The original colour is blended
     *    toward the temperature colour as the kiln degrades. */
    const heatColor = tempToColor(maxShellTemp);
    rotor.traverse(child => {
      if (!child.isMesh) return;
      const mat = child.material;
      if (!mat || !mat.isMeshStandardMaterial) return;

      // Clone the material once so we don't mutate the cached GLB
      if (!child.userData._origColor) {
        child.material = mat.clone();
        child.userData._origColor = mat.color.clone();
      }

      const orig = child.userData._origColor;
      child.material.color.copy(orig).lerp(heatColor, s * 0.7);
      child.material.emissive.copy(heatColor).multiplyScalar(s * 0.15);
    });
  });

  return (
    <group>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

useGLTF.preload('/kiln.glb');

/* ──────────────────────────── HUD overlay ────────────────────────────── */

function StatusHUD({ clearanceMm, maxShellTemp, maxOvality, campaignDay, minRul, band }) {
  const rulDays = Math.max(0, Math.floor(minRul - campaignDay));

  const bandColors = {
    green: '#10b981',
    amber: '#f59e0b',
    red: '#ef4444',
  };
  const bandColor = bandColors[band] || '#10b981';

  const items = [
    { label: 'Campaign Day',  value: campaignDay,                 unit: '' },
    { label: 'Clearance',     value: clearanceMm.toFixed(1),      unit: 'mm' },
    { label: 'Max Shell Temp', value: maxShellTemp.toFixed(0),     unit: '°C', color: bandColor },
    { label: 'Max Ovality',   value: maxOvality.toFixed(2),       unit: '%' },
    { label: 'RUL',           value: rulDays > 0 ? rulDays : '—', unit: rulDays > 0 ? 'd' : '', color: rulDays < 60 ? '#ef4444' : undefined },
  ];

  return (
    <div style={{
      position: 'absolute', top: 20, right: 20, zIndex: 10,
      background: 'rgba(20,16,13,0.85)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
      padding: '14px 18px', minWidth: 200,
    }}>
      <div style={{ fontSize: '0.75rem', color: '#9BA1A6', marginBottom: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        Live AI State
      </div>
      {items.map(({ label, value, unit, color }) => (
        <div key={label} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <span style={{ fontSize: '0.78rem', color: '#9BA1A6' }}>{label}</span>
          <span style={{ fontSize: '0.92rem', fontWeight: 700, fontFamily: 'monospace', color: color || '#F0F0F0' }}>
            {value}<span style={{ fontSize: '0.72rem', fontWeight: 400, marginLeft: 2 }}>{unit}</span>
          </span>
        </div>
      ))}

      {/* Severity bar */}
      <div style={{ marginTop: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#9BA1A6', marginBottom: 4 }}>
          <span>Structural Health</span>
          <span style={{ color: bandColor, fontWeight: 600 }}>{band.toUpperCase()}</span>
        </div>
        <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 3,
            width: `${Math.max(5, 100 - severityFraction(parseFloat(clearanceMm), parseFloat(maxShellTemp)) * 100)}%`,
            background: `linear-gradient(90deg, ${bandColor}, ${bandColor}cc)`,
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────── exported component ────────────────────────── */

export default function KilnDigitalTwin({
  isFullScreen = false,
  clearanceMm = 0,
  kData = null,
  campaignDay = 0,
  maxShellTemp = 250,
  maxOvality = 0.07,
  thermalBand = 'green',
}) {
  const minRul = kData ? kData.min_rul_days : 999;
  const ov = kData
    ? Math.max(...kData.zones.map(z => z.omega_pct))
    : maxOvality;

  return (
    <div className="kiln-container glass-panel" style={isFullScreen ? { height: '100%', minHeight: '75vh' } : {}}>
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <h3>4D Kiln Digital Twin</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Real-time structural &amp; thermal AI prediction
        </p>
      </div>

      {/* Temperature legend */}
      <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 10, display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{
          width: 120, height: 8, borderRadius: 4,
          background: 'linear-gradient(90deg, #264a7a 0%, #e8944a 50%, #e8432e 100%)',
        }} />
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>200°C — 450°C</span>
      </div>

      {/* Live HUD overlay */}
      <StatusHUD
        clearanceMm={clearanceMm}
        maxShellTemp={maxShellTemp}
        maxOvality={ov}
        campaignDay={campaignDay}
        minRul={minRul}
        band={thermalBand}
      />

      <Canvas camera={{ position: [0, 4, 15], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} />
        <Environment preset="city" />
        <Suspense fallback={null}>
          <Bounds fit clip margin={0.7}>
            <KilnModel
              clearanceMm={clearanceMm}
              maxShellTemp={maxShellTemp}
              maxOvality={ov}
              campaignDay={campaignDay}
              minRul={minRul}
            />
          </Bounds>
        </Suspense>

        <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={20} blur={2} far={4} />
        <OrbitControls makeDefault target={[0, -2, 0]} enablePan enableZoom minDistance={1} maxDistance={100} autoRotate={false} />
      </Canvas>
    </div>
  );
}
