'use client';

import { OrbitControls, Stars } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

import { useSceneStore } from '../../stores/SceneStore';

import AscensionScene from './AscensionScene';
import CloudScene from './CloudScene';
import GraphScene from './GraphScene';

// Basic shared lighting and environment
const SharedEnvironment = () => (
  <>
    <ambientLight intensity={0.7} />
    <pointLight position={[10, 10, 10]} intensity={1.5} />
    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
  </>
);

// Placeholder for PostProcessing effects - V7UltimateGuide Section 3.3.1
// import { EffectComposer, Bloom } from '@react-three/postprocessing';
// const PostProcessing = () => (
//   <EffectComposer>
//     <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} />
//   </EffectComposer>
// );

export default function Canvas3D() {
  const activeScene = useSceneStore((state) => state.activeScene);

  // Set a default scene if none is active for initial view
  // React.useEffect(() => {
  //   if (!activeScene) {
  //     useSceneStore.getState().setActiveScene('CloudScene');
  //   }
  // }, [activeScene]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <SharedEnvironment />
        {/* <PostProcessing /> */}
        
        <Suspense fallback={null}>
          {activeScene === 'CloudScene' && <CloudScene />}
          {activeScene === 'AscensionScene' && <AscensionScene />}
          {activeScene === 'GraphScene' && <GraphScene />}
          {!activeScene && (
            <mesh>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color="grey" />
            </mesh>
          )}
        </Suspense>
        
        <OrbitControls />
      </Canvas>
    </div>
  );
} 