/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { Clock, ArrowRight, Trash2, Pencil, MoreVertical, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Task, Category, Priority } from '@/src/types';
import { cn } from '@/lib/utils';
import { useSwipeGesture } from '@/src/hooks/useSwipeGesture';

interface TaskRowProps {
  task: Task;
  tasks: Task[];
  categories: Category[];
  toggleTask: (id: string) => void;
  carryforwardTask: (id: string) => void;
  deleteTask: (id: string) => void;
  setEditingTask: (task: Task | null) => void;
  setIsDialogOpen: (open: boolean) => void;
  getPriorityColor: (priority: Priority) => string;
  onOpenBlockingTask?: (taskId: string) => void;
}

export const TaskRow = React.memo(({
  task,
  tasks,
  categories,
  toggleTask,
  carryforwardTask,
  deleteTask,
  setEditingTask,
  setIsDialogOpen,
  getPriorityColor,
  onOpenBlockingTask,
}: TaskRowProps) => {
  const isBlocked = task.dependencyIds && task.dependencyIds.some(id => {
    const dep = tasks.find(t => t.id === id);
    return dep && !dep.completed;
  });

  const blockingTasks = (task.dependencyIds ?? [])
    .map(id => tasks.find(t => t.id === id))
    .filter((t): t is Task => !!t && !t.completed);

  const blockedByThis = tasks.filter(t =>
    t.dependencyIds?.includes(task.id) ?? false
  );

  const category = categories.find(c => c.id === task.category);

  const [showActions, setShowActions] = React.useState(false);
  const { x, background, dragProps } = useSwipeGesture(
    () => toggleTask(task.id),
    () => deleteTask(task.id)
  );

  const handleOutsideClick = React.useCallback((e: MouseEvent) => {
    if (showActions && !(e.target as Element).closest('[data-action-menu]')) {
      setShowActions(false);
    }
  }, [showActions]);

  React.useEffect(() => {
    if (showActions) {
      document.addEventListener('click', handleOutsideClick);
      return () => document.removeEventListener('click', handleOutsideClick);
    }
  }, [showActions, handleOutsideClick]);

  const renderTaskContent = () => (
    <>
      {/* Radio Button Style Toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
        className={cn(
          "w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center shrink-0",
          task.completed
            ? "bg-primary border-primary"
            : "border-slate-300 group-hover:border-primary/50"
        )}
      >
        {task.completed && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
      </button>

      <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => { setEditingTask(task); setIsDialogOpen(true); }}
        >
          <div className="flex items-center gap-2">
            <h3 className={cn(
              "font-bold text-[12px] text-slate-800 truncate py-0.5",
              task.completed && "line-through text-slate-400"
            )}>
              {task.title}
            </h3>

            <div className="flex items-center gap-2 shrink-0">
              {task.dueTime && (
                <div className="flex items-center text-[9px] font-black uppercase text-slate-400 tabular-nums">
                  <Clock className="w-2.5 h-2.5 mr-0.5 opacity-50" />
                  {task.dueTime}
                </div>
              )}
              {blockingTasks.length > 0 && !task.completed && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenBlockingTask?.(blockingTasks[0].id);
                  }}
                  className="hover:opacity-80 transition-opacity"
                  title={`Blocked by: ${blockingTasks.map(t => t.title).join(', ')}`}
                >
                  <Badge variant="outline" className="h-4 px-1 text-[7px] font-black uppercase tracking-tighter text-amber-600 border-amber-200 bg-amber-50">
                    Blocked by {blockingTasks[0].title.substring(0, 8)}
                  </Badge>
                </button>
              )}
              {blockedByThis.length > 0 && (
                <Badge
                  variant="outline"
                  className="h-4 px-1 text-[7px] font-black uppercase tracking-tighter text-sky-600 border-sky-200 bg-sky-50"
                  title={`Blocks: ${blockedByThis.map(t => t.title).join(', ')}`}
                >
                  Blocks {blockedByThis.length}
                </Badge>
              )}
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: category?.color }}
                title={category?.name}
              />
            </div>
          </div>
        </div>

        {/* Desktop Actions - Hover Reveal */}
        <div className="hidden md:flex items-center gap-1">
          {!task.completed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-slate-400 hover:text-primary hover:bg-primary/5"
              title="Carry forward"
              onClick={(e) => {
                e.stopPropagation();
                carryforwardTask(task.id);
              }}
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-slate-400 hover:text-destructive hover:bg-destructive/5"
            onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-slate-400"
            onClick={(e) => { e.stopPropagation(); setEditingTask(task); setIsDialogOpen(true); }}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Mobile Actions Menu */}
        <div className="md:hidden relative" data-action-menu>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-slate-400"
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>

          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute right-0 top-8 z-50 flex flex-col bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden min-w-[120px]"
                data-action-menu
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTask(task.id);
                    setShowActions(false);
                  }}
                  className="px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Complete
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingTask(task);
                    setIsDialogOpen(true);
                    setShowActions(false);
                  }}
                  className="px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2 border-t border-slate-100"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                    setShowActions(false);
                  }}
                  className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );

  return (
    <AnimatePresence>
      {!task.completed ? (
        <motion.div
          key={task.id}
          initial={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          layout
        >
          <motion.div
            style={{ x, background }}
            {...dragProps}
            className="group flex items-center gap-3 py-2 px-1 border-b border-slate-100/60 transition-colors duration-150 hover:bg-slate-50/50 relative overflow-hidden"
          >
            {/* Swipe Reveal - Complete (right) */}
            <motion.div
              className="absolute left-0 top-0 bottom-0 w-full bg-emerald-500 flex items-center justify-start pl-4 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: (x.get() as number) > 20 ? 1 : 0 }}
            >
              <Check className="w-5 h-5 text-white" />
            </motion.div>

            {/* Swipe Reveal - Delete (left) */}
            <motion.div
              className="absolute right-0 top-0 bottom-0 w-full bg-red-500 flex items-center justify-end pr-4 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: (x.get() as number) < -20 ? 1 : 0 }}
            >
              <Trash2 className="w-5 h-5 text-white" />
            </motion.div>

            {/* Content - Relative positioning so it stays above swipe reveals */}
            <div className="relative z-10 flex items-center gap-3 flex-1 min-w-0">
              {renderTaskContent()}
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key={task.id}
          initial={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          layout
          className="group flex items-center gap-3 py-2 px-1 border-b border-slate-100/60 transition-colors duration-150 hover:bg-slate-50/50 opacity-50 grayscale"
        >
          {renderTaskContent()}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

TaskRow.displayName = 'TaskRow';
