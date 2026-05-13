/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { RecurrenceFrequency } from '@/src/types';
import { cn } from '@/lib/utils';

interface RecurrenceSettingsProps {
  frequency: RecurrenceFrequency;
  onFrequencyChange: (f: RecurrenceFrequency) => void;
  startDate: Date | undefined;
  onStartDateChange: (d: Date | undefined) => void;
  endDate: Date | undefined;
  onEndDateChange: (d: Date | undefined) => void;
  defaultOccurrences?: number | null;
}

export function RecurrenceSettings({
  frequency,
  onFrequencyChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  defaultOccurrences,
}: RecurrenceSettingsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="space-y-4 p-4 bg-primary/5 rounded-2xl border border-primary/10 overflow-hidden"
    >
      <div className="space-y-2">
        <Label htmlFor="frequency" className="text-[10px] font-bold text-primary uppercase">Frequency</Label>
        <Select value={frequency} onValueChange={(val: RecurrenceFrequency) => onFrequencyChange(val)}>
          <SelectTrigger className="rounded-xl border-slate-100 h-10 bg-white shadow-sm">
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5 flex flex-col">
          <Label className="text-[10px] font-bold text-primary uppercase">Start</Label>
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal h-10 rounded-xl border-slate-100 bg-white",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                  {startDate ? format(startDate, "MM/dd/yy") : <span>Start</span>}
                </Button>
              }
            />
            <PopoverContent className="w-auto p-0 rounded-2xl shadow-xl transition-all" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={onStartDateChange}
                className="rounded-2xl"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5 flex flex-col">
          <Label className="text-[10px] font-bold text-primary uppercase">Ends</Label>
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal h-10 rounded-xl border-slate-100 bg-white",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                  {endDate ? format(endDate, "MM/dd/yy") : <span>Indefinite</span>}
                </Button>
              }
            />
            <PopoverContent className="w-auto p-0 rounded-2xl shadow-xl transition-all" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={onEndDateChange}
                className="rounded-2xl"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="occurrences" className="text-[10px] font-bold text-primary uppercase">Limit Occurrences</Label>
        <Input
          type="number"
          id="occurrences"
          name="occurrences"
          defaultValue={defaultOccurrences || undefined}
          placeholder="Unlimited"
          className="rounded-xl border-slate-100 h-10 bg-white"
        />
      </div>
    </motion.div>
  );
}
