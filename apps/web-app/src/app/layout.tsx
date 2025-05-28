'use client';

import './globals.css';

// V7 3-Layer Architecture Components
import Canvas3D from '../components/canvas/Canvas3D';
import ModalLayer from '../components/modal/ModalLayer';
import OrbLayer from '../components/orb/OrbLayer';
import HUDLayer from '../components/hud/HUDLayer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>2dots1line</title>
        <meta name="description" content="Connect your thoughts, illuminate your life." />
      </head>
      <body className="full-screen">
        {/* V7 3-Layer Immersive Architecture */}
        
        {/* Layer 1: 3D Canvas Background (z-index: 0) */}
        <div className="canvas-layer">
          <Canvas3D />
        </div>

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

        {/* Layer 4: 3D Orb Companion (z-index: 1000) */}
        <div className="orb-layer">
          <OrbLayer />
        </div>
      </body>
    </html>
  );
} 