'use client';

import { useModalStore } from '../stores/ModalStore';
import { useOrbStore } from '../stores/OrbStore';
import { useEffect } from 'react';

export default function HomePage() {
  const { setActiveModal } = useModalStore();
  const { setVisible: setOrbVisible, setEmotionalTone } = useOrbStore();

  // Initialize the experience
  useEffect(() => {
    // Show the Orb when the app loads
    setOrbVisible(true);
    setEmotionalTone('neutral');
  }, [setOrbVisible, setEmotionalTone]);

  return (
    <div className="center-fixed max-w-2xl px-lg">
      <div className="glass-panel p-xl rounded-large text-center animate-fade-in">
        {/* Welcome Header */}
        <div className="mb-xl">
          <h1 className="text-display-large font-brand text-sys-color-primary mb-md">
            Welcome to 2dots1line
          </h1>
          <p className="text-headline-medium font-brand text-sys-color-onSurface opacity-80 mb-lg">
            Connect your thoughts, illuminate your life
          </p>
          <p className="text-body-large font-plain text-sys-color-onSurface opacity-70">
            Your journey of self-discovery begins here. Explore the cosmos of your mind through an immersive experience that grows with you.
          </p>
        </div>

        {/* Quick Start Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
          <button
            onClick={() => setActiveModal('dashboard')}
            className="glass-panel p-lg rounded-medium hover:card-hover transition-all duration-medium1 ease-standard text-center group"
          >
            <div className="text-4xl mb-sm">📊</div>
            <h3 className="text-title-medium font-brand text-sys-color-primary mb-xs">
              Cosmic Overview
            </h3>
            <p className="text-body-small font-plain text-sys-color-onSurface opacity-70">
              See your growth across all dimensions
            </p>
          </button>

          <button
            onClick={() => setActiveModal('cardGallery')}
            className="glass-panel p-lg rounded-medium hover:card-hover transition-all duration-medium1 ease-standard text-center group"
          >
            <div className="text-4xl mb-sm">🃏</div>
            <h3 className="text-title-medium font-brand text-sys-color-primary mb-xs">
              Knowledge Gallery
            </h3>
            <p className="text-body-small font-plain text-sys-color-onSurface opacity-70">
              Explore your evolving constellation
            </p>
          </button>

          <button
            onClick={() => setActiveModal('chat')}
            className="glass-panel p-lg rounded-medium hover:card-hover transition-all duration-medium1 ease-standard text-center group"
          >
            <div className="text-4xl mb-sm">💬</div>
            <h3 className="text-title-medium font-brand text-sys-color-primary mb-xs">
              Chat with Orb
            </h3>
            <p className="text-body-small font-plain text-sys-color-onSurface opacity-70">
              Begin a conversation with your AI companion
            </p>
          </button>
        </div>

        {/* Getting Started */}
        <div className="text-left">
          <h2 className="text-title-large font-brand text-sys-color-primary mb-md">
            Getting Started
          </h2>
          <div className="space-y-sm text-body-medium font-plain text-sys-color-onSurface opacity-80">
            <div className="flex items-start gap-sm">
              <span className="text-ref-palette-accent-journeyGold">1.</span>
              <span>Use the HUD controls (top-right) to navigate between scenes and features</span>
            </div>
            <div className="flex items-start gap-sm">
              <span className="text-ref-palette-accent-journeyGold">2.</span>
              <span>Start a conversation with your Orb companion to begin capturing memories</span>
            </div>
            <div className="flex items-start gap-sm">
              <span className="text-ref-palette-accent-journeyGold">3.</span>
              <span>Watch as your knowledge cards evolve and form constellations of meaning</span>
            </div>
            <div className="flex items-start gap-sm">
              <span className="text-ref-palette-accent-journeyGold">4.</span>
              <span>Explore the 3D graph scene to visualize connections in your personal cosmos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 