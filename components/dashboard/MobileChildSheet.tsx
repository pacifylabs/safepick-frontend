"use client";

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChildDetailPanel } from '@/components/dashboard/ChildDetailPanel';

interface MobileChildSheetProps {
  childId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MobileChildSheet({ childId, isOpen, onClose }: MobileChildSheetProps) {
  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
          />

          {/* SHEET */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white z-[61] lg:hidden rounded-t-[20px] shadow-2xl max-h-[85vh] flex flex-col"
          >
            {/* DRAG HANDLE */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 bg-[rgba(11,26,44,0.12)] rounded-full" />
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-hidden">
              {childId && (
                <ChildDetailPanel childId={childId} onClose={onClose} />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
