/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { 
  ChevronRight, 
  Plus, 
  Trash2,
  ListTodo,
  ArrowRight,
  Clock,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Task, Category, Priority } from '@/src/types';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  tasks: Task[];
  categories: Category[];
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  selectedCalendarDay: Date | null;
  setSelectedCalendarDay: (date: Date | null) => void;
  carryforwardTask: (id: string) => void;
  deleteTask: (id: string) => void;
  setEditingTask: (task: Task | null) => void;
  setIsDialogOpen: (open: boolean) => void;
  getPriorityColor: (priority: Priority) => string;
}

export const CalendarView = React.memo(({
  tasks,
  categories,
  currentMonth,
  setCurrentMonth,
  selectedCalendarDay,
  setSelectedCalendarDay,
  carryforwardTask,
  deleteTask,
  setEditingTask,
  setIsDialogOpen,
  getPriorityColor
}: CalendarViewProps) => {
  const todayStr = React.useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  
  const calendarData = React.useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    return { calendarDays, monthStart };
  }, [currentMonth]);

  const { calendarDays, monthStart } = calendarData;

  const selectedDayTasks = React.useMemo(() => {
    if (!selectedCalendarDay) return [];
    const dateStr = format(selectedCalendarDay, 'yyyy-MM-dd');
    return tasks.filter(t => t.dueDate === dateStr);
  }, [selectedCalendarDay, tasks]);

  return (
    <div className="flex-1 flex flex-col gap-6 animate-in fade-in duration-500 overflow-hidden min-h-0">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          {selectedCalendarDay && (
            <p className="text-xs font-bold text-primary animate-in fade-in slide-in-from-left-2 mt-1">
              Viewing tasks for {format(selectedCalendarDay, 'EEEE, MMM do')}
            </p>
          )}
        </div>
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronRight className="w-4 h-4 rotate-180" />
          </Button>
          <Button variant="ghost" className="h-8 text-xs font-bold" onClick={() => { setCurrentMonth(new Date()); setSelectedCalendarDay(null); }}>
            Today
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        <Card className={cn(
          "flex-1 border-slate-100 shadow-sm overflow-hidden transition-all duration-500",
          selectedCalendarDay ? "lg:flex-[2]" : "flex-1"
        )}>
          <CardContent className="p-0 h-full flex flex-col">
            <div className="grid grid-cols-7 border-b border-slate-50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {day}
                </div>
              ))}
            </div>
            <div className="flex-1 grid grid-cols-7 auto-rows-fr">
              {calendarDays.map((day, i) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayTasks = tasks.filter(t => t.dueDate === dateStr);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isToday = isSameDay(day, new Date());
                const isSelected = selectedCalendarDay && isSameDay(day, selectedCalendarDay);

                return (
                  <div 
                    key={day.toString()} 
                    onClick={() => {
                      setSelectedCalendarDay(day);
                    }}
                    className={cn(
                      "min-h-[90px] p-1.5 border-r border-b border-slate-50 last:border-r-0 transition-all cursor-pointer group hover:bg-slate-50/80",
                      !isCurrentMonth && "bg-slate-50/10 text-slate-300",
                      isSelected && "bg-primary/5 ring-2 ring-inset ring-primary/20 shadow-inner"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full transition-colors",
                        isToday && "bg-primary text-white shadow-md shadow-primary/20",
                        !isToday && isCurrentMonth && "text-slate-600",
                        isSelected && !isToday && "bg-slate-800 text-white"
                      )}>
                        {format(day, 'd')}
                      </span>
                      <div className="flex gap-0.5">
                        {dayTasks.some(t => !t.completed && t.dueDate && t.dueDate < todayStr) && (
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" title="Overdue tasks" />
                        )}
                        {dayTasks.some(t => !t.completed) && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      {dayTasks.slice(0, 3).map(t => (
                        <div 
                          key={t.id} 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCalendarDay(day);
                            setEditingTask(t);
                            setIsDialogOpen(true);
                          }}
                          className={cn(
                            "text-[8px] px-1 py-0.5 rounded-sm border border-slate-100 bg-white truncate font-black flex items-center gap-1 hover:border-primary/50 transition-colors",
                            t.completed && "opacity-40 grayscale"
                          )}
                        >
                          <div className="w-1 h-2 rounded-full shrink-0" style={{ backgroundColor: categories.find(c => c.id === t.category)?.color }} />
                          <span className={cn(t.completed && "line-through")}>{t.title}</span>
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <p className="text-[8px] text-slate-400 font-bold ml-1">+{dayTasks.length - 3} more</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <AnimatePresence>
          {selectedCalendarDay && (
            <motion.div 
              initial={{ opacity: 0, x: 50, width: 0 }}
              animate={{ opacity: 1, x: 0, width: '320px' }}
              exit={{ opacity: 0, x: 50, width: 0 }}
              className="hidden lg:flex flex-col gap-4 min-h-0"
            >
              <div className="flex items-center justify-between shrink-0">
                <div className="flex flex-col">
                  <h3 className="font-display font-black text-lg text-slate-800">Day Details</h3>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{format(selectedCalendarDay, 'MMM d, yyyy')}</p>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-primary hover:bg-primary/10" 
                    onClick={() => {
                      setEditingTask(null);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedCalendarDay(null)}>
                    <X className="w-4 h-4 text-slate-400" />
                  </Button>
                </div>
              </div>
              
              <Card className="flex-1 border-slate-100 shadow-sm bg-white overflow-hidden flex flex-col">
                <CardContent className="p-3 flex flex-col h-full bg-slate-50/30">
                  <Button 
                    variant="outline" 
                    className="w-full mb-4 h-10 border-dashed border-slate-200 text-slate-400 hover:text-primary hover:border-primary/50 text-[10px] font-black uppercase tracking-widest rounded-xl bg-white/50"
                    onClick={() => {
                      setEditingTask(null);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Quick add task
                  </Button>

                  <ScrollArea className="flex-1 -mr-2 pr-2">
                    <div className="space-y-2">
                      {selectedDayTasks.length > 0 ? (
                        selectedDayTasks.map(t => (
                          <motion.div 
                            key={t.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                              "p-3 rounded-xl border transition-all cursor-pointer group relative overflow-hidden",
                              t.completed ? "bg-slate-100/50 border-transparent opacity-60" : "border-slate-100 bg-white hover:shadow-md hover:translate-y-[-1px]"
                            )}
                            onClick={() => { setEditingTask(t); setIsDialogOpen(true); }}
                          >
                            {!t.completed && t.dueDate && t.dueDate < todayStr && (
                              <div className="absolute top-0 right-0 h-1 w-full bg-rose-400" />
                            )}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: categories.find(c => c.id === t.category)?.color }} />
                                <Badge variant="secondary" className="px-1 py-0 text-[7px] font-black uppercase tracking-tighter" style={{ backgroundColor: `${categories.find(c => c.id === t.category)?.color}15`, color: categories.find(c => c.id === t.category)?.color }}>
                                  {categories.find(c => c.id === t.category)?.name}
                                </Badge>
                              </div>
                              <div className={cn("text-[8px] font-black uppercase tracking-tighter", getPriorityColor(t.priority))}>
                                {t.priority}
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <h4 className={cn("text-[11px] font-black text-slate-800 transition-colors flex-1 line-clamp-2", t.completed && "line-through text-slate-400")}>{t.title}</h4>
                              <div className="opacity-0 group-hover:opacity-100 transition-all shrink-0 flex items-center gap-1">
                                {!t.completed && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 text-slate-300 hover:text-primary" 
                                    title="Carry forward to tomorrow"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      carryforwardTask(t.id);
                                    }}
                                  >
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 text-slate-300 hover:text-destructive" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTask(t.id);
                                  }}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                            {t.dueTime && (
                              <div className="mt-2 flex items-center text-[8px] font-bold text-slate-400">
                                <Clock className="w-2.5 h-2.5 mr-1" />
                                {t.dueTime}
                              </div>
                            )}
                          </motion.div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center text-slate-300">
                          <ListTodo className="w-8 h-8 mb-4 opacity-20" />
                          <p className="text-xs font-bold uppercase tracking-widest">No tasks for this day</p>
                          <Button 
                            variant="link" 
                            className="text-[10px] uppercase font-black text-primary mt-2"
                            onClick={() => {
                              setEditingTask(null);
                              setIsDialogOpen(true);
                            }}
                          >
                            Add one now
                          </Button>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});
