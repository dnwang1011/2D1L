'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box } from '@react-three/drei';
import { useRef } from 'react';

export default function Canvas3D() {
  const boxRef = useRef<THREE.Mesh>(null!);

  // Basic animation or interaction example (optional for S2.T1)
  // useFrame((state, delta) => {
  //   if (boxRef.current) {
  //     boxRef.current.rotation.x += delta;
  //     boxRef.current.rotation.y += delta;
  //   }
  // });

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Box ref={boxRef} args={[1, 1, 1]} position={[0, 0, 0]}>
          <meshStandardMaterial color="orange" />
        </Box>
        <OrbitControls />
      </Canvas>
    </div>
  );
} 