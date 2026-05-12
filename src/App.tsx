/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import {
  Plus,
  History,
  Menu
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
import { AdvancedFilterBar } from './components/AdvancedFilterBar';
import { SettingsModal } from './components/SettingsModal';
import { BottomSheet } from './components/BottomSheet';
import { QuickAddForm } from './components/QuickAddForm';
import { Task, Category, Priority } from './types';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

export default function App() {
  const {
    tasks, setTasks, addTask, updateTask, deleteTask, toggleTask, toggleSubtask,
    categories, setCategories, addCategory, updateCategory, deleteCategory,
    undo, redo, canUndo, canRedo
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
  const [advancedFilters, setAdvancedFilters] = React.useState<{ dateFrom?: string; dateTo?: string; priorities?: Priority[] }>({});
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = React.useState(false);

  const activeAdvancedFilterCount = React.useMemo(() => {
    let count = 0;
    if (advancedFilters.dateFrom) count++;
    if (advancedFilters.dateTo) count++;
    if (advancedFilters.priorities?.length) count++;
    return count;
  }, [advancedFilters]);

  const filteredTasks = React.useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    const matchesSearchFilter = (task: Task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategoryFilter = (task: Task) =>
      activeCategory === 'all' || task.category === activeCategory;

    const getTaskStatus = (task: Task) => {
      const isToday = task.dueDate === todayStr;
      const isOverdue = task.dueDate && task.dueDate < todayStr && !task.completed;
      const isUnscheduled = !task.dueDate;
      const isBlocked = task.dependencyIds?.some(id => {
        const dep = tasks.find(t => t.id === id);
        return dep && !dep.completed;
      }) || false;

      return { isToday, isOverdue, isUnscheduled, isBlocked };
    };

    const matchesStatusFilter = (task: Task) => {
      const { isToday, isOverdue, isUnscheduled, isBlocked } = getTaskStatus(task);

      switch (activeFilter) {
        case 'all':
          return true;
        case 'active':
          return !task.completed;
        case 'completed':
          return task.completed;
        case 'urgent':
          return task.priority === 'high';
        case 'blocked':
          return isBlocked;
        case 'overdue':
          return isOverdue;
        case 'unscheduled':
          return isUnscheduled;
        default:
          return true;
      }
    };

    const showTodayOnlyMode = ['all', 'active', 'completed', 'urgent'].includes(activeFilter);

    return tasks
      .filter(task => {
        if (!matchesSearchFilter(task)) return false;
        if (!matchesCategoryFilter(task)) return false;
        if (!matchesStatusFilter(task)) return false;

        // In dashboard mode, only show today's tasks (unless a smart folder is active)
        if (showTodayOnlyMode && activeCategory !== 'smart') {
          return getTaskStatus(task).isToday;
        }

        return true;
      })
      .filter(task => {
        // Advanced filters
        if (advancedFilters.dateFrom && (!task.dueDate || task.dueDate < advancedFilters.dateFrom)) return false;
        if (advancedFilters.dateTo && (!task.dueDate || task.dueDate > advancedFilters.dateTo)) return false;
        if (advancedFilters.priorities?.length && !advancedFilters.priorities.includes(task.priority)) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.dueTime && b.dueTime) return a.dueTime.localeCompare(b.dueTime);
        if (a.dueTime) return -1;
        if (b.dueTime) return 1;
        return 0;
      });
  }, [tasks, searchQuery, activeCategory, activeFilter, advancedFilters]);

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

  const handleNavigateToTask = React.useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) setEditingTask(task);
  }, [tasks]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        toast.info('Undone', { duration: 1500 });
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
        toast.info('Redone', { duration: 1500 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-background overflow-hidden font-sans">
      <Toaster />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
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
          onMenuClick={() => setIsSidebarOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isAdvancedFilterOpen={isAdvancedFilterOpen}
          onToggleAdvancedFilter={() => setIsAdvancedFilterOpen(v => !v)}
          activeAdvancedFilterCount={activeAdvancedFilterCount}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        <AdvancedFilterBar
          filters={advancedFilters}
          onChange={setAdvancedFilters}
          onClear={() => { setAdvancedFilters({}); setIsAdvancedFilterOpen(false); }}
          isVisible={isAdvancedFilterOpen}
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
                  onNavigateToTask={handleNavigateToTask}
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

      {/* Mobile FAB Button */}
      <motion.button
        onClick={() => setIsBottomSheetOpen(true)}
        className="fixed bottom-6 right-6 z-30 hidden max-md:flex h-14 w-14 rounded-full bg-primary shadow-lg items-center justify-center hover:scale-110 active:scale-95 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="h-6 w-6 text-white" />
      </motion.button>

      {/* Mobile Bottom Sheet Quick-Add */}
      <BottomSheet
        open={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        title="Quick Add Task"
      >
        <QuickAddForm
          onAdd={(taskData) => {
            addTask(taskData);
            toast.success('Task added');
            setIsBottomSheetOpen(false);
          }}
          onMoreOptions={() => {
            setIsBottomSheetOpen(false);
            setEditingTask(null);
            setIsDialogOpen(true);
          }}
          onClose={() => setIsBottomSheetOpen(false)}
          defaultDate={selectedCalendarDay || undefined}
        />
      </BottomSheet>

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

      {/* Settings Modal */}
      <SettingsModal
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        tasks={tasks}
        categories={categories}
        setTasks={setTasks}
        setCategories={setCategories}
      />
    </div>
  );
}
