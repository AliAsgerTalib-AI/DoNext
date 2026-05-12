/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { Task } from '@/src/types';
import { cn } from '@/lib/utils';

interface DependencyGraphProps {
  task: Task;
  allTasks: Task[];
  onNavigateToTask?: (taskId: string) => void;
}

export function DependencyGraph({ task, allTasks, onNavigateToTask }: DependencyGraphProps) {
  // Direct predecessors (tasks this task depends on)
  const predecessors = (task.dependencyIds ?? [])
    .map(id => allTasks.find(t => t.id === id))
    .filter((t): t is Task => !!t);

  // Direct successors (tasks that depend on this task)
  const successors = allTasks.filter(t =>
    t.dependencyIds?.includes(task.id) ?? false
  );

  if (predecessors.length === 0 && successors.length === 0) return null;

  return (
    <div className="flex items-center justify-center gap-2 text-[11px]">
      {/* Predecessors */}
      {predecessors.length > 0 && (
        <div className="flex flex-col gap-1">
          {predecessors.map(pred => (
            <button
              key={pred.id}
              onClick={() => onNavigateToTask?.(pred.id)}
              className={cn(
                "px-2 py-1 rounded-lg border text-[10px] font-bold transition-all hover:shadow-md",
                pred.completed
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-primary/5 hover:border-primary/30"
              )}
              title={`Click to view: ${pred.title}`}
            >
              <div className="flex items-center gap-1">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  pred.completed ? "bg-emerald-500" : "bg-slate-400"
                )} />
                {pred.title.length > 12 ? `${pred.title.substring(0, 12)}…` : pred.title}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Arrow or current task indicator */}
      {predecessors.length > 0 && (
        <div className="text-slate-300 font-black">→</div>
      )}

      {/* Current task (read-only) */}
      <div className={cn(
        "px-2 py-1 rounded-lg border text-[10px] font-bold",
        task.completed
          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : "bg-primary/10 border-primary/30 text-primary"
      )}>
        <div className="flex items-center gap-1">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            task.completed ? "bg-emerald-500" : "bg-primary"
          )} />
          {task.title.length > 12 ? `${task.title.substring(0, 12)}…` : task.title}
        </div>
      </div>

      {/* Arrow to successors */}
      {successors.length > 0 && (
        <div className="text-slate-300 font-black">→</div>
      )}

      {/* Successors */}
      {successors.length > 0 && (
        <div className="flex flex-col gap-1">
          {successors.map(succ => (
            <button
              key={succ.id}
              onClick={() => onNavigateToTask?.(succ.id)}
              className={cn(
                "px-2 py-1 rounded-lg border text-[10px] font-bold transition-all hover:shadow-md",
                succ.completed
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-primary/5 hover:border-primary/30"
              )}
              title={`Click to view: ${succ.title}`}
            >
              <div className="flex items-center gap-1">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  succ.completed ? "bg-emerald-500" : "bg-slate-400"
                )} />
                {succ.title.length > 12 ? `${succ.title.substring(0, 12)}…` : succ.title}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
