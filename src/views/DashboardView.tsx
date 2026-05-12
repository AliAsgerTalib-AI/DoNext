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
} from 'lucide-react';
import { motion } from 'motion/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Task, Category, Priority } from '@/src/types';
import { TaskRow } from '@/src/components/TaskRow';
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
  getPriorityColor
}: DashboardViewProps) => {
  const parentRef = React.useRef<HTMLDivElement>(null);

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

  return (
    <div className="flex-1 m-0 flex flex-col gap-4 overflow-hidden animate-in fade-in duration-500">
      {/* Mobile Stats Cards */}
      <div className="grid grid-cols-4 gap-2 lg:hidden px-0">
        <StatCard icon={Clock} label="Active" value={stats.pending} color="blue" />
        <StatCard icon={CheckCircle2} label="Done" value={stats.completed} color="green" />
        <StatCard icon={AlertCircle} label="Overdue" value={stats.overdue} color="red" />
        <StatCard icon={Lock} label="Blocked" value={stats.blocked} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Task List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-end justify-between">
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
            className="h-[550px] overflow-auto pr-4 animate-in fade-in duration-500"
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
              <div className="text-center py-20 text-slate-300 italic text-[11px] font-bold uppercase tracking-widest bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-100 mt-4">
                No tasks pending...
              </div>
            )}
          </div>
        </div>

        {/* Watch Section */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-display font-black text-slate-900 tracking-tight">Watch</h2>
          </div>
          
          <Card className="border-slate-100 shadow-sm bg-primary/5 border-primary/10 h-[520px]">
            <CardContent className="p-4 flex flex-col h-full">
              <ScrollArea className="flex-1 pr-2">
                <div className="space-y-3">
                  {watchedTasks.length > 0 ? (
                    watchedTasks.map(task => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="group bg-white rounded-xl p-3 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
                        onClick={() => { setEditingTask(task); setIsDialogOpen(true); }}
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-black text-slate-800 line-clamp-1">{task.title}</h4>
                          <span className={cn(
                            "text-[10px] font-bold text-slate-400 shrink-0",
                            task.dueDate && new Date(task.dueDate) < new Date() && !task.completed && "text-rose-500"
                          )}>
                            {task.dueDate ? task.dueDate : 'No date'}
                          </span>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center text-slate-300">
                      <Eye className="w-8 h-8 mb-2 opacity-30" />
                      <p className="text-[10px] font-bold uppercase tracking-wider">No watched tasks</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
});
