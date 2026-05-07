/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  Filter, 
  Grid, 
  History, 
  LayoutDashboard, 
  ListTodo, 
  LogOut, 
  MoreVertical, 
  Plus, 
  Search, 
  Settings, 
  Trash2,
  Flag,
  Circle,
  CheckCircle,
  Eye,
  CalendarDays,
  Link,
  AlertTriangle,
  FolderSearch,
  Zap,
  Target
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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTasks } from './useTasks';
import { TaskForm } from './components/TaskForm';
import { Task, DEFAULT_CATEGORIES, Category, Priority } from './types';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

export default function App() {
  const { tasks, addTask, updateTask, deleteTask, toggleTask, toggleSubtask } = useTasks();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState<string>('all');
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'active' | 'completed' | 'urgent' | 'blocked' | 'overdue' | 'unscheduled'>('all');
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = React.useState<Date | null>(null);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || task.category === activeCategory;
    
    // Only show today's tasks in the dashboard
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const isToday = task.dueDate === todayStr;
    const isOverdue = task.dueDate && task.dueDate < todayStr && !task.completed;
    const isUnscheduled = !task.dueDate;
    const isBlocked = task.dependencyIds && task.dependencyIds.some(id => {
      const dep = tasks.find(t => t.id === id);
      return dep && !dep.completed;
    });
    
    const matchesFilter = activeFilter === 'all' || 
                         (activeFilter === 'active' && !task.completed) || 
                         (activeFilter === 'completed' && task.completed) ||
                         (activeFilter === 'urgent' && task.priority === 'high') ||
                         (activeFilter === 'blocked' && isBlocked) ||
                         (activeFilter === 'overdue' && isOverdue) ||
                         (activeFilter === 'unscheduled' && isUnscheduled);
    
    // In Dashboard view, we usually show today's tasks OR a specific smart folder
    const isInDashboardMode = activeFilter === 'all' || activeFilter === 'active' || activeFilter === 'completed' || activeFilter === 'urgent';
    const showTodayOnly = isInDashboardMode && activeCategory !== 'smart'; 

    if (showTodayOnly) {
      return matchesSearch && matchesCategory && matchesFilter && isToday;
    }
    
    return matchesSearch && (activeCategory === 'all' || activeCategory === 'smart') && matchesFilter;
  }).sort((a, b) => {
    if (a.dueTime && b.dueTime) return a.dueTime.localeCompare(b.dueTime);
    if (a.dueTime) return -1;
    if (b.dueTime) return 1;
    return 0;
  });

  const watchedTasks = tasks
    .filter(t => t.isWatched)
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      toast.success('Task updated successfully');
    } else {
      addTask(taskData);
      toast.success('New task created');
    }
    setEditingTask(null);
    setIsDialogOpen(false);
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-emerald-500';
    }
  };

  const CalendarView = () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    const selectedDayTasks = selectedCalendarDay ? tasks.filter(t => t.dueDate === format(selectedCalendarDay, 'yyyy-MM-dd')) : [];

    return (
      <div className="flex-1 flex flex-col gap-6 animate-in fade-in duration-500 overflow-hidden">
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
                            <div className="w-1 h-2 rounded-full shrink-0" style={{ backgroundColor: DEFAULT_CATEGORIES.find(c => c.id === t.category)?.color }} />
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
                className="hidden lg:flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
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
                      <Trash2 className="w-4 h-4 text-slate-300" />
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
                                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: DEFAULT_CATEGORIES.find(c => c.id === t.category)?.color }} />
                                  <Badge variant="secondary" className="px-1 py-0 text-[7px] font-black uppercase tracking-tighter" style={{ backgroundColor: `${DEFAULT_CATEGORIES.find(c => c.id === t.category)?.color}15`, color: DEFAULT_CATEGORIES.find(c => c.id === t.category)?.color }}>
                                    {DEFAULT_CATEGORIES.find(c => c.id === t.category)?.name}
                                  </Badge>
                                </div>
                                <div className={cn("text-[8px] font-black uppercase tracking-tighter", getPriorityColor(t.priority))}>
                                  {t.priority}
                                </div>
                              </div>
                              <div className="flex items-center justify-between gap-3">
                                <h4 className={cn("text-[11px] font-black text-slate-800 transition-colors flex-1 line-clamp-2", t.completed && "line-through text-slate-400")}>{t.title}</h4>
                                <div className="opacity-0 group-hover:opacity-100 transition-all shrink-0 flex items-center gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 text-slate-300 hover:text-destructive" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteTask(t.id);
                                      toast.error('Task deleted');
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
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
      <Toaster />
      
      {/* Sidebar */}
      <aside className="w-52 bg-primary flex flex-col p-4 gap-6 shrink-0">
        <div className="flex items-center gap-2 px-1 mb-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-lg font-display font-black text-white tracking-tight">DoNext</h1>
        </div>

        <nav className="flex-1 flex flex-col gap-6">
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest px-2 mb-2">Menu</p>
            <SidebarItem 
              icon={<LayoutDashboard className="w-4 h-4" />} 
              label="Dashboard" 
              active={activeCategory === 'all' && activeFilter === 'all'} 
              onClick={() => { setActiveCategory('all'); setActiveFilter('all'); }}
            />
            <SidebarItem 
              icon={<Clock className="w-4 h-4" />} 
              label="Today" 
              active={activeFilter === 'active'} 
              onClick={() => setActiveFilter('active')}
            />
            <SidebarItem 
              icon={<CheckCircle className="w-4 h-4" />} 
              label="Completed" 
              active={activeFilter === 'completed'} 
              onClick={() => setActiveFilter('completed')}
            />
          </div>

          <div className="space-y-1">
            <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest px-2 mb-2">Smart Folders</p>
            <SidebarItem 
              icon={<AlertTriangle className="w-4 h-4" />} 
              label="Blocked" 
              active={activeFilter === 'blocked'} 
              onClick={() => { setActiveCategory('smart'); setActiveFilter('blocked'); }}
            />
            <SidebarItem 
              icon={<History className="w-4 h-4 text-rose-300" />} 
              label="Overdue" 
              active={activeFilter === 'overdue'} 
              onClick={() => { setActiveCategory('smart'); setActiveFilter('overdue'); }}
            />
            <SidebarItem 
              icon={<Zap className="w-4 h-4 text-amber-300" />} 
              label="Unscheduled" 
              active={activeFilter === 'unscheduled'} 
              onClick={() => { setActiveCategory('smart'); setActiveFilter('unscheduled'); }}
            />
            <SidebarItem 
              icon={<Target className="w-4 h-4 text-sky-300" />} 
              label="Urgent" 
              active={activeFilter === 'urgent'} 
              onClick={() => { setActiveCategory('smart'); setActiveFilter('urgent'); }}
            />
          </div>

          <div className="space-y-1">
            <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest px-2 mb-2">Categories</p>
            <ScrollArea className="h-40">
              {DEFAULT_CATEGORIES.map(cat => (
                <SidebarItem 
                  key={cat.id}
                  icon={<div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />} 
                  label={cat.name} 
                  active={activeCategory === cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                />
              ))}
            </ScrollArea>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f7fafd]">
        {/* Header */}
        <header className="h-20 border-b bg-card px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm shadow-slate-100">
          <div className="relative w-96 max-w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              className="pl-11 h-11 bg-slate-50 border-slate-100 focus-visible:ring-2 focus-visible:ring-primary/20 rounded-xl font-medium" 
              placeholder="Search tasks, categories..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-6">
            <HeaderClock />
          </div>
        </header>

        {/* Board Content */}
        <Tabs defaultValue="focus" className="flex-1 overflow-hidden flex flex-col p-4 max-w-[1200px] mx-auto w-full gap-4">
          <div className="flex items-center justify-between">
            <TabsList className="bg-slate-100 p-1 w-fit border-none">
              <TabsTrigger value="focus" className="rounded-lg text-xs font-black uppercase tracking-wider px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                <LayoutDashboard className="w-3.5 h-3.5 mr-2" />
                Focus Dashboard
              </TabsTrigger>
              <TabsTrigger value="calendar" className="rounded-lg text-xs font-black uppercase tracking-wider px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                <CalendarDays className="w-3.5 h-3.5 mr-2" />
                Monthly View
              </TabsTrigger>
            </TabsList>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger 
                render={
                  <Button onClick={() => setEditingTask(null)} className="h-9 rounded-lg px-4 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-3xl h-[90vh] max-h-[850px] shadow-2xl border-none">
                <TaskForm 
                  key={editingTask?.id || 'new'}
                  initialTask={editingTask} 
                  onSave={handleSaveTask} 
                  onCancel={() => setIsDialogOpen(false)} 
                  allTasks={tasks}
                  defaultDate={selectedCalendarDay || undefined}
                  onDelete={(id) => {
                    deleteTask(id);
                    setIsDialogOpen(false);
                    toast.error('Task deleted');
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <TabsContent value="focus" className="flex-1 m-0 flex flex-col gap-4 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Task List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-end justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-display font-black text-slate-900 tracking-tight">Today's Focus</h2>
                    <p className="text-slate-400 font-bold text-[10px] tracking-widest uppercase">
                      {activeCategory === 'all' ? 'All Tasks' : DEFAULT_CATEGORIES.find(c => c.id === activeCategory)?.name}
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

                <ScrollArea className="h-[500px] pr-4 border-b">
                  <div className="space-y-0.5 pb-2">
                    <AnimatePresence mode="popLayout">
                      {filteredTasks.length > 0 ? (
                        filteredTasks.map(task => {
                          const isBlocked = task.dependencyIds && task.dependencyIds.some(id => {
                            const dep = tasks.find(t => t.id === id);
                            return dep && !dep.completed;
                          });

                          return (
                            <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} layout>
                              <Card className={cn(
                                "group transition-all duration-200 border relative overflow-hidden shadow-none hover:shadow-sm",
                                task.completed ? "opacity-60 grayscale bg-slate-50 border-transparent" : "border-slate-100 bg-white",
                                isBlocked && !task.completed && "border-amber-100 bg-amber-50/20"
                              )}>
                                {isBlocked && !task.completed && (
                                  <div className="absolute right-0 top-0 bg-amber-100 text-amber-600 px-1.5 py-0 text-[7px] font-black uppercase rounded-bl-lg flex items-center gap-0.5">
                                    <Link className="w-2 h-2" />
                                    Blocked
                                  </div>
                                )}
                                <CardContent className="py-0.5 px-3 flex items-center gap-2">
                                  <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} className="w-3.5 h-3.5 rounded-md border-2 border-primary/40 data-[state=checked]:bg-primary shrink-0" />
                                  <div className="flex-1 min-w-0 flex items-center justify-between">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <h3 className={cn("font-black text-[11px] text-slate-800 truncate py-1", task.completed && "line-through text-slate-400")}>{task.title}</h3>
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <Badge variant="secondary" className="px-1 py-0 rounded-[3px] text-[7px] font-black uppercase tracking-tighter" style={{ backgroundColor: `${DEFAULT_CATEGORIES.find(c => c.id === task.category)?.color}15`, color: DEFAULT_CATEGORIES.find(c => c.id === task.category)?.color }}>
                                          {DEFAULT_CATEGORIES.find(c => c.id === task.category)?.name}
                                        </Badge>
                                        {task.dueTime && (
                                          <div className="flex items-center text-[7px] font-black uppercase tracking-tighter text-slate-400">
                                            <Clock className="w-2 h-2 mr-0.5" />
                                            {task.dueTime}
                                          </div>
                                        )}
                                        {isBlocked && !task.completed && (
                                          <div className="flex -space-x-1">
                                            {task.dependencyIds?.map(id => {
                                              const dep = tasks.find(t => t.id === id);
                                              if (!dep || dep.completed) return null;
                                              return (
                                                <div key={id} className="w-2 h-2 rounded-full border border-white bg-amber-400 shadow-sm" title={`Waiting for: ${dep.title}`} />
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 shrink-0">
                                      <Button variant="ghost" size="icon" className="h-4 w-4 hover:text-destructive" onClick={() => { deleteTask(task.id); toast.error('Task deleted'); }}>
                                        <Trash2 className="w-2.5 h-2.5" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => { setEditingTask(task); setIsDialogOpen(true); }}>
                                        <ChevronRight className="w-2.5 h-2.5" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-slate-300 italic text-[11px] font-bold uppercase tracking-widest">No tasks pending...</div>
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
                                  {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'No date'}
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
          </TabsContent>

          <TabsContent value="calendar" className="flex-1 m-0 overflow-hidden flex flex-col">
            <CalendarView />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  key?: string | number;
}

function SidebarItem({ icon, label, active, onClick }: SidebarItemProps) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm font-bold tracking-tight",
        active 
          ? "bg-white text-primary shadow-lg shadow-black/5 scale-[1.02]" 
          : "text-white/70 hover:bg-white/10 hover:text-white"
      )}
    >
      <span className={cn(
        "transition-transform duration-200 group-hover:scale-110",
        active ? "text-primary" : "text-white/60"
      )}>
        {icon}
      </span>
      {label}
    </button>
  );
}

function HeaderClock() {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-end">
      <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">{format(currentTime, 'EEEE, MMMM do')}</span>
      <span className="text-2xl font-display font-black text-primary tabular-nums tracking-tight leading-none mt-1">{format(currentTime, 'pp')}</span>
    </div>
  );
}
