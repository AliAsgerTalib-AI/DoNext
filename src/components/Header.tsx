/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header = React.memo(({ searchQuery, setSearchQuery }: HeaderProps) => {
  return (
    <header className="h-20 border-b bg-card px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm shadow-slate-100 shrink-0">
      <div className="relative w-96 max-w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          className="pl-11 h-11 bg-slate-50 border-slate-100 focus-visible:ring-2 focus-visible:ring-primary/20 rounded-xl font-medium" 
          placeholder="Search tasks, categories..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-6">
        <HeaderClock />
      </div>
    </header>
  );
});

const HeaderClock = React.memo(() => {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-end">
      <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">{format(currentTime, 'EEEE, MMMM do')}</span>
      <span className="text-2xl font-display font-black text-primary tabular-nums tracking-tight leading-none mt-1">{format(currentTime, 'pp')}</span>
    </div>
  );
});
