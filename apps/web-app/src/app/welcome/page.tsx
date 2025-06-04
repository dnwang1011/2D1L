// apps/web-app/src/app/welcome/page.tsx
'use client';

import { useEffect } from 'react';

export default function WelcomePage() {
  useEffect(() => {
    console.log('🎬 Welcome page loaded');
    // Ensure scrolling is enabled
    document.body.style.overflow = 'auto';
    document.body.style.overflowX = 'hidden';
    
    return () => {
      // Cleanup
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 text-white">
      {/* Simple HUD - temporary */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 space-y-2">
          <button className="block w-full text-left px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-sm">
            Log In
          </button>
          <button className="block w-full text-left px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-sm">
            Sign Up
          </button>
        </div>
      </div>

      {/* Video background */}
      <video 
        className="fixed inset-0 w-full h-full object-cover -z-10" 
        autoPlay 
        loop 
        muted 
        playsInline
      >
        <source src="/videos/Cloud1.mp4" type="video/mp4" />
      </video>

      {/* Section 1 - Simple text */}
      <section className="min-h-screen flex items-center justify-center px-8">
        <div className="text-center space-y-8 max-w-4xl">
          <h1 className="text-6xl font-bold text-white drop-shadow-lg">
            Life moves fast.
          </h1>
          <h2 className="text-5xl font-semibold text-white/90 drop-shadow-lg">
            Memories fade,
          </h2>
          <h2 className="text-5xl font-semibold text-white/90 drop-shadow-lg">
            insights get lost,
          </h2>
          <h2 className="text-4xl font-medium text-white/80 drop-shadow-lg">
            your best ideas feel disconnected
          </h2>
        </div>
      </section>

      {/* Section 2 */}
      <section className="min-h-screen flex items-center justify-center px-8">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-white drop-shadow-lg mb-8">
            Meet Orb, your guide to a deeper understanding.
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto drop-shadow">
            An AI companion that helps you navigate the cosmos of your mind, 
            transforming scattered thoughts into meaningful insights.
          </p>
        </div>
      </section>

      {/* Section 3 */}
      <section className="min-h-screen flex items-center justify-center px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-white drop-shadow-lg mb-8">
            Your Personal Cosmos
          </h3>
          <p className="text-xl text-white/80 drop-shadow mb-12">
            Every memory, insight, and learning becomes a star in your personal universe, 
            connected by luminous threads of meaning and understanding.
          </p>
        </div>
      </section>

      {/* Section 4 - Call to Action */}
      <section className="min-h-screen flex items-center justify-center px-8">
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-12 max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Begin Your Journey of Self-Discovery
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Unlock the interconnected wisdom of your life. Your personal cosmos awaits.
          </p>
          <div className="space-y-4">
            <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-semibold py-4 px-8 rounded-lg transition-colors text-lg">
              Join Waitlist / Sign Up
            </button>
            <p className="text-white/70">
              Already have access?{' '}
              <button className="text-yellow-400 hover:text-yellow-300 underline">
                Sign In
              </button>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}