// apps/web-app/src/app/welcome/components/LandingSection1.tsx
'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function LandingSection1() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textLinesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || textLinesRef.current.some(el => !el)) return;

    console.log('🎬 LandingSection1: Initializing ScrollTrigger animations');
    
    const lines = textLinesRef.current.filter(Boolean) as HTMLDivElement[];
    console.log(`📝 Found ${lines.length} text lines for animation`);

    // Create main timeline for the section
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        end: "bottom 20%",
        scrub: true,
        markers: {
          startColor: "green",
          endColor: "red",
          fontSize: "18px",
          fontWeight: "bold",
          indent: 20
        },
        onEnter: () => console.log('🟢 Section 1: onEnter triggered'),
        onLeave: () => console.log('🔴 Section 1: onLeave triggered'),
        onEnterBack: () => console.log('🔵 Section 1: onEnterBack triggered'),
        onLeaveBack: () => console.log('🟡 Section 1: onLeaveBack triggered'),
        onUpdate: (self) => {
          console.log(`📊 Section 1 progress: ${(self.progress * 100).toFixed(1)}%`);
        }
      }
    });

    // Animate each line with detailed logging
    lines.forEach((line, index) => {
      const lineText = line.textContent;
      console.log(`🎯 Setting up animation for line ${index + 1}: "${lineText}"`);
      
      const startProgress = index * 0.2; // More spaced out timing
      const fadeInDuration = 0.15;
      const stayDuration = 0.25;
      const fadeOutDuration = 0.15;
      
      console.log(`⏱️  Line ${index + 1} timing:`, {
        startProgress,
        fadeInDuration,
        stayDuration,
        fadeOutDuration,
        totalDuration: fadeInDuration + stayDuration + fadeOutDuration
      });
      
      // Fade in
      tl.fromTo(line,
        { 
          opacity: 0, 
          y: 50,
          scale: 0.9
        },
        { 
          opacity: 1, 
          y: 0,
          scale: 1,
          duration: fadeInDuration,
          ease: "power2.out",
          onStart: () => console.log(`✨ Line ${index + 1} FADE IN started: "${lineText}"`),
          onComplete: () => console.log(`🌟 Line ${index + 1} FADE IN completed: "${lineText}"`)
        },
        startProgress
      )
      // Fade out
      .to(line,
        { 
          opacity: 0, 
          y: -30,
          scale: 0.9,
          duration: fadeOutDuration,
          ease: "power2.in",
          onStart: () => console.log(`🌅 Line ${index + 1} FADE OUT started: "${lineText}"`),
          onComplete: () => console.log(`💫 Line ${index + 1} FADE OUT completed: "${lineText}"`)
        },
        startProgress + fadeInDuration + stayDuration
      );
    });

    console.log('🎪 LandingSection1: All animations registered');

    return () => {
      console.log('🧹 LandingSection1: Cleaning up ScrollTrigger');
      tl.kill();
    };
  }, []);

  const textLines = [
    {
      text: "Life moves fast.",
      className: "text-display-large font-brand text-white text-shadow-glow",
    },
    {
      text: "Memories fade,",
      className: "text-display-large font-brand text-white-90",
    },
    {
      text: "insights get lost,",
      className: "text-display-large font-brand text-white-90",
    },
    {
      text: "your best ideas feel disconnected",
      className: "text-display-large font-plain text-white-80",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="landing-section-1"
      className="landing-section"
      style={{ minHeight: '150vh' }} // Extra height for better scroll control
    >
      <div className="landing-content text-center">
        <div className="space-y-6 md:space-y-8">
          {textLines.map((line, index) => (
            <div
              key={index}
              ref={el => { textLinesRef.current[index] = el; }}
              className={line.className}
              style={{ 
                opacity: 0, 
                transform: 'translateY(50px) scale(0.9)',
                willChange: 'opacity, transform' // Optimize for animations
              }}
            >
              {line.text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}