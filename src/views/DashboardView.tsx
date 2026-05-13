/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import {
  Eye,
  Link,
  CheckCircle2,
  AlertCircle,
  Clock,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Task, Category, Priority } from '@/src/types';
import { TaskRow } from '@/src/components/TaskRow';
import { WatchedTasksList } from '@/src/components/WatchedTasksList';
import { cn } from '@/lib/utils';

interface DashboardViewProps {
  tasks: Task[];
  filteredTasks: Task[];
  watchedTasks: Task[];
  categories: Category[];
  activeCategory: string;
  activeFilter: string;
  setActiveFilter: (filter: any) => void;
  toggleTask: (id: string) => void;
  carryforwardTask: (id: string) => void;
  deleteTask: (id: string) => void;
  setEditingTask: (task: Task | null) => void;
  setIsDialogOpen: (open: boolean) => void;
  getPriorityColor: (priority: Priority) => string;
  onNavigateToDailyView?: (date: Date) => void;
}

const TASK_ROW_HEIGHT = 44;

const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-100 text-blue-600',
    green: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    red: 'bg-red-50 border-red-100 text-red-600',
    amber: 'bg-amber-50 border-amber-100 text-amber-600',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-2 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <Icon className="w-4 h-4 mb-1 opacity-70" />
      <span className="text-lg font-black">{value}</span>
      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
    </div>
  );
};

export const DashboardView = React.memo(({
  tasks,
  filteredTasks,
  watchedTasks,
  categories,
  activeCategory,
  activeFilter,
  setActiveFilter,
  toggleTask,
  carryforwardTask,
  deleteTask,
  setEditingTask,
  setIsDialogOpen,
  getPriorityColor,
  onNavigateToDailyView
}: DashboardViewProps) => {
  const parentRef = React.useRef<HTMLDivElement>(null);
  const [isWatchListOpen, setIsWatchListOpen] = React.useState(false);

  const virtualizer = useVirtualizer({
    count: filteredTasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => TASK_ROW_HEIGHT,
    overscan: 5,
  });

  // Calculate stats from all tasks
  const todayStr = new Date().toISOString().split('T')[0];
  const stats = React.useMemo(() => {
    const pending = tasks.filter(t => !t.completed).length;
    const completed = tasks.filter(t => t.completed).length;
    const overdue = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr).length;
    const blocked = tasks.filter(t => {
      if (!t.dependencyIds || t.dependencyIds.length === 0) return false;
      return t.dependencyIds.some(depId => {
        const dep = tasks.find(d => d.id === depId);
        return dep && !dep.completed;
      });
    }).length;
    return { pending, completed, overdue, blocked };
  }, [tasks]);

  const getUrgencyBadge = (dueDate: string | null) => {
    if (!dueDate) return { color: 'bg-slate-100 text-slate-600', icon: '○', label: 'No date' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = parseISO(dueDate);
    const daysLeft = differenceInDays(due, today);

    if (daysLeft < 0) {
      return { color: 'bg-red-100 text-red-700', icon: '🔴', label: 'OVERDUE', days: 0 };
    } else if (daysLeft === 0) {
      return { color: 'bg-red-100 text-red-700', icon: '🔴', label: 'TODAY', days: 0 };
    } else if (daysLeft <= 2) {
      return { color: 'bg-red-100 text-red-700', icon: '🔴', label: `in ${daysLeft}d`, days: daysLeft };
    } else if (daysLeft <= 7) {
      return { color: 'bg-amber-100 text-amber-700', icon: '🟡', label: `in ${daysLeft}d`, days: daysLeft };
    } else {
      return { color: 'bg-emerald-100 text-emerald-700', icon: '🟢', label: `in ${daysLeft}d`, days: daysLeft };
    }
  };

  return (
    <div className="flex-1 m-0 flex flex-col lg:flex-row gap-0 overflow-hidden animate-in fade-in duration-500">
      {/* Main Content - Left Side */}
      <div className="flex-1 flex flex-col gap-0 overflow-hidden min-w-0">
        {/* Mobile Stats Cards */}
        <div className="grid grid-cols-4 gap-2 lg:hidden">
          <StatCard icon={Clock} label="Active" value={stats.pending} color="blue" />
          <StatCard icon={CheckCircle2} label="Done" value={stats.completed} color="green" />
          <StatCard icon={AlertCircle} label="Overdue" value={stats.overdue} color="red" />
          <StatCard icon={Lock} label="Blocked" value={stats.blocked} color="amber" />
        </div>

        <div className="space-y-3">
          <div className="flex items-end justify-between gap-2">
            <div className="space-y-1">
              <h2 className="text-2xl font-display font-black text-slate-900 tracking-tight">Today's Focus</h2>
              <p className="text-slate-400 font-bold text-[10px] tracking-widest uppercase">
                {activeCategory === 'all' ? 'All Tasks' : (activeCategory === 'smart' ? 'Smart Folder' : categories.find(c => c.id === activeCategory)?.name)}
                {' • '}
                {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
              </p>
            </div>

            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-2 px-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'completed', label: 'Done' },
                { value: 'urgent', label: 'Urgent' },
                { value: 'blocked', label: 'Blocked' },
                { value: 'overdue', label: 'Overdue' },
                { value: 'unscheduled', label: 'Unsched.' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setActiveFilter(value)}
                  className={cn(
                    'shrink-0 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight transition-all whitespace-nowrap',
                    activeFilter === value
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div
            ref={parentRef}
            className="flex-1 overflow-auto pr-4 animate-in fade-in duration-500"
          >
            {filteredTasks.length > 0 ? (
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {virtualizer.getVirtualItems().map(virtualRow => (
                  <div
                    key={virtualRow.key}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                      height: `${TASK_ROW_HEIGHT}px`,
                    }}
                  >
                    <TaskRow
                      task={filteredTasks[virtualRow.index]}
                      tasks={tasks}
                      categories={categories}
                      toggleTask={toggleTask}
                      carryforwardTask={carryforwardTask}
                      deleteTask={deleteTask}
                      setEditingTask={setEditingTask}
                      setIsDialogOpen={setIsDialogOpen}
                      getPriorityColor={getPriorityColor}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-300 italic text-[11px] font-bold uppercase tracking-widest bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-100">
                No tasks pending...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Watched Tasks - Right Side Panel */}
      <div className="hidden lg:flex flex-col w-80 border-l border-slate-100 bg-white overflow-hidden">
        {/* Header */}
        <button
          onClick={() => onNavigateToDailyView?.(new Date())}
          className="shrink-0 sticky top-0 z-20 bg-white border-b border-slate-100 p-4 hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-black text-slate-900">Watched</h3>
            <span className="ml-auto text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
              {watchedTasks.length}
            </span>
          </div>
        </button>

        {/* List Content */}
        <WatchedTasksList
          tasks={watchedTasks}
          onNavigateToDailyView={onNavigateToDailyView}
          onOpenTask={(task) => { setEditingTask(task); setIsDialogOpen(true); }}
        />
      </div>

      {/* Mobile Watch Button */}
      <motion.button
        onClick={() => setIsWatchListOpen(!isWatchListOpen)}
        className="lg:hidden fixed bottom-24 right-4 z-20 h-10 px-3 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center gap-2 hover:bg-primary/20 transition-colors"
        whileHover={{ scale: 1.05 }}
      >
        <Eye className="w-3.5 h-3.5" />
        {watchedTasks.length > 0 && <span className="font-black">{watchedTasks.length}</span>}
      </motion.button>

      {/* Mobile Watch Modal */}
      <AnimatePresence>
        {isWatchListOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsWatchListOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[60vh] flex flex-col"
            >
              <button
                onClick={() => {
                  onNavigateToDailyView?.(new Date());
                  setIsWatchListOpen(false);
                }}
                className="sticky top-0 bg-white border-b border-slate-100 p-4 rounded-t-2xl hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-black text-slate-900">Watched Tasks</h3>
                  <span className="ml-auto text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {watchedTasks.length}
                  </span>
                </div>
              </button>

              <WatchedTasksList
                tasks={watchedTasks}
                onNavigateToDailyView={onNavigateToDailyView}
                onOpenTask={(task) => { setEditingTask(task); setIsDialogOpen(true); }}
                onCloseModal={() => setIsWatchListOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
