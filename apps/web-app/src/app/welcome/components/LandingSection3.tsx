// apps/web-app/src/app/welcome/components/LandingSection3.tsx
'use client';

import { gsap } from 'gsap';
import React, { useEffect, useRef, useMemo } from 'react';

// import { ScrollTrigger } from 'gsap/ScrollTrigger'; // Commented out
import { useOrbStore } from '../../../stores/OrbStore';

import OrbChatBubble from './OrbChatBubble'; // Assuming this relative path is correct

// gsap.registerPlugin(ScrollTrigger); // Commented out

export default function LandingSection3() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { /* setVisible: setOrbVisible, */ setPosition: setOrbPosition, setVisualState: setOrbVisualState } = useOrbStore();

  const targetOrbPosition = useMemo<[number, number, number]>(() => [0, -2, 0], []);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 50%", // Trigger when section top is at 50% of viewport height
        end: "bottom 50%",
        // markers: true,
        onEnter: () => {
          setOrbPosition(targetOrbPosition); // Ensure Orb is correctly positioned
          setOrbVisualState('speaking'); // Orb transitions to talking mode
          gsap.fromTo(content,
            { opacity: 0, y: 20, scale: 0.9 },
            { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 }
          );
        },
        onToggle: (self) => { // For scrub effect, or when scrolling fast
            if(self.progress > 0.1 && self.progress < 0.9) { // Approx 2nd second of 5s video (0.4 * 5s = 2s)
                 // This assumes ascension video is roughly tied to this section's scroll length
                 // A more precise timing would be to link to ascension video's currentTime if scrubbed directly
            }
        },
        onLeave: () => {
           gsap.to(content, { opacity: 0, y: -20, scale: 0.9, duration: 0.5, ease: 'power3.in' });
           setOrbVisualState('default');
        },
        onEnterBack: () => {
           setOrbPosition(targetOrbPosition);
           setOrbVisualState('speaking');
           gsap.to(content, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' });
        },
         onLeaveBack: () => {
           gsap.to(content, { opacity: 0, y: 20, scale: 0.9, duration: 0.5, ease: 'power3.in' });
           setOrbVisualState('default');
        }
      }
    });

    return () => {
      tl.kill();
    };
  }, [/*setOrbVisible,*/ setOrbPosition, setOrbVisualState, targetOrbPosition]);

  return (
    <section
      ref={sectionRef}
      id="landing-section-3"
      className="landing-section" // Represents the duration of ascension video
    >
      <div className="landing-content w-full h-full flex items-end justify-start p-8 md:p-16"> {/* Position bubble container */}
        <div ref={contentRef} style={{ opacity: 0, transform: 'translateY(20px) scale(0.9)' }}>
          <OrbChatBubble message="I help you capture, connect, and cultivate your inner world." />
        </div>
      </div>
    </section>
  );
}