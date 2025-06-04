'use client';

import './globals.css';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

import HUDLayer from '../components/hud/HUDLayer';
import ModalLayer from '../components/modal/ModalLayer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isWelcomePage = pathname === '/welcome';

  // Only create dynamic imports when we need them (not on welcome page)
  const Canvas3D = !isWelcomePage ? dynamic(() => import('../components/canvas/Canvas3D'), { 
    ssr: false,
    loading: () => <div className="canvas-layer-placeholder" />
  }) : null;

  const OrbLayer = !isWelcomePage ? dynamic(() => import('../components/orb/OrbLayer'), { 
    ssr: false,
    loading: () => <div className="orb-layer-placeholder" />
  }) : null;

  return (
    <html lang="en">
      <head>
        <title>2dots1line</title>
        <meta name="description" content="Connect your thoughts, illuminate your life." />
      </head>
      <body className={isWelcomePage ? "" : "full-screen"}>
        {/* V7 3-Layer Immersive Architecture */}
        
        {/* Layer 1: 3D Canvas Background (z-index: 0) - Skip for welcome page */}
        {!isWelcomePage && Canvas3D && (
          <div className="canvas-layer">
            <Canvas3D />
          </div>
        )}

        {/* Layer 2: HUD Controls (z-index: 900) */}
        <div className="hud-layer">
          <HUDLayer />
        </div>

        {/* Layer 3: 2D Modal Content (z-index: 800) */}
        <div className="modal-layer">
          <ModalLayer>
            {children}
          </ModalLayer>
        </div>

        {/* Layer 4: 3D Orb Companion (z-index: 1000) - Skip for welcome page */}
        {!isWelcomePage && OrbLayer && (
          <div className="orb-layer">
            <OrbLayer />
          </div>
        )}
      </body>
    </html>
  );
} 