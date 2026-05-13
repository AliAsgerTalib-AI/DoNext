/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Plus, X, ListTodo, Calendar as CalendarIcon, Trash2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'motion/react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Priority, RecurrenceFrequency, Task, Subtask, Category } from '@/src/types';
import { DependencyGraph } from '@/src/components/DependencyGraph';
import { parseDateString } from '@/src/lib/recurringTasks';
import { SubtaskList } from '@/src/components/SubtaskList';
import { RecurrenceSettings } from '@/src/components/RecurrenceSettings';

interface TaskFormProps {
  initialTask?: Task | null;
  onSave: (task: Partial<Task>, applyToFuture?: boolean) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
  allTasks?: Task[];
  categories?: Category[];
  defaultDate?: Date;
  key?: string | number;
  onNavigateToTask?: (taskId: string) => void;
}

export function TaskForm({ initialTask, onSave, onCancel, onDelete, allTasks = [], categories = [], defaultDate, onNavigateToTask }: TaskFormProps) {
  const [subtasks, setSubtasks] = React.useState<Subtask[]>(initialTask?.subtasks || []);
  const [isRepeatable, setIsRepeatable] = React.useState(initialTask?.isRepeatable || false);
  const [isWatched, setIsWatched] = React.useState(initialTask?.isWatched || false);
  const [priority, setPriority] = React.useState<Priority>(initialTask?.priority || 'medium');
  const [category, setCategory] = React.useState<string>(initialTask?.category || 'personal');
  const [frequency, setFrequency] = React.useState<RecurrenceFrequency>(initialTask?.frequency || 'daily');
  const [applyToFuture, setApplyToFuture] = React.useState(false);
  const [dueTime, setDueTime] = React.useState(initialTask?.dueTime || '');
  const [dependencyIds, setDependencyIds] = React.useState<string[]>(initialTask?.dependencyIds || []);

  const [date, setDate] = React.useState<Date | undefined>(
    initialTask?.dueDate ? parseDateString(initialTask.dueDate) : (defaultDate || new Date())
  );
  const [recurrenceStartDate, setRecurrenceStartDate] = React.useState<Date | undefined>(
    initialTask?.recurrenceStart ? parseDateString(initialTask.recurrenceStart) : undefined
  );
  const [recurrenceEndDate, setRecurrenceEndDate] = React.useState<Date | undefined>(
    initialTask?.recurrenceEnd ? parseDateString(initialTask.recurrenceEnd) : undefined
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const title = (formData.get('title') as string)?.trim();
    if (!title) {
      return;
    }

    // Validate repeatable task requirements
    if (isRepeatable) {
      if (!frequency || frequency === 'none') {
        alert('⚠️ Please select a frequency (Daily, Weekly, or Monthly) for repeatable tasks');
        return;
      }
      if (!recurrenceEndDate && !formData.get('occurrences')) {
        alert('⚠️ Please set either an end date or occurrences limit for repeatable tasks');
        return;
      }
    }

    onSave({
      title,
      description: formData.get('description') as string,
      notes: formData.get('notes') as string,
      priority,
      category,
      dueDate: date ? format(date, 'yyyy-MM-dd') : null,
      dueTime: dueTime || null,
      isRepeatable,
      isWatched,
      frequency: isRepeatable ? frequency : 'none',
      recurrenceStart: isRepeatable && recurrenceStartDate ? format(recurrenceStartDate, 'yyyy-MM-dd') : null,
      recurrenceEnd: isRepeatable && recurrenceEndDate ? format(recurrenceEndDate, 'yyyy-MM-dd') : null,
      recurrenceGroupId: initialTask?.recurrenceGroupId || null,
      occurrences: isRepeatable ? (formData.get('occurrences') ? parseInt(formData.get('occurrences') as string) : null) : null,
      subtasks,
      dependencyIds,
    }, applyToFuture);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">
      <DialogHeader className="p-8 border-b bg-primary/5 shrink-0">
        <DialogTitle className="text-2xl font-display font-black text-slate-800 tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <ListTodo className="w-6 h-6 text-white" />
          </div>
          {initialTask ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
      </DialogHeader>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Task Title</Label>
            <Input id="title" name="title" defaultValue={initialTask?.title} placeholder="What needs to be done?" required className="rounded-xl border-slate-100 focus-visible:ring-primary/20 h-12 text-base font-medium" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Description</Label>
            <Textarea id="description" name="description" defaultValue={initialTask?.description} placeholder="Add more details about this task..." className="rounded-xl border-slate-100 focus-visible:ring-primary/20 min-h-[80px] resize-none" />
          </div>

          {(initialTask ? !initialTask.completed : true) && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
              <Label htmlFor="notes" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Notes</Label>
              <Textarea id="notes" name="notes" defaultValue={initialTask?.notes} placeholder="Quick notes for this instance..." className="rounded-xl border-slate-100 focus-visible:ring-primary/20 min-h-[80px] resize-none bg-slate-50/50" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Priority</Label>
              <Select value={priority} onValueChange={(val: Priority) => setPriority(val)}>
                <SelectTrigger className="rounded-xl border-slate-100 h-11">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="rounded-xl border-slate-100 h-11">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="dueDate" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Due Date</Label>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal h-11 rounded-xl border-slate-100 bg-white",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  }
                />
                <PopoverContent className="w-auto p-0 rounded-2xl shadow-xl border-slate-100" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="rounded-2xl"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2 flex flex-col">
              <Label htmlFor="dueTime" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Time (Optional)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <Input 
                  id="dueTime" 
                  name="dueTime" 
                  type="time" 
                  value={dueTime} 
                  onChange={(e) => setDueTime(e.target.value)}
                  className="rounded-xl border-slate-100 focus-visible:ring-primary/20 h-11 pl-10" 
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-primary/30 transition-colors shadow-sm">
              <Checkbox id="isRepeatable" checked={isRepeatable} onCheckedChange={(checked) => setIsRepeatable(!!checked)} className="w-5 h-5 rounded-md border-2 border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
              <div className="space-y-0.5">
                <Label htmlFor="isRepeatable" className="text-xs font-bold cursor-pointer">Repeatable</Label>
                <p className="text-[10px] text-slate-400">Recurring task</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-primary/30 transition-colors shadow-sm">
              <Checkbox id="isWatched" checked={isWatched} onCheckedChange={(checked) => setIsWatched(!!checked)} className="w-5 h-5 rounded-md border-2 border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
              <div className="space-y-0.5">
                <Label htmlFor="isWatched" className="text-xs font-bold cursor-pointer">Watch</Label>
                <p className="text-[10px] text-slate-400">Keep on radar</p>
              </div>
            </div>
          </div>

          {isRepeatable && (
            <RecurrenceSettings
              frequency={frequency}
              onFrequencyChange={setFrequency}
              startDate={recurrenceStartDate}
              onStartDateChange={setRecurrenceStartDate}
              endDate={recurrenceEndDate}
              onEndDateChange={setRecurrenceEndDate}
              defaultOccurrences={initialTask?.occurrences}
            />
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between ml-1">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dependencies ({dependencyIds.length})</Label>
            </div>
            <div className="space-y-2">
              <Popover>
                <PopoverTrigger
                  render={
                    <Button variant="outline" className="w-full justify-start text-left font-normal h-11 rounded-xl border-slate-100 bg-white">
                      <Plus className="mr-2 h-4 w-4" />
                      <span>Select requirements...</span>
                    </Button>
                  }
                />
                <PopoverContent className="w-80 p-0 rounded-2xl shadow-xl border-slate-100" align="start">
                  <ScrollArea className="h-60 p-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Available Tasks</p>
                      {allTasks
                        .filter(t => t.id !== initialTask?.id)
                        .map(task => (
                          <button type="button" key={task.id} className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-lg transition-colors text-left w-full" onClick={() => {
                            if (dependencyIds.includes(task.id)) {
                              setDependencyIds(dependencyIds.filter(id => id !== task.id));
                            } else {
                              setDependencyIds([...dependencyIds, task.id]);
                            }
                          }}>
                            <Checkbox checked={dependencyIds.includes(task.id)} className="rounded-md" />
                            <span className="text-sm font-medium truncate">{task.title}</span>
                          </button>
                        ))}
                      {allTasks.length <= 1 && (
                        <p className="text-center py-8 text-xs text-slate-400">No other tasks available</p>
                      )}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
              <div className="flex flex-wrap gap-2">
                {dependencyIds.map(id => {
                  const depTask = allTasks.find(t => t.id === id);
                  return depTask ? (
                    <Badge key={id} variant="secondary" className="pl-2 pr-1 py-1 rounded-lg flex items-center gap-1 group">
                      <span className="text-[10px] font-bold">{depTask.title}</span>
                      <X className="w-3 h-3 cursor-pointer hover:text-destructive transition-colors" onClick={() => setDependencyIds(dependencyIds.filter(did => did !== id))} />
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          </div>

          <SubtaskList
            subtasks={subtasks}
            onChange={setSubtasks}
          />

          {/* Dependency Graph Panel */}
          {initialTask && allTasks.length > 0 && (
            <div className="space-y-2 px-2">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                Dependency Map
              </Label>
              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                <DependencyGraph
                  task={initialTask}
                  allTasks={allTasks}
                  onNavigateToTask={onNavigateToTask}
                />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="flex justify-between p-8 border-t bg-slate-50/50 shrink-0">
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={onCancel} className="rounded-xl px-6 font-bold h-12">Cancel</Button>
          {initialTask && onDelete && (
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onDelete(initialTask.id)} 
              className="rounded-xl px-4 font-bold h-12 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          )}
        </div>
        <Button type="submit" className="rounded-xl px-10 font-bold h-12 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
          {initialTask ? 'Save Changes' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
