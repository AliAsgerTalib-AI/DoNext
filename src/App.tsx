/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { 
  Plus, 
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  format, 
  addDays 
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTasks } from './useTasks';
import { TaskForm } from './components/TaskForm';
import { CategoryForm } from './components/CategoryForm';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { DailyView } from './views/DailyView';
import { CalendarView } from './views/CalendarView';
import { DevTools } from './components/DevTools';
import { Footer } from './components/Footer';
import { Task, Category, Priority } from './types';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

export default function App() {
  const { 
    tasks, setTasks, addTask, updateTask, deleteTask, toggleTask, toggleSubtask,
    categories, setCategories, addCategory, updateCategory, deleteCategory 
  } = useTasks();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState<string>('all');
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'active' | 'completed' | 'urgent' | 'blocked' | 'overdue' | 'unscheduled'>('all');
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [showRepeatPrompt, setShowRepeatPrompt] = React.useState(false);
  const [pendingTaskData, setPendingTaskData] = React.useState<Partial<Task> | null>(null);
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = React.useState<Date | null>(null);
  const [selectedDailyDate, setSelectedDailyDate] = React.useState<Date>(new Date());

  const filteredTasks = React.useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || task.category === activeCategory;
      
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
  }, [tasks, searchQuery, activeCategory, activeFilter]);

  const watchedTasks = React.useMemo(() => {
    return tasks
      .filter(t => t.isWatched)
      .sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
  }, [tasks]);

  const carryforwardTask = React.useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.dueDate) return;
    
    const [year, month, day] = task.dueDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const nextDay = addDays(date, 1);
    const nextDayStr = format(nextDay, 'yyyy-MM-dd');
    
    // Check if duplicate exists for next day
    const isDuplicate = tasks.some(t => 
      t.title.toLowerCase() === task.title.toLowerCase() && 
      t.dueDate === nextDayStr && 
      t.id !== taskId
    );
    
    if (isDuplicate) {
      toast.error('A task with this name already exists for tomorrow');
      return;
    }
    
    updateTask(taskId, { dueDate: nextDayStr });
    toast.success(`Task carried forward to ${format(nextDay, 'MMM d')}`);
  }, [tasks, updateTask]);

  const handleSaveTask = React.useCallback((taskData: Partial<Task>, applyToFuture: boolean = false) => {
    // If it's an edit of a repeatable task and we haven't asked yet
    if (editingTask?.isRepeatable && !applyToFuture && !pendingTaskData) {
      setPendingTaskData(taskData);
      setShowRepeatPrompt(true);
      return;
    }

    // Duplicate check
    const isDuplicate = tasks.some(t => 
      t.title.toLowerCase() === (taskData.title || '').toLowerCase() && 
      t.dueDate === taskData.dueDate && 
      (!editingTask || t.id !== editingTask.id)
    );

    if (isDuplicate) {
      toast.error(`A task named "${taskData.title}" already exists for this day`);
      setPendingTaskData(null);
      return;
    }

    if (editingTask) {
      updateTask(editingTask.id, taskData, applyToFuture);
      toast.success(applyToFuture ? 'Future tasks updated' : 'Task updated successfully');
    } else {
      addTask(taskData);
      toast.success('New task created');
    }
    setEditingTask(null);
    setIsDialogOpen(false);
    setShowRepeatPrompt(false);
    setPendingTaskData(null);
  }, [tasks, editingTask, pendingTaskData, updateTask, addTask]);

  const getPriorityColor = React.useCallback((priority: Priority) => {
    switch (priority) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-emerald-500';
    }
  }, []);

  const handleAddCategory = React.useCallback(() => {
    setEditingCategory(null);
    setIsCategoryDialogOpen(true);
  }, []);

  const handleEditCategory = React.useCallback((cat: Category) => {
    setEditingCategory(cat);
    setIsCategoryDialogOpen(true);
  }, []);

  const handleTaskFormCancel = React.useCallback(() => setIsDialogOpen(false), []);
  const handleTaskFormDelete = React.useCallback((id: string) => {
    deleteTask(id);
    setIsDialogOpen(false);
    toast.error('Task deleted');
  }, [deleteTask]);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
      <Toaster />
      
      <Sidebar 
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        categories={categories}
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}
      />

      <DevTools 
        tasks={tasks} 
        categories={categories} 
        setTasks={setTasks} 
        setCategories={setCategories} 
      />

      <main className="flex-1 flex flex-col min-w-0 bg-[#f7fafd]">
        <Header 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <Tabs defaultValue="focus" className="flex-1 overflow-hidden flex flex-col p-4 max-w-[1200px] mx-auto w-full gap-4">
          <div className="flex items-center justify-between shrink-0">
            <TabsList className="bg-slate-100 p-1 w-fit border-none">
              <TabsTrigger value="focus" className="rounded-lg text-xs font-black uppercase tracking-wider px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                Focus Dashboard
              </TabsTrigger>
              <TabsTrigger value="daily" className="rounded-lg text-xs font-black uppercase tracking-wider px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                Daily View
              </TabsTrigger>
              <TabsTrigger value="calendar" className="rounded-lg text-xs font-black uppercase tracking-wider px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                Monthly View
              </TabsTrigger>
            </TabsList>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger 
                asChild
              >
                <Button onClick={() => setEditingTask(null)} className="h-9 rounded-lg px-4 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-3xl h-[90vh] max-h-[850px] shadow-2xl border-none">
                <TaskForm 
                  key={editingTask?.id || 'new'}
                  initialTask={editingTask} 
                  onSave={handleSaveTask} 
                  onCancel={handleTaskFormCancel} 
                  allTasks={tasks}
                  categories={categories}
                  defaultDate={selectedCalendarDay || undefined}
                  onDelete={handleTaskFormDelete}
                />
              </DialogContent>
            </Dialog>
          </div>

          <TabsContent value="focus" className="flex-1 m-0 flex flex-col gap-4 overflow-hidden">
            <DashboardView 
              tasks={tasks}
              filteredTasks={filteredTasks}
              watchedTasks={watchedTasks}
              categories={categories}
              activeCategory={activeCategory}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              toggleTask={toggleTask}
              carryforwardTask={carryforwardTask}
              deleteTask={deleteTask}
              setEditingTask={setEditingTask}
              setIsDialogOpen={setIsDialogOpen}
              getPriorityColor={getPriorityColor}
            />
          </TabsContent>

          <TabsContent value="daily" className="flex-1 m-0 overflow-hidden flex flex-col min-h-0">
            <DailyView 
              tasks={tasks}
              categories={categories}
              selectedDailyDate={selectedDailyDate}
              setSelectedDailyDate={setSelectedDailyDate}
              toggleTask={toggleTask}
              carryforwardTask={carryforwardTask}
              deleteTask={deleteTask}
              setEditingTask={setEditingTask}
              setIsDialogOpen={setIsDialogOpen}
            />
          </TabsContent>

          <TabsContent value="calendar" className="flex-1 m-0 overflow-hidden flex flex-col">
            <CalendarView 
              tasks={tasks}
              categories={categories}
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              selectedCalendarDay={selectedCalendarDay}
              setSelectedCalendarDay={setSelectedCalendarDay}
              carryforwardTask={carryforwardTask}
              deleteTask={deleteTask}
              setEditingTask={setEditingTask}
              setIsDialogOpen={setIsDialogOpen}
              getPriorityColor={getPriorityColor}
            />
          </TabsContent>
        </Tabs>
        <Footer />
      </main>

      {/* Repeat Confirmation Dialog */}
      <Dialog open={showRepeatPrompt} onOpenChange={setShowRepeatPrompt}>
        <DialogContent className="sm:max-w-[400px] p-6 rounded-3xl">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <History className="w-6 h-6 text-amber-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-display font-black text-slate-800">Repeatable Task</h3>
              <p className="text-sm text-slate-500">Would you like to apply these changes to only this occurrence or all future occurrences in the series?</p>
            </div>
            <div className="grid grid-cols-1 w-full gap-2 mt-2">
              <Button 
                variant="outline" 
                className="h-11 rounded-xl font-bold border-slate-100"
                onClick={() => {
                  if (pendingTaskData) handleSaveTask(pendingTaskData, false);
                }}
              >
                Only this occurrence
              </Button>
              <Button 
                className="h-11 rounded-xl font-bold shadow-lg shadow-primary/20"
                onClick={() => {
                  if (pendingTaskData) handleSaveTask(pendingTaskData, true);
                }}
              >
                All future occurrences
              </Button>
              <Button 
                variant="ghost" 
                className="h-9 rounded-xl text-xs font-bold text-slate-400"
                onClick={() => {
                  setShowRepeatPrompt(false);
                  setPendingTaskData(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Management Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
          <CategoryForm 
            key={editingCategory?.id || 'new-cat'}
            initialCategory={editingCategory}
            onCancel={() => setIsCategoryDialogOpen(false)}
            onSave={(data) => {
              if (editingCategory) {
                updateCategory(editingCategory.id, data);
                toast.success('Category updated');
              } else {
                addCategory(data);
                toast.success('Category created');
              }
              setIsCategoryDialogOpen(false);
            }}
            onDelete={(id) => {
              try {
                deleteCategory(id);
                setIsCategoryDialogOpen(false);
                toast.success('Category deleted');
              } catch (error: any) {
                toast.error(error.message);
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
