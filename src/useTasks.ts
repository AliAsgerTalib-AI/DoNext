/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { Task, Category, Priority, DEFAULT_CATEGORIES } from './types';
import { addDays, format } from 'date-fns';
import { generateRecurringTasks, parseDateString } from './lib/recurringTasks';
import { useHistory } from './hooks/useHistory';

export function useTasks() {
  const { state: tasks, set: setTasks, setSilent: setTasksSilent, undo: undoTasks, redo: redoTasks, canUndo: canUndoTasks, canRedo: canRedoTasks } = useHistory<Task[]>(() => {
    const saved = localStorage.getItem('chronos-tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const { state: categories, set: setCategories, setSilent: setCategoriesSilent, undo: undoCategories, redo: redoCategories, canUndo: canUndoCategories, canRedo: canRedoCategories } = useHistory<Category[]>(() => {
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
          if (JSON.stringify(tasks) !== JSON.stringify(newTasks)) {
            setTasksSilent(newTasks);
          }
        }
        if (e.key === 'chronos-categories' && e.newValue) {
          const newCategories = JSON.parse(e.newValue);
          if (JSON.stringify(categories) !== JSON.stringify(newCategories)) {
            setCategoriesSilent(newCategories);
          }
        }
      } catch (err) {
        console.error('Error parsing synced storage data:', err);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [tasks, categories, setTasksSilent, setCategoriesSilent]);

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
    setTasks(currentTasks => {
      const hasTasks = currentTasks.some(t => t.category === id);
      if (hasTasks) {
        throw new Error('Cannot delete category with assigned tasks');
      }
      return currentTasks;
    });
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  const addTask = React.useCallback((taskData: Partial<Task>) => {
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

    let tasksToAdd: Task[] = [];

    if (taskData.isRepeatable && taskData.frequency && taskData.frequency !== 'none') {
      const recurrenceGroupId = crypto.randomUUID();
      const startStr = taskData.dueDate || format(new Date(), 'yyyy-MM-dd');
      const startDate = parseDateString(startStr)!;
      const endDate = taskData.recurrenceEnd
        ? parseDateString(taskData.recurrenceEnd)!
        : addDays(startDate, 30);

      tasksToAdd = generateRecurringTasks({
        baseTask: {
          ...baseTask,
          recurrenceStart: taskData.recurrenceStart || null,
          recurrenceEnd: taskData.recurrenceEnd || null,
        } as Omit<Task, 'id' | 'dueDate'>,
        frequency: taskData.frequency,
        startDate,
        endDate,
        recurrenceGroupId,
        occurrences: taskData.occurrences ?? null,
      });
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

  /**
   * Updates a task with optional support for recurring task series.
   * @param id Task ID to update
   * @param updates Partial task object with fields to update
   * @param applyToFuture If true and task is repeatable, apply updates to all future occurrences in the series
   */
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

          const isSameSeries = t.recurrenceGroupId === groupId ||
            (groupId && t.title === taskToUpdate.title && t.frequency === (updates.frequency || taskToUpdate.frequency) && t.isRepeatable);

          if (isSameSeries && t.dueDate && taskToUpdate.dueDate && t.dueDate > taskToUpdate.dueDate) {
            foundFuture = true;
            const sharedFields: (keyof Task)[] = ['title', 'description', 'notes', 'priority', 'category', 'dueTime', 'subtasks', 'dependencyIds', 'isWatched'];
            const futureUpdates: Partial<Task> = { recurrenceGroupId: groupId };
            sharedFields.forEach(field => {
              if (updates[field] !== undefined) {
                (futureUpdates as any)[field] = updates[field];
              }
            });
            return { ...t, ...futureUpdates };
          }
          return t;
        });

        if (!foundFuture) {
          const newTaskTemplate = { ...taskToUpdate, ...updates, recurrenceGroupId: groupId };
          const frequency = newTaskTemplate.frequency;
          const startStr = newTaskTemplate.dueDate || format(new Date(), 'yyyy-MM-dd');
          const startDate = parseDateString(startStr)!;

          let currentDate = startDate;
          if (frequency === 'daily') currentDate = addDays(currentDate, 1);
          else if (frequency === 'weekly') currentDate = addDays(currentDate, 7);
          else if (frequency === 'monthly') {
            currentDate = new Date(startDate);
            currentDate.setMonth(currentDate.getMonth() + 1);
          }
          else return updatedTasks;

          const endDate = addDays(startDate, 30);
          const tasksToAdd = generateRecurringTasks({
            baseTask: newTaskTemplate as Omit<Task, 'id' | 'dueDate'>,
            frequency,
            startDate: currentDate,
            endDate,
            recurrenceGroupId: groupId,
            occurrences: newTaskTemplate.occurrences ?? null,
          });
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
    categories, setCategories, addCategory, updateCategory, deleteCategory,
    undo: undoTasks, redo: redoTasks, canUndo: canUndoTasks, canRedo: canRedoTasks,
    undoCategory: undoCategories, redoCategory: redoCategories, canUndoCategory: canUndoCategories, canRedoCategory: canRedoCategories
  };
}
