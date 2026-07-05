import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// A simple vertex shader and fragment shader to create a heatmap effect
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform float time;
  
  // Fake heat spots
  float getHeat(vec2 uv) {
    // Basic base temp
    float temp = 0.2; 
    
    // Zone 1 normal
    float d1 = distance(uv, vec2(0.3, 0.5));
    temp += smoothstep(0.2, 0.0, d1) * 0.4;

    // Zone 4 critical hot spot (animated with time to show it moving slightly)
    float d2 = distance(uv, vec2(0.7, mod(time * 0.1, 1.0)));
    temp += smoothstep(0.15, 0.0, d2) * 0.9;
    
    return temp;
  }
  
  vec3 heatMapColor(float value) {
    vec3 cold = vec3(0.23, 0.43, 0.65); // heat-low (#3A6EA5)
    vec3 warm = vec3(0.91, 0.58, 0.29); // heat-mid (#E8944A)
    vec3 hot = vec3(0.91, 0.26, 0.18);  // heat-high (#E8432E)
    vec3 critical = vec3(0.95, 0.76, 0.31); // signal (#F2C14E)
    
    vec3 color;
    if (value < 0.4) {
      color = mix(cold, warm, value / 0.4);
    } else if (value < 0.8) {
      color = mix(warm, hot, (value - 0.4) / 0.4);
    } else {
      color = mix(hot, critical, (value - 0.8) / 0.2);
    }
    return color;
  }

  void main() {
    float heat = getHeat(vUv);
    vec3 color = heatMapColor(heat);
    
    // Add grid lines for "plates" or "refractory bricks"
    float gridX = step(0.98, fract(vUv.x * 20.0));
    float gridY = step(0.95, fract(vUv.y * 10.0));
    color = mix(color, vec3(0.05), max(gridX, gridY) * 0.5);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function KilnCylinder() {
  const meshRef = useRef();
  const materialRef = useRef();
  
  const uniforms = useMemo(() => ({
    time: { value: 0 }
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x -= 0.005; // Slow rotation of the kiln
    }
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]}>
      {/* 2 is radius, 10 is length */}
      <cylinderGeometry args={[2, 2, 10, 64, 32, true]} />
      <shaderMaterial 
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Tire/Roller visual accents
function KilnTire({ position }) {
  return (
    <mesh position={position} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[2.2, 2.2, 0.5, 64]} />
      <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
    </mesh>
  );
}

export default function KilnDigitalTwin() {
  return (
    <div className="kiln-container glass-panel">
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <h3>3D Kiln Digital Twin</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Live thermal mapping & deformation simulation</p>
      </div>
      
      <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 10, display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ width: 100, height: 8, background: 'linear-gradient(90deg, var(--heat-low) 0%, var(--heat-mid) 40%, var(--heat-high) 80%, var(--signal) 100%)', borderRadius: 4 }}></div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Temperature Scale (°C)</span>
      </div>

      <Canvas camera={{ position: [0, 4, 12], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="city" />
        
        <group position={[0, -1, 0]} rotation={[0, -0.2, 0]}>
          <KilnCylinder />
          <KilnTire position={[-3, 0, 0]} />
          <KilnTire position={[3, 0, 0]} />
        </group>

        <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={20} blur={2} far={4} />
        <OrbitControls enablePan={true} enableZoom={true} minDistance={5} maxDistance={20} />
      </Canvas>
    </div>
  );
}
