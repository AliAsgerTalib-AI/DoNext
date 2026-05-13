/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Subtask } from '@/src/types';
import { cn } from '@/lib/utils';

interface SubtaskListProps {
  subtasks: Subtask[];
  onChange: (subtasks: Subtask[]) => void;
}

export function SubtaskList({ subtasks, onChange }: SubtaskListProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState('');

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    onChange([...subtasks, { id: crypto.randomUUID(), title: newSubtaskTitle, completed: false }]);
    setNewSubtaskTitle('');
  };

  const removeSubtask = (id: string) => {
    onChange(subtasks.filter(s => s.id !== id));
  };

  const clearSubtasks = () => {
    onChange([]);
  };

  const toggleSubtaskCompletion = (id: string) => {
    onChange(subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between ml-1">
        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subtasks ({subtasks.length})</Label>
        {subtasks.length > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={clearSubtasks} className="h-6 text-[10px] text-slate-400 hover:text-destructive">Clear all</Button>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          placeholder="Add a step..."
          className="rounded-xl border-slate-100 focus-visible:ring-primary/20 h-11"
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
        />
        <Button type="button" size="icon" onClick={addSubtask} className="rounded-xl h-11 w-11 shadow-md shadow-primary/10">
          <Plus className="h-5 w-5" />
        </Button>
      </div>
      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
        <AnimatePresence mode="popLayout">
          {subtasks.map(sub => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={sub.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 group hover:border-primary/20 transition-all shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={sub.completed}
                  onCheckedChange={() => toggleSubtaskCompletion(sub.id)}
                  className="h-4.5 w-4.5 rounded-md"
                />
                <span className={cn(
                  "text-sm font-medium text-slate-700",
                  sub.completed && "line-through text-slate-400"
                )}>{sub.title}</span>
              </div>
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-slate-300 hover:text-destructive transition-colors" onClick={() => removeSubtask(sub.id)}>
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
