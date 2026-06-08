'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NrnLogo } from './NrnLogo';

export function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Paths stagger in ~1.1s, hold 0.7s, then exit
    const t = setTimeout(() => setVisible(false), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* Green backdrop — fades out independently */}
      <AnimatePresence>
        {visible && (
          <motion.div
            key="splash-bg"
            className="fixed inset-0 z-[100] bg-[#33835c]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>

      {/* Logo — no exit prop so the wrapper unmounts instantly and the
          layoutId hero animation fires cleanly toward the header logo */}
      <AnimatePresence>
        {visible && (
          <motion.div
            key="splash-logo"
            className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center"
          >
            <NrnLogo size={170} layoutId="nrn-logo" splashMode />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
