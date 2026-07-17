import React, { Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useGLTF, Center, Bounds } from '@react-three/drei';
import * as THREE from 'three';
import { shellTemperature, liningAfter, ZONE_THERMAL } from '../utils/kilnThermalChannel';

function KilnModel({ campaignDay = 0, clearanceMm = 0, coatingLost = false, ...props }) {
  const { scene, nodes } = useGLTF('/kiln.glb');

  // Compute thermal and mechanical state
  const { tMax, ovalityFactor } = useMemo(() => {
    let maxT = 300;
    try {
      const thickness = liningAfter(campaignDay, clearanceMm);
      maxT = Math.max(...Object.keys(ZONE_THERMAL).map(z => {
        const coat = (z === 'burning' && coatingLost) ? 0.0 : null;
        return shellTemperature(z, thickness[z], coat);
      }));
    } catch(e) { }

    const wobble = Math.min(1.0, clearanceMm / 30.0);
    return { tMax: maxT, ovalityFactor: wobble };
  }, [campaignDay, clearanceMm, coatingLost]);

  // Clone material to avoid mutating shared GLTF cache
  const rotorMat = useMemo(() => {
    if (nodes['kiln_rotor-1'] && nodes['kiln_rotor-1'].material) {
      const mat = nodes['kiln_rotor-1'].material.clone();
      nodes['kiln_rotor-1'].material = mat;
      return mat;
    }
    return null;
  }, [nodes]);

  useFrame((state) => {
    if (nodes['kiln_rotor-1']) {
      const rotor = nodes['kiln_rotor-1'];
      // Rotate the kiln rotor (the barrel) along its longitudinal X-axis.
      rotor.rotation.x -= 0.005;

      // Mechanical Channel (Ovality): Wobble based on clearance
      const time = state.clock.getElapsedTime();
      const wobbleAmount = ovalityFactor * 0.08; 
      rotor.position.y = Math.sin(time * 3) * wobbleAmount;
      rotor.position.z = Math.cos(time * 3) * wobbleAmount;
      
      // Thermal Channel: Heat map tinting
      if (rotorMat) {
        const targetColor = new THREE.Color();
        if (tMax < 350) {
          targetColor.set('#3a3b3c'); // Healthy steel
        } else if (tMax < 420) {
          targetColor.lerpColors(new THREE.Color('#3a3b3c'), new THREE.Color('#e67e22'), (tMax - 350) / 70); // Warning orange
        } else {
          targetColor.lerpColors(new THREE.Color('#e67e22'), new THREE.Color('#d03b3b'), Math.min(1, (tMax - 420) / 30)); // Critical red
        }
        
        rotorMat.color.lerp(targetColor, 0.05);
        if (tMax > 380) {
          rotorMat.emissive.copy(targetColor).multiplyScalar(Math.min(0.5, (tMax - 380) / 100));
        } else {
          rotorMat.emissive.setHex(0x000000);
        }
      }
    }
  });

  return (
    <group {...props}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

useGLTF.preload('/kiln.glb');

export default function KilnDigitalTwin({ isFullScreen = false, campaignDay = 0, clearanceMm = 0, coatingLost = false }) {
  return (
    <div className="kiln-container glass-panel" style={isFullScreen ? { height: '100%', minHeight: '75vh' } : {}}>
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <h3>3D Kiln Digital Twin</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Live structural & thermal simulation</p>
      </div>
      
      <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 10, display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ width: 100, height: 8, background: 'linear-gradient(90deg, var(--heat-low) 0%, var(--heat-mid) 40%, var(--heat-high) 80%, var(--signal) 100%)', borderRadius: 4 }}></div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Temperature Scale (°C)</span>
      </div>

      <Canvas camera={{ position: [0, 4, 15], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} />
        <Environment preset="city" />
        <Suspense fallback={null}>
          <Bounds fit clip margin={0.7}>
            <KilnModel scale={0.05} position={[0, -2, 0]} campaignDay={campaignDay} clearanceMm={clearanceMm} coatingLost={coatingLost} />
          </Bounds>
        </Suspense>

        <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={20} blur={2} far={4} />
        <OrbitControls makeDefault target={[0, -2, 0]} enablePan={true} enableZoom={true} minDistance={1} maxDistance={100} autoRotate={false} />
      </Canvas>
    </div>
  );
}
