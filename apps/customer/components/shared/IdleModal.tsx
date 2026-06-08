'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

interface IdleModalProps {
  show: boolean;
  onDismiss: () => void;
  onLogout: () => void;
}

export function IdleModal({ show, onDismiss, onLogout }: IdleModalProps) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="mx-4 max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl dark:bg-gray-900"
          >
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-amber-100 p-4">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
            </div>
            <h2 className="mb-2 text-xl font-bold">{t('idle.title')}</h2>
            <p className="mb-1 text-gray-600 dark:text-gray-400">{t('idle.message')}</p>
            <p className="mb-6 text-sm text-gray-500">{t('idle.redirect')}</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onDismiss}>
                {t('idle.stayLoggedIn')}
              </Button>
              <Button variant="destructive" className="flex-1" onClick={onLogout}>
                {t('idle.logout')}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
