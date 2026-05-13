/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { Download, Upload, X, FileUp } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Task, Category } from '@/src/types';
import { toast } from 'sonner';
import { parseCSV, validateAndCreateTasks } from '../lib/csvParser';

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
  const csvFileInputRef = React.useRef<HTMLInputElement>(null);
  const [importError, setImportError] = React.useState<string | null>(null);
  const [csvImportState, setCsvImportState] = React.useState<{ warnings: string[]; errors: string[] } | null>(null);

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

  const handleCsvImportClick = () => {
    csvFileInputRef.current?.click();
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

  const handleCsvFileChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        setCsvImportState(null);
        const content = event.target?.result as string;
        const csvRows = parseCSV(content);

        const { result, newCategories } = validateAndCreateTasks(csvRows, tasks, categories);

        if (result.errors.length > 0 && result.created === 0) {
          toast.error(`CSV Import failed: ${result.errors.length} error(s)`);
          setCsvImportState({ warnings: result.warnings, errors: result.errors });
          return;
        }

        // Add new categories first
        if (newCategories.length > 0) {
          setCategories((prev) => [...prev, ...newCategories]);
        }

        // Add new tasks
        if (result.tasks.length > 0) {
          setTasks((prev) => [...prev, ...result.tasks]);
        }

        // Show summary
        const summary = [
          `✓ Created ${result.created} task${result.created !== 1 ? 's' : ''}`,
          result.skipped > 0 ? `⊘ Skipped ${result.skipped}` : '',
          newCategories.length > 0 ? `+ Added ${newCategories.length} categor${newCategories.length !== 1 ? 'ies' : 'y'}` : '',
        ].filter(Boolean).join(' • ');

        toast.success(summary);

        if (result.warnings.length > 0 || result.errors.length > 0) {
          setCsvImportState({ warnings: result.warnings, errors: result.errors });
        } else {
          onOpenChange(false);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to import CSV';
        toast.error(errorMsg);
        setCsvImportState({ warnings: [], errors: [errorMsg] });
      }
    };
    reader.readAsText(file);

    if (csvFileInputRef.current) {
      csvFileInputRef.current.value = '';
    }
  }, [tasks, categories, setTasks, setCategories, onOpenChange]);

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

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* CSV Import Section */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Import Tasks from CSV</h3>
              <p className="text-xs text-slate-500 mb-3">
                Add tasks in bulk from a CSV file. Use the template below as a guide.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                ref={csvFileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCsvFileChange}
                className="hidden"
                aria-label="Import CSV file"
              />

              <Button
                onClick={handleCsvImportClick}
                variant="outline"
                className="flex-1 h-10 flex items-center justify-center gap-2"
              >
                <FileUp className="w-4 h-4" />
                Upload CSV
              </Button>

              <Button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = '/task-template.csv';
                  link.download = 'task-template.csv';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  toast.success('Template downloaded');
                }}
                variant="ghost"
                className="h-10 px-3"
                title="Download CSV template"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>

            {csvImportState && (
              <div className="space-y-2">
                {csvImportState.errors.length > 0 && (
                  <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 space-y-1">
                    <p className="text-xs font-bold text-rose-700">Errors ({csvImportState.errors.length}):</p>
                    <ul className="text-xs text-rose-700 space-y-0.5">
                      {csvImportState.errors.slice(0, 5).map((err, i) => (
                        <li key={i}>• {err}</li>
                      ))}
                      {csvImportState.errors.length > 5 && (
                        <li>• ... and {csvImportState.errors.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}

                {csvImportState.warnings.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1">
                    <p className="text-xs font-bold text-amber-700">Warnings ({csvImportState.warnings.length}):</p>
                    <ul className="text-xs text-amber-700 space-y-0.5">
                      {csvImportState.warnings.slice(0, 5).map((warn, i) => (
                        <li key={i}>• {warn}</li>
                      ))}
                      {csvImportState.warnings.length > 5 && (
                        <li>• ... and {csvImportState.warnings.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
              <p className="text-xs font-bold text-blue-900">CSV Format:</p>
              <code className="text-xs text-blue-800 block whitespace-pre-wrap break-words">
                Task Name,Description,Priority,Category,Due Date,Due Time,Is Watched
              </code>
              <ul className="text-xs text-blue-800 space-y-1 ml-3 list-disc">
                <li>Priority: low, medium, or high (any case: Low, LOW, MEDIUM, etc.)</li>
                <li>Due Date: YYYY-MM-DD format</li>
                <li>Due Time: HH:MM format (24-hour)</li>
                <li>Is Watched: yes or no</li>
                <li>Categories are created automatically if they don't exist</li>
              </ul>
            </div>
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
