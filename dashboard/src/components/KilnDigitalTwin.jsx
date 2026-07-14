import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useGLTF, Center, Bounds } from '@react-three/drei';

function KilnModel(props) {
  const { scene } = useGLTF('/kiln.glb');
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      // Slowly rotate the kiln on its main axis
      meshRef.current.rotation.y -= 0.005;
    }
  });

  return (
    <primitive object={scene} ref={meshRef} {...props} />
  );
}

useGLTF.preload('/kiln.glb');

export default function KilnDigitalTwin({ isFullScreen = false }) {
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
            <Center top position={[0, -2, 0]}>
              <KilnModel scale={0.05} />
            </Center>
          </Bounds>
        </Suspense>

        <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={20} blur={2} far={4} />
        <OrbitControls makeDefault enablePan={true} enableZoom={true} minDistance={1} maxDistance={100} autoRotate={false} />
      </Canvas>
    </div>
  );
}
