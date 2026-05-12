/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { Plus, X, Tag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Category } from '@/src/types';

interface CategoryFormProps {
  initialCategory?: Category | null;
  onSave: (category: Omit<Category, 'id'>) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
  [key: string]: any;
}

export function CategoryForm({ initialCategory, onSave, onCancel, onDelete }: CategoryFormProps) {
  const [name, setName] = React.useState(initialCategory?.name || '');
  const [color, setColor] = React.useState(initialCategory?.color || '#6366f1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      color,
      icon: 'Tag', // default icon
    });
  };

  const colors = [
    '#6366f1', '#ec4899', '#f59e0b', '#10b981', 
    '#ef4444', '#8b5cf6', '#06b6d4', '#f97316',
    '#0ea5e9', '#64748b'
  ];

  return (
    <div className="flex flex-col">
      <DialogHeader className="p-6 border-b bg-primary/5">
        <DialogTitle className="text-xl font-display font-black text-slate-800 tracking-tight flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Tag className="w-5 h-5 text-white" />
          </div>
          {initialCategory ? 'Edit Category' : 'Create Category'}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Category Name</Label>
          <Input 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Work, Personal, etc." 
            required 
            className="rounded-xl border-slate-100 h-11"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Color</Label>
          <div className="flex flex-wrap gap-2 p-1">
            {colors.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-slate-400 scale-110 shadow-sm' : 'border-transparent hover:scale-105'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onCancel} className="rounded-xl font-bold">Cancel</Button>
            {initialCategory && onDelete && (
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => onDelete(initialCategory.id)}
                className="rounded-xl text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
          <Button type="submit" className="rounded-xl px-8 font-bold shadow-lg shadow-primary/20">
            {initialCategory ? 'Save' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  );
}
