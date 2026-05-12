/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { 
  Clock, 
  Trash2,
  Eye,
  Link,
  ArrowRight,
  Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Task, Category, Priority } from '@/src/types';
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
  return (
    <div className="flex-1 m-0 flex flex-col gap-4 overflow-hidden animate-in fade-in duration-500">
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
            
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl scale-90 origin-right">
              <Button variant={activeFilter === 'all' ? 'secondary' : 'ghost'} size="sm" onClick={() => setActiveFilter('all')} className={cn("h-8 rounded-lg text-xs font-bold", activeFilter !== 'all' && "text-slate-400")}>All</Button>
              <Button variant={activeFilter === 'active' ? 'secondary' : 'ghost'} size="sm" onClick={() => setActiveFilter('active')} className={cn("h-8 rounded-lg text-xs font-bold", activeFilter !== 'active' && "text-slate-400")}>Pending</Button>
              <Button variant={activeFilter === 'completed' ? 'secondary' : 'ghost'} size="sm" onClick={() => setActiveFilter('completed')} className={cn("h-8 rounded-lg text-xs font-bold", activeFilter !== 'completed' && "text-slate-400")}>Done</Button>
            </div>
          </div>

          <ScrollArea className="h-[550px] pr-4">
            <div className="space-y-0 pb-2">
              <AnimatePresence mode="popLayout">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map(task => {
                    const isBlocked = task.dependencyIds && task.dependencyIds.some(id => {
                      const dep = tasks.find(t => t.id === id);
                      return dep && !dep.completed;
                    });

                    const category = categories.find(c => c.id === task.category);

                    return (
                      <motion.div key={task.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} layout>
                        <div 
                          className={cn(
                            "group flex items-center gap-3 py-2 px-1 border-b border-slate-100/60 transition-all hover:bg-slate-50/50",
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
                                  {isBlocked && !task.completed && (
                                    <Badge variant="outline" className="h-4 px-1 text-[7px] font-black uppercase tracking-tighter text-amber-600 border-amber-200 bg-amber-50">
                                      Blocked
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

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-20 text-slate-300 italic text-[11px] font-bold uppercase tracking-widest bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-100 mt-4">
                    No tasks pending...
                  </div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
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
