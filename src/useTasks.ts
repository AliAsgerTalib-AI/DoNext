/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { Task, Category, Priority, DEFAULT_CATEGORIES } from './types';
import { addDays, addMonths, format, parseISO, isBefore, isSameDay } from 'date-fns';

export function useTasks() {
  const [tasks, setTasks] = React.useState<Task[]>(() => {
    const saved = localStorage.getItem('chronos-tasks');
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    localStorage.setItem('chronos-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (taskData: Partial<Task>) => {
    const tasksToAdd: Task[] = [];
    const baseTask = {
      title: taskData.title || 'Untitled Task',
      description: taskData.description || '',
      completed: false,
      priority: taskData.priority || 'medium',
      category: taskData.category || 'personal',
      dueTime: taskData.dueTime || null,
      subtasks: taskData.subtasks || [],
      isWatched: taskData.isWatched || false,
      dependencyIds: taskData.dependencyIds || [],
      createdAt: Date.now(),
    };

    if (taskData.isRepeatable && taskData.frequency && taskData.frequency !== 'none') {
      const startStr = taskData.dueDate || format(new Date(), 'yyyy-MM-dd');
      const [year, month, day] = startStr.split('-').map(Number);
      const startDate = new Date(year, month - 1, day);
      
      let endDate: Date;
      if (taskData.recurrenceEnd) {
        const [eYear, eMonth, eDay] = taskData.recurrenceEnd.split('-').map(Number);
        endDate = new Date(eYear, eMonth - 1, eDay);
      } else {
        endDate = addDays(startDate, 30);
      }

      let currentDate = startDate;
      // Cap at 100 tasks to avoid accidental infinite loops or excessive data
      let count = 0;
      while ((isBefore(currentDate, endDate) || isSameDay(currentDate, endDate)) && count < 100) {
        tasksToAdd.push({
          ...baseTask,
          id: crypto.randomUUID(),
          dueDate: format(currentDate, 'yyyy-MM-dd'),
          isRepeatable: true,
          frequency: taskData.frequency,
          recurrenceStart: taskData.recurrenceStart || null,
          recurrenceEnd: taskData.recurrenceEnd || null,
        } as Task);

        if (taskData.frequency === 'daily') currentDate = addDays(currentDate, 1);
        else if (taskData.frequency === 'weekly') currentDate = addDays(currentDate, 7);
        else if (taskData.frequency === 'monthly') currentDate = addMonths(currentDate, 1);
        else break;
        count++;
      }
    } else {
      tasksToAdd.push({
        ...baseTask,
        id: crypto.randomUUID(),
        dueDate: taskData.dueDate || null,
        isRepeatable: false,
        frequency: 'none',
      } as Task);
    }
    
    setTasks(prev => [...tasksToAdd, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s)
        };
      }
      return t;
    }));
  };

  return { tasks, addTask, updateTask, deleteTask, toggleTask, toggleSubtask };
}
