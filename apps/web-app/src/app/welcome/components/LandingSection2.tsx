// apps/web-app/src/app/welcome/components/LandingSection2.tsx
'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useOrbStore } from '../../../stores/OrbStore';
// ScrollTrigger registered globally

export default function LandingSection2() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { setVisible: setOrbVisible, setPosition: setOrbPosition, setVisualState: setOrbVisualState } = useOrbStore();

  // Define target Orb position for this section (e.g., bottom-left of viewport)
  // These are conceptual. Actual 3D positioning depends on OrbLayer's camera setup.
  // For a fixed OrbLayer canvas, these would be world coordinates.
  const targetOrbPosition: [number, number, number] = [-2.5, -1.5, 0]; // Example: More left and down

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top center", // When top of section hits center
        end: "bottom center",  // When bottom of section hits center
        // markers: true,
        onEnter: () => {
          setOrbVisible(true);
          gsap.to(content, { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out' });
          // Animate Orb to position (conceptual - actual Orb animation is within Orb.tsx)
          setOrbPosition(targetOrbPosition);
          setOrbVisualState('default'); // Gentle breathing/pulsing
        },
        onLeave: () => { // When section leaves center going down
          gsap.to(content, { opacity: 0, y: -20, scale: 0.95, duration: 0.5, ease: 'power3.in' });
          // Orb can remain visible or transition state for next section
        },
        onEnterBack: () => { // When section re-enters center scrolling up
          setOrbVisible(true);
          gsap.to(content, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' });
          setOrbPosition(targetOrbPosition);
          setOrbVisualState('default');
        },
        onLeaveBack: () => { // When section leaves center scrolling up
           gsap.to(content, { opacity: 0, y: 20, scale: 0.95, duration: 0.5, ease: 'power3.in' });
           setOrbVisible(false); // Hide Orb if scrolling back to Section 1
        }
      }
    });

    return () => {
      tl.kill();
    };
  }, [setOrbVisible, setOrbPosition, setOrbVisualState, targetOrbPosition]);

  return (
    <section
      ref={sectionRef}
      id="landing-section-2"
      className="landing-section"
    >
      <div ref={contentRef} className="landing-content text-center" style={{ opacity: 0, transform: 'translateY(30px) scale(0.95)' }}>
        <h2 className="text-display-medium font-brand text-white text-shadow-glow mb-lg">
          Meet Orb, your guide to a deeper understanding.
        </h2>
        <p className="text-headline-small font-plain text-white-80 text-shadow-glow max-w-2xl mx-auto">
          An AI companion that helps you navigate the cosmos of your mind,
          transforming scattered thoughts into meaningful insights.
        </p>
      </div>
       {/* Orb itself is in OrbLayer, controlled by OrbStore */}
    </section>
  );
}