import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';

function Model() {
  const { scene } = useGLTF('/police_officer.glb');
  const modelRef = useRef<any>();

  useFrame((state, delta) => {
    if (modelRef.current) {
      // Continuous 360-degree rotation on Y axis
      modelRef.current.rotation.y += delta * 0.8;
    }
  });
  
  return (
    <primitive 
      ref={modelRef}
      object={scene} 
      scale={0.35} // Further reduction to 0.4
      position={[0, 0, 0]} 
      rotation={[0, -0.4, 0]} 
    />
  );
}

export default function OfficerModel() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas 
        shadows 
        camera={{ position: [0, 0.4, 1.1], fov: 35 }} // Zoomed in closer for smaller model
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={1.0} />
        <spotLight position={[10, 10, 10]} angle={0.25} penumbra={1} intensity={2} castShadow />
        <pointLight position={[-10, 5, -10]} intensity={0.8} />
        <Suspense fallback={null}>
          <Model />
          <Environment preset="lobby" />
          <ContactShadows 
            position={[0, 0, 0]} 
            opacity={0.3} 
            scale={10} 
            blur={2.5} 
            far={4} 
          />
        </Suspense>
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload('/police_officer.glb');
