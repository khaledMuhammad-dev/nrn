'use client';

import { useEffect, useRef, useState } from 'react';
import { throttle } from 'lodash';

const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const MODAL_DISMISS_MS = 10 * 1000;    // 10 seconds

export function useIdleTimer(onLogout: () => void) {
  const [showIdleModal, setShowIdleModal] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = throttle(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (showIdleModal) return;
    timerRef.current = setTimeout(() => {
      setShowIdleModal(true);
      dismissRef.current = setTimeout(() => {
        onLogout();
      }, MODAL_DISMISS_MS);
    }, IDLE_TIMEOUT_MS);
  }, 1000);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
      if (dismissRef.current) clearTimeout(dismissRef.current);
      resetTimer.cancel();
    };
  }, [showIdleModal]); // eslint-disable-line

  const dismissIdleModal = () => {
    setShowIdleModal(false);
    if (dismissRef.current) clearTimeout(dismissRef.current);
    resetTimer();
  };

  return { showIdleModal, dismissIdleModal };
}
