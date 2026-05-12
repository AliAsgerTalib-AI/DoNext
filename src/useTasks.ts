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

  const [categories, setCategories] = React.useState<Category[]>(() => {
    const saved = localStorage.getItem('chronos-categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  React.useEffect(() => {
    localStorage.setItem('chronos-tasks', JSON.stringify(tasks));
  }, [tasks]);

  React.useEffect(() => {
    localStorage.setItem('chronos-categories', JSON.stringify(categories));
  }, [categories]);

  // Sync state across multiple tabs
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.storageArea !== localStorage) return;

      try {
        if (e.key === 'chronos-tasks' && e.newValue) {
          const newTasks = JSON.parse(e.newValue);
          // Only update if data is actually different to avoid infinite loops or unnecessary renders
          setTasks(prev => {
            if (JSON.stringify(prev) === e.newValue) return prev;
            return newTasks;
          });
        }
        if (e.key === 'chronos-categories' && e.newValue) {
          const newCategories = JSON.parse(e.newValue);
          setCategories(prev => {
            if (JSON.stringify(prev) === e.newValue) return prev;
            return newCategories;
          });
        }
      } catch (err) {
        console.error('Error parsing synced storage data:', err);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addCategory = React.useCallback((categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: crypto.randomUUID(),
    };
    setCategories(prev => [...prev, newCategory]);
  }, []);

  const updateCategory = React.useCallback((id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteCategory = React.useCallback((id: string) => {
    // Check if any tasks are assigned to this category
    // Note: This relies on 'tasks' which is in the scope. 
    // To keep it stable, we use the functional update if possible or include tasks in dependencies.
    setCategories(prev => {
      const hasTasks = tasks.some(t => t.category === id);
      if (hasTasks) {
        throw new Error('Cannot delete category with assigned tasks');
      }
      return prev.filter(c => c.id !== id);
    });
  }, [tasks]);

  const addTask = React.useCallback((taskData: Partial<Task>) => {
    const tasksToAdd: Task[] = [];
    const baseTask = {
      title: taskData.title || 'Untitled Task',
      description: taskData.description || '',
      notes: taskData.notes || '',
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
      const recurrenceGroupId = crypto.randomUUID();
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
          recurrenceGroupId,
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
  }, []);

  const updateTask = React.useCallback((id: string, updates: Partial<Task>, applyToFuture: boolean = false) => {
    setTasks(prev => {
      const taskToUpdate = prev.find(t => t.id === id);
      if (!taskToUpdate) return prev;

      // If updating a repeatable task that lacks a group ID, give it one
      let groupId = taskToUpdate.recurrenceGroupId;
      if (taskToUpdate.isRepeatable && !groupId) {
        groupId = crypto.randomUUID();
      }

      if (applyToFuture && (taskToUpdate.isRepeatable || updates.isRepeatable)) {
        let foundFuture = false;
        const updatedTasks = prev.map(t => {
          if (t.id === id) return { ...t, ...updates, recurrenceGroupId: groupId };
          
          // Match by same recurrenceGroupId OR (if missing group ID) match by title and frequency if it's in the future
          const isSameSeries = t.recurrenceGroupId === groupId || 
            (groupId && t.title === taskToUpdate.title && t.frequency === (updates.frequency || taskToUpdate.frequency) && t.isRepeatable);

          if (isSameSeries && t.dueDate && taskToUpdate.dueDate && t.dueDate > taskToUpdate.dueDate) {
            foundFuture = true;
            const sharedFields = ['title', 'description', 'notes', 'priority', 'category', 'dueTime', 'subtasks', 'dependencyIds', 'isWatched'];
            const futureUpdates: any = { recurrenceGroupId: groupId };
            sharedFields.forEach(field => {
              if (updates[field as keyof Task] !== undefined) {
                futureUpdates[field] = updates[field as keyof Task];
              }
            });
            return { ...t, ...futureUpdates };
          }
          return t;
        });

        // If no future occurrences were found, create them for the next 30 days
        if (!foundFuture) {
          const newTaskTemplate = { ...taskToUpdate, ...updates, recurrenceGroupId: groupId };
          const frequency = newTaskTemplate.frequency;
          const startStr = newTaskTemplate.dueDate || format(new Date(), 'yyyy-MM-dd');
          const [year, month, day] = startStr.split('-').map(Number);
          const startDate = new Date(year, month - 1, day);
          
          let currentDate = startDate;
          if (frequency === 'daily') currentDate = addDays(currentDate, 1);
          else if (frequency === 'weekly') currentDate = addDays(currentDate, 7);
          else if (frequency === 'monthly') currentDate = addMonths(currentDate, 1);
          else return updatedTasks; // Cannot repeat if frequency is none or invalid

          const endDate = addDays(startDate, 30);
          const tasksToAdd: Task[] = [];
          
          let count = 0;
          while ((isBefore(currentDate, endDate) || isSameDay(currentDate, endDate)) && count < 100) {
            tasksToAdd.push({
              ...newTaskTemplate,
              id: crypto.randomUUID(),
              dueDate: format(currentDate, 'yyyy-MM-dd'),
              completed: false,
              createdAt: Date.now(),
            } as Task);

            if (frequency === 'daily') currentDate = addDays(currentDate, 1);
            else if (frequency === 'weekly') currentDate = addDays(currentDate, 7);
            else if (frequency === 'monthly') currentDate = addMonths(currentDate, 1);
            else break;
            count++;
          }
          return [...tasksToAdd, ...updatedTasks];
        }

        return updatedTasks;
      }

      return prev.map(t => t.id === id ? { ...t, ...updates, recurrenceGroupId: groupId || t.recurrenceGroupId } : t);
    });
  }, []);

  const deleteTask = React.useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleTask = React.useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  const toggleSubtask = React.useCallback((taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s)
        };
      }
      return t;
    }));
  }, []);

  return { 
    tasks, setTasks, addTask, updateTask, deleteTask, toggleTask, toggleSubtask,
    categories, setCategories, addCategory, updateCategory, deleteCategory 
  };
}
