import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function BottomSheet({ open, onClose, children, title }: BottomSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg z-50 max-h-[80vh] flex flex-col"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1 w-12 bg-slate-300 rounded-full" />
            </div>

            {/* Header */}
            {title && (
              <div className="px-6 py-3 border-b border-slate-100">
                <h2 className="font-semibold text-lg text-slate-900">{title}</h2>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
