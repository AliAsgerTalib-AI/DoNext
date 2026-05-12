import React, { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Task } from '@/src/types';

interface QuickAddFormProps {
  onAdd: (taskData: Partial<Task>) => void;
  onMoreOptions: () => void;
  onClose: () => void;
  defaultDate?: Date;
}

export function QuickAddForm({ onAdd, onMoreOptions, onClose, defaultDate }: QuickAddFormProps) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<string>(
    defaultDate ? format(defaultDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({ title: title.trim(), dueDate });
    setTitle('');
    onClose();
  };

  const handleMoreOptions = () => {
    onMoreOptions();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title Input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Task Title</label>
        <Input
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          className="h-12"
        />
      </div>

      {/* Due Date */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Due Date</label>
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="h-12"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={!title.trim()}
          className="flex-1 h-11 bg-primary text-white rounded-xl font-medium hover:bg-primary/90"
        >
          Add Task
        </Button>
        <Button
          type="button"
          onClick={handleMoreOptions}
          variant="outline"
          className="flex-1 h-11 rounded-xl font-medium"
        >
          More Options
        </Button>
      </div>

      <Button
        type="button"
        onClick={onClose}
        variant="ghost"
        className="w-full h-11 text-slate-600"
      >
        Cancel
      </Button>
    </form>
  );
}
