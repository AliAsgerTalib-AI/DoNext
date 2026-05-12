import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Bug, Trash2, Database, Zap, ClipboardList } from 'lucide-react';
import { Task, Category } from '../types';
import { toast } from 'sonner';

interface DevToolsProps {
  tasks: Task[];
  categories: Category[];
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void;
  setCategories: (categories: Category[] | ((prev: Category[]) => Category[])) => void;
}

export const DevTools = ({ tasks, categories, setTasks, setCategories }: DevToolsProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const clearData = () => {
    setTasks([]);
    localStorage.removeItem('chronos-tasks');
    toast.success('All tasks cleared');
  };

  const generateMockTasks = () => {
    const newTasks: Task[] = [];
    const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    const titles = ['Review project proposal', 'Client meeting', 'Update documentation', 'Refactor backend', 'Design new UI', 'Bug fixes', 'Team sync', 'Email catchup', 'Lunch with colleague', 'Workout session'];
    
    for (let i = 0; i < 20; i++) {
      const date = new Date();
      date.setDate(date.getDate() + Math.floor(Math.random() * 10) - 2);
      
      newTasks.push({
        id: crypto.randomUUID(),
        title: `${titles[i % titles.length]} #${i + 1}`,
        description: 'Automated mock task for testing scroll and state.',
        notes: '',
        completed: Math.random() > 0.7,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        category: categories[Math.floor(Math.random() * categories.length)].id,
        dueDate: date.toISOString().split('T')[0],
        dueTime: `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:00`,
        subtasks: [],
        createdAt: Date.now(),
        isWatched: Math.random() > 0.8,
        isRepeatable: false,
        frequency: 'none'
      });
    }
    
    setTasks(prev => [...newTasks, ...prev]);
    toast.success('Generated 20 mock tasks');
  };

  const copyTasksJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(tasks, null, 2));
    toast.success('Tasks JSON copied to clipboard');
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-2 bg-slate-800 text-white rounded-full shadow-lg hover:scale-110 transition-transform z-[100] opacity-20 hover:opacity-100"
        title="Open Dev Tools"
      >
        <Bug className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md shadow-2xl border-slate-200 animate-in zoom-in-95 duration-200">
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-xl">
            <div className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-slate-700" />
              <h2 className="font-black text-slate-800 uppercase tracking-widest text-sm">Testing Surface</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={generateMockTasks}
                className="h-20 flex flex-col items-center justify-center gap-2 border-slate-200 hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <Zap className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase">Generate Mock</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={copyTasksJSON}
                className="h-20 flex flex-col items-center justify-center gap-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <Database className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase">Export JSON</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={clearData}
                className="h-20 flex flex-col items-center justify-center gap-2 border-slate-200 hover:border-destructive hover:bg-destructive/5 transition-all group"
              >
                <Trash2 className="w-6 h-6 text-destructive group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase">Clear All</span>
              </Button>
              <div className="h-20 flex flex-col items-center justify-center gap-1 border border-slate-100 rounded-xl bg-slate-50/50">
                <ClipboardList className="w-5 h-5 text-slate-400" />
                <span className="text-[10px] font-black text-slate-500 uppercase">State Stats</span>
                <span className="text-xs font-black text-slate-700">{tasks.length} tasks</span>
              </div>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Storage Inspection</span>
                <span className="text-[9px] font-black text-emerald-500 uppercase">Active</span>
              </div>
              <ScrollArea className="h-32">
                <pre className="text-[10px] text-slate-300 font-mono leading-relaxed opacity-80">
                  {JSON.stringify({ 
                    taskCount: tasks.length, 
                    categoriesCount: categories.length,
                    environment: 'development',
                    localTime: new Date().toISOString()
                  }, null, 2)}
                </pre>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
