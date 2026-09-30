'use client';

import React, { useEffect, useRef } from 'react';

export default function AnimatedBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Enforce mobile-friendly autoplay attributes
    video.defaultMuted = true;
    video.muted = true;
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('x5-playsinline', 'true');

    const attemptPlay = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser blocked initial autoplay, start immediately on first touch/interaction
          const triggerPlay = () => {
            video.play().catch(() => {});
            window.removeEventListener('touchstart', triggerPlay);
            window.removeEventListener('click', triggerPlay);
            window.removeEventListener('scroll', triggerPlay);
          };
          window.addEventListener('touchstart', triggerPlay, { once: true, passive: true });
          window.addEventListener('click', triggerPlay, { once: true, passive: true });
          window.addEventListener('scroll', triggerPlay, { once: true, passive: true });
        });
      }
    };

    if (video.readyState >= 2) {
      attemptPlay();
    } else {
      video.addEventListener('loadeddata', attemptPlay, { once: true });
      video.addEventListener('canplay', attemptPlay, { once: true });
    }
  }, []);

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-[#080510]"
      aria-hidden="true"
    >
      {/* Animated MP4 Video Background */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover object-center pointer-events-none opacity-70 sm:opacity-80 transition-opacity duration-1000"
        tabIndex={-1}
      >
        <source src="/video/background.mp4" type="video/mp4" />
      </video>

      {/* Subtle Purple / Sakura Vignette Overlay - Keeps text clear while preserving video visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080510]/60 via-[#0d0922]/50 to-[#080510]/80 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_#080510_100%)] opacity-60 pointer-events-none" />
    </div>
  );
}
