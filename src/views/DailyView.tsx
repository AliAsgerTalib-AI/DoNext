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

      <ScrollArea className="flex-1 bg-white border border-slate-100 rounded-2xl shadow-sm min-h-0">
        <div className="p-6 space-y-0 relative">
          {hours.map((hour, idx) => {
            const hourInt = hour.getHours();
            const hourTasks = timedTasks.filter(t => t.dueTime?.startsWith(format(hour, 'HH:')));
            
            return (
              <div 
                key={hourInt} 
                id={`daily-hour-${hourInt}`}
                className="flex group min-h-[80px] border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
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
                            "group/task flex items-center gap-3 py-1.5 px-2 border-b border-slate-50 transition-all hover:bg-slate-50/50",
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
                              onClick={() => { setEditingTask(task); setIsDialogOpen(true); }}
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

          {/* Unscheduled Tasks Section */}
          {untimedTasks.length > 0 && (
            <div className="mt-8 pt-8 border-t-2 border-dashed border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-slate-100 rounded-lg">
                  <History className="w-4 h-4 text-slate-600" />
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Tasks for today (Untimed)</h3>
              </div>
              <div className="flex flex-col gap-0.5">
                {untimedTasks.map(task => {
                  const category = categories.find(c => c.id === task.category);
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "group/task flex items-center gap-3 py-2 px-2 border-b border-slate-100/60 transition-all hover:bg-slate-50/50",
                        task.completed && "opacity-50 grayscale"
                      )}
                    >
                      {/* Radio Button Style Toggle */}
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

                      <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                        <div 
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => { setEditingTask(task); setIsDialogOpen(true); }}
                        >
                          <div className="flex items-center gap-2">
                             <h4 className={cn(
                               "text-[12px] font-bold text-slate-800 truncate py-0.5",
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

                        <div className="flex items-center gap-1 opacity-0 group-hover/task:opacity-100 transition-opacity">
                          {!task.completed && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-slate-400 hover:text-primary hover:bg-primary/5" 
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
                            className="h-7 w-7 text-slate-400 hover:text-destructive hover:bg-destructive/5" 
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
          )}
        </div>
      </ScrollArea>
    </div>
  );
});
