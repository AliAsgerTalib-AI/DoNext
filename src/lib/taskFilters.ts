/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task, Priority } from '@/src/types';

interface FilterOptions {
  searchQuery: string;
  activeCategory: string;
  activeFilter: 'all' | 'active' | 'completed' | 'urgent' | 'blocked' | 'overdue' | 'unscheduled';
  advancedFilters: { dateFrom?: string; dateTo?: string; priorities?: Priority[] };
  todayStr: string;
  tasks: Task[];
}

const matchesSearchFilter = (task: Task, searchQuery: string) =>
  task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  task.description.toLowerCase().includes(searchQuery.toLowerCase());

const matchesCategoryFilter = (task: Task, activeCategory: string) =>
  activeCategory === 'all' || task.category === activeCategory;

const getTaskStatus = (task: Task, todayStr: string, allTasks: Task[]) => {
  const isToday = task.dueDate === todayStr;
  const isOverdue = task.dueDate && task.dueDate < todayStr && !task.completed;
  const isUnscheduled = !task.dueDate;
  const isBlocked = task.dependencyIds?.some(id => {
    const dep = allTasks.find(t => t.id === id);
    return dep && !dep.completed;
  }) || false;

  return { isToday, isOverdue, isUnscheduled, isBlocked };
};

const matchesStatusFilter = (task: Task, activeFilter: string, todayStr: string, allTasks: Task[]) => {
  const { isToday, isOverdue, isUnscheduled, isBlocked } = getTaskStatus(task, todayStr, allTasks);

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

export function filterTasks(
  tasks: Task[],
  options: FilterOptions
): Task[] {
  const { searchQuery, activeCategory, activeFilter, advancedFilters, todayStr } = options;

  const showTodayOnlyMode = ['all', 'active', 'completed', 'urgent'].includes(activeFilter);

  return tasks
    .filter(task => {
      if (!matchesSearchFilter(task, searchQuery)) return false;
      if (!matchesCategoryFilter(task, activeCategory)) return false;
      if (!matchesStatusFilter(task, activeFilter, todayStr, tasks)) return false;

      // In dashboard mode, only show today's tasks (unless a smart folder is active)
      if (showTodayOnlyMode && activeCategory !== 'smart') {
        return getTaskStatus(task, todayStr, tasks).isToday;
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
}
