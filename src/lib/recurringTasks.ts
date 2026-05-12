/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task, RecurrenceFrequency } from '../types';
import { addDays, addMonths, format, isBefore, isSameDay } from 'date-fns';

const MAX_RECURRING_INSTANCES = 100;

interface GenerateRecurringTasksOptions {
  baseTask: Omit<Task, 'id' | 'dueDate'>;
  frequency: RecurrenceFrequency;
  startDate: Date;
  endDate: Date;
  recurrenceGroupId: string;
  occurrences?: number | null;
}

/**
 * Generates an array of recurring task instances based on frequency and date range.
 * Capped at MAX_RECURRING_INSTANCES (100) to prevent excessive data generation.
 * @param options Configuration for recurring task generation
 * @returns Array of Task instances with unique IDs and properly formatted due dates
 */
export function generateRecurringTasks(options: GenerateRecurringTasksOptions): Task[] {
  const { baseTask, frequency, startDate, endDate, recurrenceGroupId, occurrences } = options;

  if (frequency === 'none') return [];

  const maxCount = occurrences != null && occurrences > 0
    ? Math.min(occurrences, MAX_RECURRING_INSTANCES)
    : MAX_RECURRING_INSTANCES;

  const tasksToAdd: Task[] = [];
  let currentDate = startDate;
  let count = 0;

  while ((isBefore(currentDate, endDate) || isSameDay(currentDate, endDate)) && count < maxCount) {
    tasksToAdd.push({
      ...baseTask,
      id: crypto.randomUUID(),
      dueDate: format(currentDate, 'yyyy-MM-dd'),
      isRepeatable: true,
      frequency,
      recurrenceGroupId,
    } as Task);

    if (frequency === 'daily') {
      currentDate = addDays(currentDate, 1);
    } else if (frequency === 'weekly') {
      currentDate = addDays(currentDate, 7);
    } else if (frequency === 'monthly') {
      currentDate = addMonths(currentDate, 1);
    } else {
      break;
    }

    count++;
  }

  return tasksToAdd;
}

/**
 * Parses a date string in yyyy-MM-dd format to a Date object.
 * @param dateStr Date string in yyyy-MM-dd format, or null/undefined
 * @returns Date object or null if input is falsy
 */
export function parseDateString(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}
