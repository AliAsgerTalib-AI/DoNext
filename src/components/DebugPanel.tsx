import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogEntry {
  id: string;
  message: string;
  timestamp: string;
}

export const DebugPanel = () => {
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = React.useState(true);
  const originalLog = React.useRef(console.log);

  React.useEffect(() => {
    // Override console.log to capture messages
    console.log = (...args: any[]) => {
      originalLog.current?.(...args);

      const message = args
        .map(arg => {
          if (typeof arg === 'object') {
            return JSON.stringify(arg, null, 2);
          }
          return String(arg);
        })
        .join(' ');

      const now = new Date();
      const timestamp = now.toLocaleTimeString();

      setLogs(prev => [
        ...prev.slice(-20), // Keep last 20 logs
        {
          id: `${Date.now()}-${Math.random()}`,
          message,
          timestamp
        }
      ]);
    };

    return () => {
      console.log = originalLog.current;
    };
  }, []);

  return (
    <div className="fixed bottom-20 right-4 z-50 font-mono text-xs max-w-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-900 text-white px-3 py-2 rounded-t-lg flex items-center justify-between hover:bg-slate-800 transition-colors"
      >
        <span className="font-bold">Debug Console</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", !isOpen && "-rotate-90")} />
      </button>

      {isOpen && (
        <div className="bg-slate-950 text-slate-100 rounded-b-lg border border-t-0 border-slate-700 max-h-48 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="p-3 text-slate-500">Waiting for messages...</div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="p-2 border-b border-slate-800 last:border-0">
                <div className="text-slate-400 text-[10px]">{log.timestamp}</div>
                <div className="text-slate-200 whitespace-pre-wrap break-words">{log.message}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
