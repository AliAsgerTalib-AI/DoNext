/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { format, parse } from 'date-fns';
import { motion } from 'motion/react';
import { Task } from '@/src/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WatchedTasksListProps {
  tasks: Task[];
  onNavigateToDailyView?: (date: Date) => void;
  onOpenTask: (task: Task) => void;
  onCloseModal?: () => void;
}

const getPriorityIcon = (priority: string) => {
  const icons: Record<string, string> = {
    high: '⚡',
    medium: '◆',
    low: '○',
  };
  return icons[priority] || '○';
};

export const WatchedTasksList = React.memo(({
  tasks,
  onNavigateToDailyView,
  onOpenTask,
  onCloseModal,
}: WatchedTasksListProps) => {
  const sortedTasks = React.useMemo(() => {
    return tasks.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      const dateCompare = a.dueDate.localeCompare(b.dueDate);
      if (dateCompare !== 0) return dateCompare;
      return (a.dueTime || '').localeCompare(b.dueTime || '');
    });
  }, [tasks]);

  return (
    <ScrollArea className="flex-1">
      {sortedTasks.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {sortedTasks.map(task => {
            const dateStr = task.dueDate ? format(parse(task.dueDate, 'yyyy-MM-dd', new Date()), 'MMM d') : 'No date';
            const timeStr = task.dueTime ? format(parse(task.dueTime, 'HH:mm', new Date()), 'h:mm a') : '';

            return (
              <motion.button
                key={task.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => {
                  onOpenTask(task);
                  onCloseModal?.();
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 active:bg-slate-100 transition-colors flex items-center gap-2 group"
              >
                <span className="text-xs shrink-0 group-hover:scale-125 transition-transform">
                  {getPriorityIcon(task.priority)}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (task.dueDate && onNavigateToDailyView) {
                      const [year, month, day] = task.dueDate.split('-').map(Number);
                      onNavigateToDailyView(new Date(year, month - 1, day));
                      onCloseModal?.();
                    }
                  }}
                  className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors shrink-0 whitespace-nowrap"
                >
                  {dateStr}
                  {timeStr && ` ${timeStr}`}
                </button>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-slate-900 truncate">
                    {task.title}
                  </h4>
                </div>
              </motion.button>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 text-slate-400 text-xs font-bold italic">
          No watched tasks
        </div>
      )}
    </ScrollArea>
  );
});

WatchedTasksList.displayName = 'WatchedTasksList';
