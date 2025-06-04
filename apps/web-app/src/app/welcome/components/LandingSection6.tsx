// apps/web-app/src/app/welcome/components/LandingSection6.tsx
'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useModalStore } from '../../../stores/ModalStore';
import { useOrbStore } from '../../../stores/OrbStore';
// ScrollTrigger registered globally

export default function LandingSection6() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { setActiveModal } = useModalStore();
  const { setVisible: setOrbVisible } = useOrbStore();


  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(content,
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: "top 60%",
            // markers: true,
            onEnter: () => {
                setOrbVisible(false); // Hide Orb for final CTA
            },
            onLeaveBack: () => {
                setOrbVisible(true); // Show Orb again if scrolling up
            }
          }
        }
      );
    }, section);
    return () => ctx.revert();
  }, [setOrbVisible]);

  return (
    <section
      ref={sectionRef}
      id="landing-section-6"
      className="landing-section" // Represents return to cloud scene video
    >
      <div ref={contentRef} className="landing-content text-center" style={{ opacity: 0, transform: 'translateY(30px) scale(0.95)' }}>
        <div className="glass-panel p-xl rounded-large max-w-2xl mx-auto">
          <div className="mb-xl">
            <h2 className="text-display-medium font-brand text-sys-color-primary mb-lg">
              Begin Your Journey of Self-Discovery
            </h2>
            <p className="text-headline-small font-plain text-sys-color-onSurface opacity-80 mb-lg">
              Unlock the interconnected wisdom of your life. Your personal cosmos awaits.
            </p>
          </div>
          <div className="space-y-md">
            <button
              onClick={() => setActiveModal('signUp')}
              className="w-full btn-primary text-label-large py-lg hover:scale-105 transition-transform duration-medium1"
            >
              Join Waitlist / Sign Up
            </button>
            <div className="text-body-medium font-plain text-sys-color-onSurface opacity-70">
              Already have access?{' '}
              <button
                onClick={() => setActiveModal('login')}
                className="text-sys-color-primary hover:text-sys-color-primary/80 transition-colors underline font-medium"
              >
                Sign In
              </button>
            </div>
          </div>
          <div className="mt-xl pt-lg border-t border-sys-color-outline/20">
            <p className="text-body-small font-plain text-sys-color-onSurface opacity-60">
              © {new Date().getFullYear()} 2dots1line. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}