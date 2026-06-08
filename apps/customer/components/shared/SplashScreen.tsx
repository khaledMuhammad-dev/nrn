'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NrnLogo } from './NrnLogo';

export function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Paths finish staggering ~1.3s, hold 0.7s, then collapse
    const t = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#33835c]"
          exit={{
            scale: 0.04,
            opacity: 0,
            transition: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] },
          }}
          // Collapse toward the header logo's position (px-4 left, h-14/2 top)
          style={{ transformOrigin: '16px 14px' }}
        >
          <NrnLogo size={170} splashMode />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
