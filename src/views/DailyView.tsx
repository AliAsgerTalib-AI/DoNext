/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { 
  Clock, 
  Trash2,
  ChevronRight,
  History,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  format, 
  eachHourOfInterval,
  startOfDay,
  endOfDay,
  isSameDay, 
  addDays 
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Task, Category } from '@/src/types';
import { cn } from '@/lib/utils';

interface DailyViewProps {
  tasks: Task[];
  categories: Category[];
  selectedDailyDate: Date;
  setSelectedDailyDate: (date: Date) => void;
  toggleTask: (id: string) => void;
  carryforwardTask: (id: string) => void;
  deleteTask: (id: string) => void;
  setEditingTask: (task: Task | null) => void;
  setIsDialogOpen: (open: boolean) => void;
}

export const DailyView = React.memo(({
  tasks,
  categories,
  selectedDailyDate,
  setSelectedDailyDate,
  toggleTask,
  carryforwardTask,
  deleteTask,
  setEditingTask,
  setIsDialogOpen
}: DailyViewProps) => {
  const today = selectedDailyDate;
  const todayStr = React.useMemo(() => format(today, 'yyyy-MM-dd'), [today]);
  
  const hours = React.useMemo(() => eachHourOfInterval({
    start: startOfDay(today),
    end: endOfDay(today)
  }), [today]);

  const dayTasks = React.useMemo(() => tasks.filter(t => t.dueDate === todayStr), [tasks, todayStr]);
  const timedTasks = React.useMemo(() => dayTasks.filter(t => t.dueTime), [dayTasks]);
  const untimedTasks = React.useMemo(() => dayTasks.filter(t => !t.dueTime), [dayTasks]);

  // Auto-scroll to current hour on mount and when date changes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (isSameDay(today, new Date())) {
        const currentHour = new Date().getHours();
        const element = document.getElementById(`daily-hour-${currentHour}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [today]);

  const getPriorityBadge = (priority: string) => {
    const badges: Record<string, { icon: string; color: string }> = {
      high: { icon: '⚡', color: 'text-red-600 bg-red-50 border-red-200' },
      medium: { icon: '◆', color: 'text-amber-600 bg-amber-50 border-amber-200' },
      low: { icon: '○', color: 'text-slate-500 bg-slate-50 border-slate-200' },
    };
    return badges[priority] || badges.medium;
  };

  return (
    <div className="flex-1 flex flex-col gap-6 animate-in fade-in duration-500 min-h-0">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex flex-col">
          <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight">
            {format(today, 'EEEE, MMM do')}
          </h2>
          <p className="text-xs font-bold text-primary mt-1 uppercase tracking-widest">Daily Schedule</p>
        </div>
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedDailyDate(addDays(today, -1))}>
            <ChevronRight className="w-4 h-4 rotate-180" />
          </Button>
          <Button variant="ghost" className="h-8 text-xs font-bold" onClick={() => setSelectedDailyDate(new Date())}>
            Today
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedDailyDate(addDays(today, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Sticky All-Day Tasks Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "sticky top-0 z-10 border rounded-xl p-4 shadow-sm backdrop-blur-sm transition-colors",
          untimedTasks.length > 0
            ? "bg-gradient-to-b from-blue-50/95 to-blue-50/90 border-blue-200"
            : "bg-gradient-to-b from-slate-50/95 to-slate-50/90 border-slate-200 cursor-pointer hover:border-primary/30 hover:from-primary/5"
        )}
        onClick={() => {
          // Only trigger if no untimed tasks (empty state)
          if (untimedTasks.length === 0) {
            const newTask: Partial<Task> = {
              dueDate: todayStr,
            };
            setEditingTask(newTask as Task);
            setIsDialogOpen(true);
          }
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className={cn(
            "p-1.5 rounded-lg",
            untimedTasks.length > 0 ? "bg-blue-100" : "bg-slate-100"
          )}>
            <Clock className={cn(
              "w-4 h-4",
              untimedTasks.length > 0 ? "text-blue-600" : "text-slate-600"
            )} />
          </div>
          <h3 className={cn(
            "text-sm font-black uppercase tracking-tight",
            untimedTasks.length > 0 ? "text-blue-900" : "text-slate-600"
          )}>
            {untimedTasks.length > 0 ? "All-Day Tasks" : "Add All-Day Task"}
          </h3>
          {untimedTasks.length > 0 && (
            <span className="ml-auto text-xs font-bold text-blue-700 bg-white px-2 py-1 rounded-full">
              {untimedTasks.length}
            </span>
          )}
        </div>

          <div className="flex flex-wrap gap-2">
            {untimedTasks.map(task => {
              const category = categories.find(c => c.id === task.category);
              const badgeConfig = getPriorityBadge(task.priority);

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group/task flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 hover:border-primary/30 hover:shadow-md transition-all max-w-xs"
                >
                  {/* Priority Badge */}
                  <span className={cn(
                    "text-lg font-black shrink-0",
                    badgeConfig.color.split(' ')[0]
                  )}>
                    {badgeConfig.icon}
                  </span>

                  {/* Checkbox */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                    className={cn(
                      "w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center shrink-0",
                      task.completed
                        ? "bg-primary border-primary"
                        : "border-slate-300 group-hover/task:border-primary/50"
                    )}
                  >
                    {task.completed && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </button>

                  {/* Task Title & Category */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => { setEditingTask(task); setIsDialogOpen(true); }}
                  >
                    <h4 className={cn(
                      "text-sm font-bold text-slate-800 truncate",
                      task.completed && "line-through text-slate-400"
                    )}>
                      {task.title}
                    </h4>
                  </div>

                  {/* Category Dot */}
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: category?.color }}
                    title={category?.name}
                  />

                  {/* Delete Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-slate-400 hover:text-destructive hover:bg-destructive/10 shrink-0 opacity-0 group-hover/task:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      <ScrollArea className="flex-1 bg-white border border-slate-100 rounded-2xl shadow-sm min-h-0">
        <div className="p-6 space-y-0 relative">
          {hours.map((hour, idx) => {
            const hourInt = hour.getHours();
            const hourTasks = timedTasks.filter(t => t.dueTime?.startsWith(format(hour, 'HH:')));
            const hourStr = format(hour, 'HH:00');

            const handleHourClick = (e: React.MouseEvent) => {
              // Check if we're clicking on a task - if so, don't open new task form
              const target = e.target as HTMLElement;
              if (target.closest('.daily-task-item')) {
                return;
              }

              // Open form to create new task
              // Don't set editingTask (keep it null) so form knows this is a NEW task
              setEditingTask(null);
              setIsDialogOpen(true);

              // Store the hour info for the form to use
              // We'll pass this via App state in the next step
            };

            return (
              <div
                key={hourInt}
                id={`daily-hour-${hourInt}`}
                className="daily-hour-slot flex group min-h-[80px] border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors cursor-pointer"
                onClick={handleHourClick}
              >
                <div className="w-20 pt-3 pr-4 text-right">
                  <span className="text-[11px] font-black text-slate-500 group-hover:text-primary transition-colors">
                    {format(hour, 'ha')}
                  </span>
                </div>
                <div className="flex-1 py-2 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-200" />
                  <div className="pl-4 space-y-1.5">
                    {hourTasks.map(task => {
                      const category = categories.find(c => c.id === task.category);
                      return (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={cn(
                            "daily-task-item group/task flex items-center gap-3 py-1.5 px-2 border-b border-slate-50 transition-all hover:bg-slate-50/50",
                            task.completed && "opacity-50 grayscale"
                          )}
                        >
                          {/* Radio Button Style Toggle */}
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                            className={cn(
                              "w-3.5 h-3.5 rounded-full border-2 transition-all flex items-center justify-center shrink-0",
                              task.completed 
                                ? "bg-primary border-primary" 
                                : "border-slate-300 group-hover/task:border-primary/50"
                            )}
                          >
                            {task.completed && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </button>

                          <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                            <div
                              className="flex-1 min-w-0 cursor-pointer"
                              onClick={(e) => { e.stopPropagation(); setEditingTask(task); setIsDialogOpen(true); }}
                            >
                              <div className="flex items-center gap-2">
                                <h4 className={cn(
                                  "text-[12px] font-bold text-slate-800 truncate",
                                  task.completed && "line-through text-slate-400"
                                )}>
                                  {task.title}
                                </h4>
                                <div 
                                  className="w-1.5 h-1.5 rounded-full shrink-0" 
                                  style={{ backgroundColor: category?.color }} 
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-0.5 opacity-0 group-hover/task:opacity-100 transition-opacity">
                              {!task.completed && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 text-slate-400 hover:text-primary hover:bg-primary/10" 
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
                                className="h-6 w-6 text-slate-400 hover:text-destructive hover:bg-destructive/10" 
                                onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

        </div>
      </ScrollArea>
    </div>
  );
});

DailyView.displayName = 'DailyView';
