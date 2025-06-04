// apps/web-app/src/app/welcome/components/LandingSection5.tsx
'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';

import { useOrbStore } from '../../../stores/OrbStore';

import OrbChatBubble from './OrbChatBubble';

export default function LandingSection5() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const chatBubble1Ref = useRef<HTMLDivElement>(null);
  const chatBubble2Ref = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const { setVisible: setOrbVisible, setPosition: setOrbPosition, setVisualState: setOrbVisualState } = useOrbStore();

  const targetOrbPosition = useMemo<[number, number, number]>(() => [0, 1.5, 0], []); // Example, adjust as needed

  useEffect(() => {
    const section = sectionRef.current;
    const bubble1 = chatBubble1Ref.current;
    const bubble2 = chatBubble2Ref.current;
    const card1 = card1Ref.current;
    const card2 = card2Ref.current;

    if (!section || !bubble1 || !bubble2 || !card1 || !card2) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 50%",
          end: "bottom 50%",
          // markers: true,
          onEnter: () => {
            setOrbPosition(targetOrbPosition);
            setOrbVisualState('speaking');
          },
          onLeaveBack: () => {
            setOrbVisualState('default'); // Or previous section's state
          }
        }
      });

      tl.fromTo(bubble1,
          { opacity: 0, y: 20, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' }
        )
        .fromTo(bubble2,
          { opacity: 0, y: 20, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' },
          "-=0.5" // Overlap previous animation slightly
        )
        .fromTo([card1, card2],
          { opacity: 0, y: 30, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out', stagger: 0.3 },
          "-=0.5" // Start cards animation as second bubble is finishing
        );

    }, section);
    return () => ctx.revert();
  }, [setOrbVisualState, setOrbPosition, targetOrbPosition]);

  return (
    <section
      ref={sectionRef}
      id="landing-section-5"
      className="landing-section flex items-center justify-center" // Represents duration of artifact demo video
    >
      <div ref={contentRef} className="landing-content w-full flex flex-col md:flex-row items-center justify-around p-8 md:p-16">
        {/* Left Side: Orb Chat Bubbles */}
        <div className="w-full md:w-1/2 flex flex-col items-start space-y-6 mb-8 md:mb-0 md:pr-8">
          <div ref={chatBubble1Ref} style={{ opacity: 0, transform: 'translateY(20px) scale(0.9)' }}>
            <OrbChatBubble message="Grow in understanding, take meaningful action, and express your unique voice – for yourself, and for the world." />
          </div>
          <div ref={chatBubble2Ref} style={{ opacity: 0, transform: 'translateY(20px) scale(0.9)' }}>
            <OrbChatBubble message="Co-create meaningful artifacts – essays, plans, personal philosophies – from the rich landscape of your own authenticated knowledge." />
          </div>
        </div>

        {/* Right Side: Feature Cards */}
        <div className="w-full md:w-1/2 space-y-6">
          <div ref={card1Ref} className="glass-panel p-lg rounded-large" style={{ opacity: 0, transform: 'translateY(30px) scale(0.95)' }}>
            <div className="flex items-center gap-md mb-md">
              <div className="text-3xl">🧠</div> {/* Replace with actual icon/visual */}
              <h4 className="text-title-large font-brand text-sys-color-primary">
                Understanding Your Inner Landscape
              </h4>
            </div>
            <p className="text-body-medium font-plain text-sys-color-onSurface opacity-80">
              Map your thoughts, emotions, and experiences into a living constellation of self-knowledge.
            </p>
            <div className="mt-md">
              <span className="text-body-small font-plain text-ref-palette-accent-reflectionAmethyst">Know Self</span>
            </div>
          </div>

          <div ref={card2Ref} className="glass-panel p-lg rounded-large" style={{ opacity: 0, transform: 'translateY(30px) scale(0.95)' }}>
            <div className="flex items-center gap-md mb-md">
              <div className="text-3xl">🌍</div> {/* Replace with actual icon/visual */}
              <h4 className="text-title-large font-brand text-sys-color-primary">
                Bringing Your Ideas to the World
              </h4>
            </div>
            <p className="text-body-medium font-plain text-sys-color-onSurface opacity-80">
              Transform insights into artifacts - essays, plans, philosophies - that express your unique voice.
            </p>
            <div className="mt-md">
              <span className="text-body-small font-plain text-ref-palette-accent-journeyGold">Show World</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}