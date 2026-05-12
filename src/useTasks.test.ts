import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useTasks } from './useTasks';

describe('useTasks Hook', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should initialize with default categories', () => {
    const { result } = renderHook(() => useTasks());
    expect(result.current.categories.length).toBeGreaterThan(0);
  });

  it('should add a task', () => {
    const { result } = renderHook(() => useTasks());
    
    act(() => {
      result.current.addTask({
        title: 'Test Task',
        priority: 'medium'
      });
    });

    expect(result.current.tasks.length).toBe(1);
    expect(result.current.tasks[0].title).toBe('Test Task');
  });

  it('should toggle a task status', () => {
    const { result } = renderHook(() => useTasks());
    
    act(() => {
      result.current.addTask({
        title: 'Toggle Task'
      });
    });

    const taskId = result.current.tasks[0].id;

    act(() => {
      result.current.toggleTask(taskId);
    });

    expect(result.current.tasks[0].completed).toBe(true);
  });

  it('should delete a task', () => {
    const { result } = renderHook(() => useTasks());
    
    act(() => {
      result.current.addTask({
        title: 'Delete Task'
      });
    });

    const taskId = result.current.tasks[0].id;

    act(() => {
      result.current.deleteTask(taskId);
    });

    expect(result.current.tasks.length).toBe(0);
  });

  it('should add multiple tasks for repeating tasks', () => {
    const { result } = renderHook(() => useTasks());
    
    act(() => {
      // Setup a week's worth of tasks by setting recurrenceEnd
      const today = new Date(2026, 4, 7); // May 7, 2026
      const end = new Date(today);
      end.setDate(end.getDate() + 2); // 3 days total (7, 8, 9)

      result.current.addTask({
        title: 'Repeat Task',
        isRepeatable: true,
        frequency: 'daily',
        dueDate: '2026-05-07',
        recurrenceEnd: '2026-05-09'
      });
    });

    // May 7, 8, 9 -> 3 tasks
    expect(result.current.tasks.length).toBe(3);
  });
});
