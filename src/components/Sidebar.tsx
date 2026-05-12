/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { 
  LayoutDashboard, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  History, 
  Zap, 
  Target, 
  Plus, 
  Settings,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Category } from '@/src/types';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  activeFilter: string;
  setActiveFilter: (filter: any) => void;
  categories: Category[];
  onAddCategory: () => void;
  onEditCategory: (cat: Category) => void;
}

export const Sidebar = React.memo(({ 
  activeCategory, 
  setActiveCategory, 
  activeFilter, 
  setActiveFilter, 
  categories,
  onAddCategory,
  onEditCategory
}: SidebarProps) => {
  return (
    <aside className="w-52 bg-primary flex flex-col p-4 gap-6 shrink-0">
      <div className="flex items-center gap-2 px-1 mb-2 text-white">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-lg font-display font-black tracking-tight">DoNext</h1>
      </div>

      <nav className="flex-1 flex flex-col gap-6">
        <div className="space-y-1">
          <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest px-2 mb-2">Menu</p>
          <SidebarItem 
            icon={<LayoutDashboard className="w-4 h-4" />} 
            label="Dashboard" 
            active={activeCategory === 'all' && activeFilter === 'all'} 
            onClick={() => { setActiveCategory('all'); setActiveFilter('all'); }}
          />
          <SidebarItem 
            icon={<Clock className="w-4 h-4" />} 
            label="Today" 
            active={activeFilter === 'active'} 
            onClick={() => setActiveFilter('active')}
          />
          <SidebarItem 
            icon={<CheckCircle className="w-4 h-4" />} 
            label="Completed" 
            active={activeFilter === 'completed'} 
            onClick={() => setActiveFilter('completed')}
          />
        </div>

        <div className="space-y-1">
          <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest px-2 mb-2">Smart Folders</p>
          <SidebarItem 
            icon={<AlertTriangle className="w-4 h-4" />} 
            label="Blocked" 
            active={activeFilter === 'blocked'} 
            onClick={() => { setActiveCategory('smart'); setActiveFilter('blocked'); }}
          />
          <SidebarItem 
            icon={<History className="w-4 h-4 text-rose-300" />} 
            label="Overdue" 
            active={activeFilter === 'overdue'} 
            onClick={() => { setActiveCategory('smart'); setActiveFilter('overdue'); }}
          />
          <SidebarItem 
            icon={<Zap className="w-4 h-4 text-amber-300" />} 
            label="Unscheduled" 
            active={activeFilter === 'unscheduled'} 
            onClick={() => { setActiveCategory('smart'); setActiveFilter('unscheduled'); }}
          />
          <SidebarItem 
            icon={<Target className="w-4 h-4 text-sky-300" />} 
            label="Urgent" 
            active={activeFilter === 'urgent'} 
            onClick={() => { setActiveCategory('smart'); setActiveFilter('urgent'); }}
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Categories</p>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-4 w-4 text-white/50 hover:text-white"
              onClick={onAddCategory}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          <ScrollArea className="h-40">
            {categories.map(cat => (
              <div key={cat.id} className="group relative">
                <SidebarItem 
                  icon={<div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />} 
                  label={cat.name} 
                  active={activeCategory === cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-white hover:bg-white/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditCategory(cat);
                  }}
                >
                  <Settings className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </ScrollArea>
        </div>
      </nav>
    </aside>
  );
});

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem = React.memo(({ icon, label, active, onClick }: SidebarItemProps) => {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm font-bold tracking-tight text-left",
        active 
          ? "bg-white text-primary shadow-lg shadow-black/5 scale-[1.02]" 
          : "text-white/70 hover:bg-white/10 hover:text-white"
      )}
    >
      <span className={cn(
        "transition-transform duration-200 group-hover:scale-110",
        active ? "text-primary" : "text-white/60"
      )}>
        {icon}
      </span>
      {label}
    </button>
  );
});
