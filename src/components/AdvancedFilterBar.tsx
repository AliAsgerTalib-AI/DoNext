/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Priority } from '@/src/types';

export interface AdvancedFilters {
  dateFrom?: string;
  dateTo?: string;
  priorities?: Priority[];
}

interface AdvancedFilterBarProps {
  filters: AdvancedFilters;
  onChange: (filters: AdvancedFilters) => void;
  onClear: () => void;
  isVisible: boolean;
}

export const AdvancedFilterBar = React.memo(({ filters, onChange, onClear, isVisible }: AdvancedFilterBarProps) => {
  const handlePriorityToggle = (priority: Priority) => {
    const current = filters.priorities || [];
    const updated = current.includes(priority)
      ? current.filter(p => p !== priority)
      : [...current, priority];
    onChange({ ...filters, priorities: updated.length > 0 ? updated : undefined });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="px-4 py-4 bg-slate-50/50 border-b border-slate-100/50 space-y-4">
            <div className="flex gap-6 items-end">
              {/* Date Range Section */}
              <div className="flex gap-3 items-end">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block ml-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(e) => onChange({ ...filters, dateFrom: e.target.value || undefined })}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block ml-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(e) => onChange({ ...filters, dateTo: e.target.value || undefined })}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              {/* Priority Section */}
              <div className="space-y-1 flex-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block ml-1">
                  Priorities
                </label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map(priority => (
                    <button
                      key={priority}
                      onClick={() => handlePriorityToggle(priority)}
                      className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${
                        (filters.priorities || []).includes(priority)
                          ? priority === 'low'
                            ? 'bg-emerald-100 border border-emerald-300 text-emerald-700'
                            : priority === 'medium'
                            ? 'bg-amber-100 border border-amber-300 text-amber-700'
                            : 'bg-rose-100 border border-rose-300 text-rose-700'
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={onClear}
                className="rounded-lg h-10 px-4 text-xs font-bold hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

AdvancedFilterBar.displayName = 'AdvancedFilterBar';
