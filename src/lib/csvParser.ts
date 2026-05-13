/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task, Category } from '../types';
import { parse } from 'date-fns';

export interface CSVRow {
  taskName: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  dueDate?: string;
  dueTime?: string;
  isWatched?: string;
}

export interface CSVImportResult {
  success: boolean;
  created: number;
  skipped: number;
  updated: number;
  warnings: string[];
  errors: string[];
  tasks: Task[];
}

function isHeaderRow(values: string[]): boolean {
  const headerKeywords = ['task', 'name', 'description', 'priority', 'category', 'date', 'time', 'watched'];
  const matches = values.filter(v => {
    const normalized = v.toLowerCase().replace(/\s+/g, '');
    return headerKeywords.some(kw => normalized.includes(kw));
  });
  return matches.length >= 2;
}

export function parseCSV(content: string): CSVRow[] {
  const lines = content.trim().split('\n').filter(line => line.trim().length > 0);
  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  const firstRowValues = lines[0].split(',').map(v => v.trim());
  const hasHeader = isHeaderRow(firstRowValues);

  let headerRow: string[];
  let dataStartIndex: number;

  if (hasHeader) {
    headerRow = firstRowValues.map(h => h.toLowerCase().replace(/\s+/g, ''));
    dataStartIndex = 1;
  } else {
    // No header - use default mapping based on column count
    // Default: Task Name, Description, Priority, Category, Due Date, [Due Time], Is Watched
    const colCount = firstRowValues.length;
    if (colCount === 5) {
      headerRow = ['taskname', 'description', 'priority', 'category', 'duedate'];
      dataStartIndex = 0;
    } else if (colCount === 6) {
      headerRow = ['taskname', 'description', 'priority', 'category', 'duedate', 'iswatched'];
      dataStartIndex = 0;
    } else if (colCount === 7) {
      headerRow = ['taskname', 'description', 'priority', 'category', 'duedate', 'duetime', 'iswatched'];
      dataStartIndex = 0;
    } else {
      // Flexible fallback: map by count
      headerRow = [];
      const defaultHeaders = ['taskname', 'description', 'priority', 'category', 'duedate', 'duetime', 'iswatched'];
      for (let i = 0; i < colCount; i++) {
        headerRow.push(defaultHeaders[i] || `col${i}`);
      }
      dataStartIndex = 0;
    }
  }

  const rows: CSVRow[] = [];

  for (let i = dataStartIndex; i < lines.length; i++) {
    const lineContent = lines[i].trim();
    if (!lineContent) continue;

    const values = lines[i].split(',').map(v => v.trim());
    const row: Partial<CSVRow> = {};

    headerRow.forEach((normalizedKey, idx) => {
      const value = values[idx] || '';

      if (normalizedKey === 'taskname' || normalizedKey === 'task' || normalizedKey === 'name') {
        row.taskName = value;
      } else if (normalizedKey === 'description' || normalizedKey === 'desc') {
        row.description = value;
      } else if (normalizedKey === 'priority' || normalizedKey === 'pri') {
        const validPriorities = ['low', 'medium', 'high'] as const;
        const pLower = value.toLowerCase().trim();
        if (validPriorities.includes(pLower as any)) {
          row.priority = pLower as 'low' | 'medium' | 'high';
        }
      } else if (normalizedKey === 'category' || normalizedKey === 'cat') {
        row.category = value;
      } else if (normalizedKey === 'duedate' || normalizedKey === 'date' || normalizedKey === 'due') {
        row.dueDate = value;
      } else if (normalizedKey === 'duetime' || normalizedKey === 'time') {
        row.dueTime = value;
      } else if (normalizedKey === 'iswatched' || normalizedKey === 'watched') {
        row.isWatched = value;
      }
    });

    if (row.taskName && row.taskName.trim()) {
      rows.push(row as CSVRow);
    }
  }

  return rows;
}

export function validateAndCreateTasks(
  csvRows: CSVRow[],
  existingTasks: Task[],
  existingCategories: Category[]
): { result: CSVImportResult; newCategories: Category[] } {
  const result: CSVImportResult = {
    success: true,
    created: 0,
    skipped: 0,
    updated: 0,
    warnings: [],
    errors: [],
    tasks: [],
  };

  const categoryMap = new Map(existingCategories.map(c => [c.name.toLowerCase(), c]));
  const taskNameMap = new Map(existingTasks.map(t => [t.title.toLowerCase(), t]));
  const newCategories: Category[] = [];

  csvRows.forEach((row, idx) => {
    try {
      // Validate task name
      if (!row.taskName || row.taskName.trim() === '') {
        result.errors.push(`Row ${idx + 2}: Task name is required`);
        return;
      }

      const taskNameLower = row.taskName.toLowerCase();

      // Check for existing task
      if (taskNameMap.has(taskNameLower)) {
        result.skipped++;
        result.warnings.push(`Row ${idx + 2}: Task "${row.taskName}" already exists (skipped)`);
        return;
      }

      // Validate and normalize priority (accept any case)
      const priorityStr = (row.priority || 'medium').toLowerCase().trim();
      const priority = priorityStr as 'low' | 'medium' | 'high';
      if (!['low', 'medium', 'high'].includes(priority)) {
        result.errors.push(`Row ${idx + 2}: Invalid priority "${row.priority}" (must be low/medium/high)`);
        return;
      }

      // Handle category
      let categoryId: string | undefined;
      if (row.category && row.category.trim() !== '') {
        const catLower = row.category.toLowerCase();
        let category = categoryMap.get(catLower);

        if (!category) {
          // Create new category
          category = {
            id: crypto.randomUUID(),
            name: row.category,
            color: '#6b7280',
            icon: 'Folder',
          };
          categoryMap.set(catLower, category);
          newCategories.push(category);
          result.warnings.push(`Row ${idx + 2}: Created new category "${row.category}"`);
        }
        categoryId = category.id;
      }

      // Validate and parse due date
      let dueDate: string | undefined;
      if (row.dueDate && row.dueDate.trim() !== '') {
        try {
          // Try YYYY-MM-DD format
          const date = parse(row.dueDate, 'yyyy-MM-dd', new Date());
          if (isNaN(date.getTime())) {
            throw new Error('Invalid date format');
          }
          dueDate = row.dueDate;
        } catch {
          result.errors.push(`Row ${idx + 2}: Invalid due date "${row.dueDate}" (use YYYY-MM-DD)`);
          return;
        }
      }

      // Validate due time format
      let dueTime: string | undefined;
      if (row.dueTime && row.dueTime.trim() !== '') {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(row.dueTime)) {
          result.errors.push(`Row ${idx + 2}: Invalid due time "${row.dueTime}" (use HH:MM)`);
          return;
        }
        dueTime = row.dueTime;
      }

      // Parse is watched
      const isWatched = row.isWatched?.toLowerCase() === 'yes' || row.isWatched?.toLowerCase() === 'true';

      // Create task
      const task: Task = {
        id: crypto.randomUUID(),
        title: row.taskName,
        description: row.description || '',
        priority,
        category: categoryId || 'personal',
        dueDate: dueDate || null,
        dueTime: dueTime || null,
        completed: false,
        isWatched,
        subtasks: [],
        dependencyIds: [],
        isRepeatable: false,
        frequency: 'none',
        createdAt: Date.now(),
        notes: '',
      };

      result.tasks.push(task);
      result.created++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      result.errors.push(`Row ${idx + 2}: ${msg}`);
    }
  });

  return { result, newCategories };
}
