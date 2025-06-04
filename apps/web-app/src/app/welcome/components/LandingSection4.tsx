// apps/web-app/src/app/welcome/components/LandingSection4.tsx
'use client';

import { gsap } from 'gsap';
import React, { useEffect, useRef, useMemo } from 'react';

// import { ScrollTrigger } from 'gsap/ScrollTrigger'; // Removed
import { useOrbStore } from '../../../stores/OrbStore';

import OrbChatBubble from './OrbChatBubble';

// gsap.registerPlugin(ScrollTrigger); // Removed

export default function LandingSection4() {
  const sectionRef = useRef<HTMLDivElement>(null); // Main section for interstellar
  const subSectionGraphRef = useRef<HTMLDivElement>(null); // Sub-section for graph tease

  const chatBubble1Ref = useRef<HTMLDivElement>(null);
  const chatBubble2Ref = useRef<HTMLDivElement>(null);
  const { setPosition: setOrbPosition, setVisualState: setOrbVisualState } = useOrbStore();
  const targetOrbPosition = useMemo<[number, number, number]>(() => [2.5, -1.5, 0], []); // Example position, adjust as needed

  useEffect(() => {
    const section = sectionRef.current;
    const subSectionGraph = subSectionGraphRef.current;
    const bubble1 = chatBubble1Ref.current;
    const bubble2 = chatBubble2Ref.current;

    if (!section || !subSectionGraph || !bubble1 || !bubble2) return;
    const ctx = gsap.context(() => {
      // Animation for first chat bubble (Interstellar section)
      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 60%",
          end: "bottom 40%", // Bubble stays for a while
          // markers: { indent: 20, startColor: "pink", endColor: "pink" },
          onEnter: () => {
            setOrbPosition(targetOrbPosition);
            setOrbVisualState('speaking');
            gsap.to(bubble1, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' });
          },
          onLeave: () => gsap.to(bubble1, { opacity: 0, y: -20, scale: 0.9, duration: 0.5, ease: 'power3.in' }),
          onEnterBack: () => {
            setOrbPosition(targetOrbPosition);
            setOrbVisualState('speaking');
            gsap.to(bubble1, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' });
          },
          onLeaveBack: () => gsap.to(bubble1, { opacity: 0, y: 20, scale: 0.9, duration: 0.5, ease: 'power3.in' }),
        }
      });

      // Animation for second chat bubble and graph tease content (Sub-section 4.5)
      gsap.timeline({
        scrollTrigger: {
          trigger: subSectionGraph, // Trigger for the graph tease part
          start: "top 60%",
          end: "bottom 40%",
          // markers: { indent: 40, startColor: "orange", endColor: "orange" },
          onEnter: () => {
            setOrbPosition(targetOrbPosition);
            setOrbVisualState('speaking'); // Orb continues or re-engages
            gsap.to(bubble2, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 });
            gsap.fromTo(".graph-teaser-content", {opacity:0, y:20}, {opacity:1, y:0, duration:0.8, ease:'power3.out', delay: 0.4, stagger: 0.2});
          },
          onLeave: () => {
            gsap.to(bubble2, { opacity: 0, y: -20, scale: 0.9, duration: 0.5, ease: 'power3.in' });
            gsap.to(".graph-teaser-content", {opacity:0, y:-20, duration:0.5, ease:'power3.in'});
          },
          onEnterBack: () => {
            setOrbPosition(targetOrbPosition);
            setOrbVisualState('speaking');
            gsap.to(bubble2, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' });
            gsap.to(".graph-teaser-content", {opacity:1, y:0, duration:0.5, ease:'power3.out'});
          },
          onLeaveBack: () => {
             gsap.to(bubble2, { opacity: 0, y: 20, scale: 0.9, duration: 0.5, ease: 'power3.in' });
             gsap.to(".graph-teaser-content", {opacity:0, y:20, duration:0.5, ease:'power3.in'});
          }
        }
      });
    }, section); // Scope animations
    return () => ctx.revert();
  }, [setOrbVisualState, setOrbPosition, targetOrbPosition]);

  return (
    <>
      {/* Section 4: Interstellar Journey */}
      <section
        ref={sectionRef}
        id="landing-section-4"
        className="landing-section" // Represents duration of interstellar video
      >
        <div className="landing-content w-full h-full flex items-end justify-start p-8 md:p-16">
          <div ref={chatBubble1Ref} style={{ opacity: 0, transform: 'translateY(20px) scale(0.9)' }}>
            <OrbChatBubble message="Discover profound self-understanding, foster growth, and bring your unique wisdom to life." />
          </div>
        </div>
      </section>

      {/* Section 4.5: Graph Scene Tease (within the scroll space of interstellar or as its own mini-section) */}
      <section
        ref={subSectionGraphRef}
        id="landing-section-4-5" // For VideoBackground targeting
        className="landing-section" // Represents duration of graph video
      >
        <div className="landing-content flex flex-col items-center justify-center text-center">
          <div className="graph-teaser-content" style={{opacity:0}}>
            <h3 className="text-headline-large font-brand text-white text-shadow-glow mb-lg">
              Your Personal Cosmos
            </h3>
            <p className="text-title-large font-plain text-white-80 text-shadow-glow max-w-3xl mx-auto">
              Every memory, insight, and learning becomes a star in your personal universe,
              connected by luminous threads of meaning and understanding.
            </p>
          </div>
          <div ref={chatBubble2Ref} className="mt-auto mb-16 self-start ml-0 md:ml-16" style={{ opacity: 0, transform: 'translateY(20px) scale(0.9)' }}>
             {/* Position chat bubble appropriately for this visual */}
            <OrbChatBubble message="Your life's experiences, thoughts, and learnings, beautifully mapped and interconnected." />
          </div>
        </div>
      </section>
    </>
  );
}