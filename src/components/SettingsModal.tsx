/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { Download, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Task, Category } from '@/src/types';
import { toast } from 'sonner';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: Task[];
  categories: Category[];
  setTasks: (v: Task[] | ((p: Task[]) => Task[])) => void;
  setCategories: (v: Category[] | ((p: Category[]) => Category[])) => void;
}

export const SettingsModal = React.memo(({
  open,
  onOpenChange,
  tasks,
  categories,
  setTasks,
  setCategories,
}: SettingsModalProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [importError, setImportError] = React.useState<string | null>(null);

  const handleDownloadBackup = React.useCallback(() => {
    try {
      const backupData = {
        tasks,
        categories,
        exportedAt: new Date().toISOString(),
        version: '1.0',
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `donext-backup-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Backup downloaded successfully');
    } catch (err) {
      toast.error('Failed to download backup');
      console.error(err);
    }
  }, [tasks, categories]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        setImportError(null);
        const content = event.target?.result as string;
        const data = JSON.parse(content);

        if (!Array.isArray(data.tasks)) {
          throw new Error('Invalid backup format: tasks is not an array');
        }
        if (!Array.isArray(data.categories)) {
          throw new Error('Invalid backup format: categories is not an array');
        }

        setTasks(data.tasks);
        setCategories(data.categories);
        toast.success('Backup restored successfully');
        onOpenChange(false);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to import backup';
        setImportError(errorMsg);
        toast.error(errorMsg);
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [setTasks, setCategories, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings & Backup</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Backup Section */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Backup Data</h3>
              <p className="text-xs text-slate-500 mb-3">
                Download a backup of all your tasks and categories as a JSON file.
              </p>
            </div>
            <Button
              onClick={handleDownloadBackup}
              className="w-full h-10 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Backup
            </Button>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* Restore Section */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Restore Data</h3>
              <p className="text-xs text-slate-500 mb-2">
                Restore your data from a previously downloaded backup file.
              </p>
              <p className="text-xs text-rose-600 font-medium">
                ⚠️ This will replace all current tasks and categories.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Import backup file"
            />

            <Button
              onClick={handleImportClick}
              variant="outline"
              className="w-full h-10 flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import Backup
            </Button>

            {importError && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-start gap-2">
                <X className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                <p className="text-xs text-rose-700">{importError}</p>
              </div>
            )}
          </div>

          {/* Auto-backup Info */}
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
            <p className="text-xs text-slate-600">
              Your tasks are automatically saved to your browser's local storage. Create backups regularly to prevent data loss.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

SettingsModal.displayName = 'SettingsModal';
