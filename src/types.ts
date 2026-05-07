/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Priority = 'low' | 'medium' | 'high';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'none';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  category: string;
  dueDate: string | null;
  dueTime?: string | null;
  subtasks: Subtask[];
  isRepeatable: boolean;
  frequency: RecurrenceFrequency;
  recurrenceStart?: string | null;
  recurrenceEnd?: string | null;
  occurrences?: number | null;
  isWatched: boolean;
  dependencyIds?: string[];
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: 'Work', color: '#6366f1', icon: 'Briefcase' },
  { id: 'personal', name: 'Personal', color: '#ec4899', icon: 'User' },
  { id: 'shopping', name: 'Shopping', color: '#f59e0b', icon: 'ShoppingCart' },
  { id: 'health', name: 'Health', color: '#10b981', icon: 'Activity' },
];
