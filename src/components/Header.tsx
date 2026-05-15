/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { Search, SlidersHorizontal, Settings, Undo2, Redo2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
// VOICE INPUT DISABLED
// import { cn } from '@/lib/utils';
// import { useVoiceInput, parseVoiceTranscript } from '@/src/hooks/useVoiceInput';
// import { Task } from '@/src/types';
// import { toast } from 'sonner';

interface HeaderProps {
  onMenuClick?: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isAdvancedFilterOpen?: boolean;
  onToggleAdvancedFilter?: () => void;
  activeAdvancedFilterCount?: number;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onOpenSettings?: () => void;
  // onVoiceAdd?: (taskData: Partial<Task>) => void; // VOICE INPUT DISABLED
  onClockClick?: () => void;
}

export const Header = React.memo(({ onMenuClick, searchQuery, setSearchQuery, isAdvancedFilterOpen, onToggleAdvancedFilter, activeAdvancedFilterCount, onUndo, onRedo, canUndo, canRedo, onOpenSettings, onClockClick }: HeaderProps) => {
  /* VOICE INPUT DISABLED
  const [voiceTranscript, setVoiceTranscript] = React.useState('');
  const voiceTranscriptRef = React.useRef('');

  const handleVoiceResult = React.useCallback((transcript: string) => {
    // Store in both state (for UI) and ref (for click handler)
    console.log('📝 Voice transcript:', transcript);
    voiceTranscriptRef.current = transcript;
    setVoiceTranscript(transcript);
  }, []);

  const handleAutoStop = React.useCallback((transcript: string) => {
    // Auto-stop triggered by silence detection
    console.log('🔇 AUTO-STOP triggered with transcript:', transcript);
    if (transcript.trim()) {
      try {
        console.log('✅ PROCESSING auto-stop transcript:', transcript);
        const taskData = parseVoiceTranscript(transcript);
        console.log('✅ PARSED auto-stop data:', taskData);
        console.log('✅ Task will have dueDate:', taskData.dueDate || 'NULL (unscheduled)');

        if (onVoiceAdd) {
          console.log('🔔 CALLING onVoiceAdd from auto-stop with:', taskData);
          onVoiceAdd(taskData);
          console.log('✔️ onVoiceAdd called successfully');
        } else {
          console.log('❌ ERROR: onVoiceAdd is undefined!');
        }

        toast.success(`Created: "${taskData.title}"`);
        voiceTranscriptRef.current = '';
        setVoiceTranscript('');
      } catch (error) {
        console.error('❌ ERROR in handleAutoStop:', error);
        toast.error('Failed to create task from voice');
      }
    }
  }, [onVoiceAdd]);

  const { isListening, isSupported, startListening, stopListening, transcript: micTranscript } = useVoiceInput(handleVoiceResult, handleAutoStop);

  // When user clicks stop button, process the full transcript
  const handleMicClick = React.useCallback(() => {
    if (isListening) {
      const transcript = voiceTranscriptRef.current;
      console.log('⏹️ STOPPING - transcript:', transcript);

      if (transcript.trim()) {
        try {
          console.log('✅ PROCESSING:', transcript);
          const taskData = parseVoiceTranscript(transcript);
          console.log('✅ PARSED DATA:', taskData);
          console.log('✅ Task will have dueDate:', taskData.dueDate || 'NULL (unscheduled)');

          if (onVoiceAdd) {
            console.log('🔔 CALLING onVoiceAdd with:', taskData);
            onVoiceAdd(taskData);
            console.log('✔️ onVoiceAdd called successfully');
          } else {
            console.log('❌ ERROR: onVoiceAdd is undefined!');
          }

          toast.success(`Created: "${taskData.title}"`);
          voiceTranscriptRef.current = '';
          setVoiceTranscript('');
        } catch (error) {
          console.error('❌ ERROR in handleMicClick:', error);
          toast.error('Failed to create task from voice');
        }
      } else {
        console.log('❌ NO TRANSCRIPT');
        toast.info('No speech detected');
      }
      stopListening();
    } else {
      console.log('▶️ STARTING MICROPHONE');
      voiceTranscriptRef.current = '';
      setVoiceTranscript('');
      startListening();
      toast.info('Listening... speak now');
    }
  }, [isListening, onVoiceAdd, stopListening, startListening]);
  VOICE INPUT DISABLED */
  return (
    <header className="h-14 md:h-20 border-b bg-card px-4 md:px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm shadow-slate-100 shrink-0">
      {/* Hamburger Menu - Mobile Only */}
      {onMenuClick && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden h-10 w-10 rounded-lg shrink-0"
          title="Menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
      )}

      <div className="relative w-full max-w-[180px] md:max-w-none md:w-96 ml-2 md:ml-0">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          className="pl-11 h-11 bg-slate-50 border-slate-100 focus-visible:ring-2 focus-visible:ring-primary/20 rounded-xl font-medium"
          placeholder="Search tasks, categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-4">
        {onToggleAdvancedFilter && (
          <Button
            variant={isAdvancedFilterOpen ? 'secondary' : 'ghost'}
            size="icon"
            onClick={onToggleAdvancedFilter}
            className="relative h-11 w-11 rounded-xl"
            title="Advanced Filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {activeAdvancedFilterCount && activeAdvancedFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {activeAdvancedFilterCount}
              </span>
            )}
          </Button>
        )}

        {onUndo && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onUndo}
            disabled={!canUndo}
            className="h-11 w-11 rounded-xl disabled:opacity-30"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
        )}

        {onRedo && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRedo}
            disabled={!canRedo}
            className="h-11 w-11 rounded-xl disabled:opacity-30"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        )}

        {onOpenSettings && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            className="h-11 w-11 rounded-xl"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
        )}

        {/* VOICE INPUT DISABLED
        {onVoiceAdd && isSupported && (
          <Button
            variant={isListening ? 'secondary' : 'ghost'}
            size="icon"
            onClick={handleMicClick}
            className={cn(
              'h-11 w-11 rounded-xl transition-all',
              isListening && 'animate-pulse'
            )}
            title={isListening ? `Listening: "${voiceTranscript}"... (click to stop)` : 'Add task by voice'}
          >
            {isListening ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4" />}
          </Button>
        )}
        VOICE INPUT DISABLED */}

        <span className="hidden md:flex">
          <HeaderClock onClick={onClockClick} />
        </span>
      </div>
    </header>
  );
});

const HeaderClock = React.memo(({ onClick }: { onClick?: () => void }) => {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-end cursor-pointer hover:text-primary/80 transition-colors"
      title="Go to Daily View"
    >
      <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">{format(currentTime, 'EEEE, MMMM do')}</span>
      <span className="text-2xl font-display font-black text-primary tabular-nums tracking-tight leading-none mt-1">{format(currentTime, 'pp')}</span>
    </button>
  );
});
