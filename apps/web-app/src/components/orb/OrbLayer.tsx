'use client';

import { Canvas } from '@react-three/fiber';
import { useOrbStore } from '../../stores/OrbStore';
import Orb from './Orb';

/**
 * OrbLayer component serves as a container for the Orb and related 3D elements.
 * This separation allows for future expansion with particle effects, 
 * surrounding elements, or multiple Orb instances.
 */
export default function OrbLayer() {
  const { isVisible } = useOrbStore();

  if (!isVisible) {
    return null;
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 75 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none', // Orb doesn't block interactions
        zIndex: 1000,
      }}
      gl={{ alpha: true, antialias: true }}
    >
      <Orb />
    </Canvas>
  );
} 