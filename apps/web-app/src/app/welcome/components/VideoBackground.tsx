'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

export type ActiveVideo = 'cloud' | 'ascension' | 'interstellar' | 'graph' | 'artifact_demo' | 'none';
let currentActiveVideo: ActiveVideo = 'cloud'; // Module-level variable to track

// Function to be called by sections to set the active video
export const setActiveVideoType = (videoType: ActiveVideo, targetSectionId: string) => {
  console.log(`Video change requested by ${targetSectionId}: ${videoType}`);
};

export default function VideoBackground() {
  const cloudVideoRef = useRef<HTMLVideoElement>(null);
  const ascensionVideoRef = useRef<HTMLVideoElement>(null);
  const interstellarVideoRef = useRef<HTMLVideoElement>(null);
  const graphVideoRef = useRef<HTMLVideoElement>(null);
  const artifactDemoVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoRefs = {
      cloud: cloudVideoRef,
      ascension: ascensionVideoRef,
      interstellar: interstellarVideoRef,
      graph: graphVideoRef,
      artifact_demo: artifactDemoVideoRef,
    };

    const videos = [
      cloudVideoRef.current,
      ascensionVideoRef.current,
      interstellarVideoRef.current,
      graphVideoRef.current,
      artifactDemoVideoRef.current,
    ].filter(Boolean) as HTMLVideoElement[];

    if (videos.length < 5) return; // Wait for all refs

    const setupVideo = (video: HTMLVideoElement) => {
      video.muted = true;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      video.load();
    };
    videos.forEach(setupVideo);

    const startCloudVideo = async () => {
        if (cloudVideoRef.current) {
            try {
                await cloudVideoRef.current.play();
                gsap.to(cloudVideoRef.current, { opacity: 1, duration: 0.5 });
                console.log('Cloud video started and visible');
            } catch (error) {
                console.warn('Cloud video autoplay was blocked.', error);
                const playOnClick = async () => {
                    try {
                        if(cloudVideoRef.current) await cloudVideoRef.current.play();
                        gsap.to(cloudVideoRef.current, { opacity: 1, duration: 0.5 });
                    } catch(e) { console.warn("Play on click failed", e)}
                    document.removeEventListener('click', playOnClick);
                    document.removeEventListener('scroll', playOnClick);
                };
                document.addEventListener('click', playOnClick, { once: true });
                document.addEventListener('scroll', playOnClick, { once: true });
            }
        }
    };
    startCloudVideo();

    const switchVideo = (targetVideoType: ActiveVideo) => {
      if (currentActiveVideo === targetVideoType) return;
      console.log(`Switching video to: ${targetVideoType}`);

      Object.entries(videoRefs).forEach(([type, ref]) => {
        const videoEl = ref.current;
        if (videoEl) {
          const targetOpacity = type === targetVideoType ? 1 : 0;
          gsap.to(videoEl, { opacity: targetOpacity, duration: 0.7, ease: 'power1.inOut' });
          if (type === targetVideoType) {
            if (type !== 'ascension') {
                ensureVideoPlayed(videoEl);
            }
          } else {
            if (!videoEl.loop) videoEl.currentTime = 0;
            if (type !== 'ascension') videoEl.pause();
          }
        }
      });
      currentActiveVideo = targetVideoType;
    };

    // Scroll Triggers for video changes
    ScrollTrigger.create({
      trigger: "#landing-section-1",
      start: "top bottom",
      endTrigger: "#landing-section-2",
      end: "bottom top",
      onEnter: () => switchVideo('cloud'),
      onEnterBack: () => switchVideo('cloud'),
    });

    ScrollTrigger.create({
      trigger: "#landing-section-3",
      start: "top bottom",
      end: "bottom top",
      onEnter: () => switchVideo('ascension'),
      onEnterBack: () => switchVideo('ascension'),
      scrub: 0.5,
      onUpdate: (self: ScrollTrigger) => {
        if (ascensionVideoRef.current && ascensionVideoRef.current.duration && currentActiveVideo === 'ascension') {
          const progress = self.progress;
          ascensionVideoRef.current.currentTime = Math.min(progress * ascensionVideoRef.current.duration, ascensionVideoRef.current.duration - 0.01);
        }
      },
    });

    ScrollTrigger.create({
      trigger: "#landing-section-4",
      start: "top bottom",
      end: "bottom top",
      onEnter: () => switchVideo('interstellar'),
      onEnterBack: () => switchVideo('interstellar'),
      scrub: 1,
      onUpdate: (self: ScrollTrigger) => {
        if (interstellarVideoRef.current && currentActiveVideo === 'interstellar') {
            ensureVideoPlayed(interstellarVideoRef.current);
            const velocity = Math.abs(self.getVelocity() / 500);
            interstellarVideoRef.current.playbackRate = gsap.utils.clamp(0.5, 3, 1 + velocity);
        }
      },
      onLeave: () => interstellarVideoRef.current && (interstellarVideoRef.current.playbackRate = 1),
      onLeaveBack: () => interstellarVideoRef.current && (interstellarVideoRef.current.playbackRate = 1),
    });
    
    ScrollTrigger.create({
        trigger: "#landing-section-4-5",
        start: "top center",
        end: "bottom center",
        onEnter: () => switchVideo('graph'),
        onEnterBack: () => switchVideo('graph'),
    });

    ScrollTrigger.create({
      trigger: "#landing-section-5",
      start: "top bottom",
      end: "bottom top",
      onEnter: () => switchVideo('artifact_demo'),
      onEnterBack: () => switchVideo('artifact_demo'),
    });

    ScrollTrigger.create({
      trigger: "#landing-section-6",
      start: "top bottom",
      end: "bottom top",
      onEnter: () => switchVideo('cloud'),
      onEnterBack: () => switchVideo('cloud'),
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger: ScrollTrigger) => trigger.kill());
    };
  }, []);

  const ensureVideoPlayed = async (videoEl: HTMLVideoElement | null) => {
    if (videoEl && videoEl.paused) {
      try {
        await videoEl.play();
      } catch (error) {
        console.warn(`Video play interrupted or failed for ${videoEl.dataset.video}:`, error);
      }
    }
  };

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <video ref={cloudVideoRef} className="landing-video-background" loop playsInline data-video="cloud" style={{ opacity: 1 }}>
        <source src="/videos/cloud1.mp4" type="video/mp4" />
      </video>
      <video ref={ascensionVideoRef} className="landing-video-background" playsInline data-video="ascension" style={{ opacity: 0 }}>
        <source src="/videos/cloud2.mp4" type="video/mp4" />
      </video>
      <video ref={interstellarVideoRef} className="landing-video-background" loop playsInline data-video="interstellar" style={{ opacity: 0 }}>
        <source src="/videos/star1.mp4" type="video/mp4" />
      </video>
      <video ref={graphVideoRef} className="landing-video-background" loop playsInline data-video="graph" style={{ opacity: 0 }}>
        <source src="/videos/cloud3.mp4" type="video/mp4" />
      </video>
      <video ref={artifactDemoVideoRef} className="landing-video-background" loop playsInline data-video="artifact_demo" style={{ opacity: 0 }}>
        <source src="/videos/cloud4.mp4" type="video/mp4" />
      </video>
    </div>
  );
} 