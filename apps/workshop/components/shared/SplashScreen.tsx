'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { NrnLogo } from './NrnLogo';
import { useSplash } from './SplashContext';

type Phase = 'entering' | 'moving' | 'done';

const SPLASH_SIZE = 140;
const HEADER_SIZE = 30;

// Ring geometry — drawn around the assembled logo
const RING_R      = 86;
const RING_CENTER = 101;
const RING_SIZE   = RING_CENTER * 2;

export function SplashScreen() {
  const { splashKey, setSplashDone, logoRef } = useSplash();
  const [phase, setPhase] = useState<Phase>('done');
  const controls = useAnimation();

  useEffect(() => {
    if (splashKey === 0) return;

    setPhase('entering');

    const t = setTimeout(async () => {
      setPhase('moving');

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
        scale: HEADER_SIZE / SPLASH_SIZE,
        transition: { duration: 0.58, ease: [0.43, 0.13, 0.23, 0.96] },
      });

      setSplashDone(true);
      setPhase('done');
    }, 2100);

    return () => clearTimeout(t);
  }, [splashKey, controls, logoRef, setSplashDone]);

  if (phase === 'done') return null;

  return (
    <>
      {/* Radial gradient backdrop */}
      <AnimatePresence>
        {phase === 'entering' && (
          <motion.div
            key="ws-bg"
            className="fixed inset-0 z-[100]"
            style={{
              background:
                'radial-gradient(ellipse 72% 72% at 50% 50%, #1d5c40 0%, #081f12 100%)',
            }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.45 } }}
          />
        )}
      </AnimatePresence>

      {/* Morphing rings that draw themselves around the assembling logo */}
      <AnimatePresence>
        {phase === 'entering' && (
          <motion.div
            key="ws-rings"
            className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center"
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <svg
              width={RING_SIZE}
              height={RING_SIZE}
              viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
              fill="none"
              /* rotate so drawing starts from 12 o'clock */
              style={{ position: 'absolute', transform: 'rotate(-90deg)' }}
            >
              {/* Outer faint ring — slow full draw */}
              <motion.circle
                cx={RING_CENTER}
                cy={RING_CENTER}
                r={RING_R + 12}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={0.6}
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{
                  pathLength: 1,
                  transition: { duration: 2.0, delay: 0.0, ease: 'easeInOut' },
                }}
              />
              {/* Primary ring — draws in sync with logo assembly */}
              <motion.circle
                cx={RING_CENTER}
                cy={RING_CENTER}
                r={RING_R}
                stroke="rgba(255,255,255,0.18)"
                strokeWidth={1.0}
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{
                  pathLength: 1,
                  transition: { duration: 1.45, delay: 0.18, ease: [0.4, 0, 0.2, 1] },
                }}
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* "Workshop" label — fades in after logo assembles */}
      <AnimatePresence>
        {phase === 'entering' && (
          <motion.div
            key="ws-label"
            className="pointer-events-none fixed z-[102] flex justify-center"
            style={{ top: `calc(50% + ${SPLASH_SIZE / 2 + 22}px)`, left: 0, right: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
          >
            <motion.p
              className="text-white/45 text-[10px] tracking-[0.38em] uppercase font-light"
              initial={{ opacity: 0, y: 5 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { delay: 1.15, duration: 0.45, ease: 'easeOut' },
              }}
            >
              Workshop
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logo — independently positioned for fly-to-header */}
      <motion.div
        key={`ws-splash-logo-${splashKey}`}
        className="pointer-events-none fixed inset-0 z-[103] flex items-center justify-center"
        initial={{ x: 0, y: 0, scale: 1 }}
        animate={controls}
      >
        <NrnLogo
          size={SPLASH_SIZE}
          splashMode={phase === 'entering'}
          fill="white"
        />
      </motion.div>
    </>
  );
}
