'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { NrnLogo } from './NrnLogo';
import { useSplash } from './SplashContext';

type Phase = 'entering' | 'moving' | 'done';

export function SplashScreen() {
  const { splashKey, setSplashDone, logoRef } = useSplash();
  const [phase, setPhase] = useState<Phase>('done');
  const controls = useAnimation();

  useEffect(() => {
    if (splashKey === 0) return; // never triggered yet

    setPhase('entering');

    const t = setTimeout(async () => {
      setPhase('moving');

      // Read actual header logo position — works regardless of max-width wrapper or RTL
      const rect = logoRef.current?.getBoundingClientRect();
      const targetX = rect
        ? rect.left + rect.width / 2 - window.innerWidth / 2
        : 24 - window.innerWidth / 2;
      const targetY = rect
        ? rect.top + rect.height / 2 - window.innerHeight / 2
        : 28 - window.innerHeight / 2;

      await controls.start({
        x: targetX,
        y: targetY,
        scale: 28 / 170,
        transition: { duration: 0.55, ease: [0.43, 0.13, 0.23, 0.96] },
      });

      setSplashDone(true);
      setPhase('done');
    }, 1800);

    return () => clearTimeout(t);
  }, [splashKey, controls, logoRef, setSplashDone]);

  if (phase === 'done') return null;

  return (
    <>
      {/* Backdrop — fades as logo starts moving */}
      <AnimatePresence>
        {phase === 'entering' && (
          <motion.div
            key="bg"
            className="fixed inset-0 z-[100] bg-[#33835c]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
          />
        )}
      </AnimatePresence>

      {/* Logo stays at z-[101] above the backdrop and flies to exact header position */}
      <motion.div
        key={`splash-logo-${splashKey}`}
        className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center"
        initial={{ x: 0, y: 0, scale: 1 }}
        animate={controls}
      >
        <NrnLogo size={170} splashMode={phase === 'entering'} />
      </motion.div>
    </>
  );
}
