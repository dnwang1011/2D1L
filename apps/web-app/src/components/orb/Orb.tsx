'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import { useOrbStore } from '../../stores/OrbStore';
import type { Mesh } from 'three';

// Emotional tone to color mapping
const emotionalColors = {
  neutral: '#808080',     // Grey
  happy: '#FFD700',       // Gold/Yellow
  sad: '#4169E1',         // Royal Blue
  excited: '#FF6347',     // Tomato Red
  calm: '#98FB98',        // Pale Green
  angry: '#DC143C',       // Crimson
} as const;

// Visual state to animation behavior mapping
const visualStateAnimations = {
  default: { pulseSpeed: 1, pulseIntensity: 0.1 },
  listening: { pulseSpeed: 2, pulseIntensity: 0.2 },
  thinking: { pulseSpeed: 0.5, pulseIntensity: 0.05 },
  speaking: { pulseSpeed: 3, pulseIntensity: 0.3 },
  sleeping: { pulseSpeed: 0.2, pulseIntensity: 0.02 },
} as const;

export default function Orb() {
  const sphereRef = useRef<Mesh>(null!);
  
  // Get state from OrbStore
  const { isVisible, position, emotionalTone, visualState } = useOrbStore();
  
  // Get current animation parameters
  const animation = visualStateAnimations[visualState];
  const baseColor = emotionalColors[emotionalTone];
  
  // Animation loop for pulsing effect
  useFrame((state, delta) => {
    if (sphereRef.current && isVisible) {
      // Gentle floating motion
      sphereRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      
      // Pulsing scale effect based on visual state
      const pulse = 1 + Math.sin(state.clock.elapsedTime * animation.pulseSpeed) * animation.pulseIntensity;
      sphereRef.current.scale.setScalar(pulse);
      
      // Gentle rotation for thinking state
      if (visualState === 'thinking') {
        sphereRef.current.rotation.y += delta * 0.5;
      }
    }
  });
  
  // Don't render if not visible
  if (!isVisible) {
    return null;
  }
  
  return (
    <Sphere 
      ref={sphereRef} 
      args={[0.5, 32, 32]} 
      position={position}
    >
      <meshStandardMaterial 
        color={baseColor}
        emissive={baseColor}
        emissiveIntensity={0.2}
        roughness={0.3}
        metalness={0.1}
      />
    </Sphere>
  );
} 