/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { Search, SlidersHorizontal, Settings, Undo2, Redo2, Menu, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useVoiceInput, parseVoiceTranscript } from '@/src/hooks/useVoiceInput';
import { Task } from '@/src/types';
import { toast } from 'sonner';

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
  onVoiceAdd?: (taskData: Partial<Task>) => void;
  onClockClick?: () => void;
}

export const Header = React.memo(({ onMenuClick, searchQuery, setSearchQuery, isAdvancedFilterOpen, onToggleAdvancedFilter, activeAdvancedFilterCount, onUndo, onRedo, canUndo, canRedo, onOpenSettings, onVoiceAdd, onClockClick }: HeaderProps) => {
  const [voiceTranscript, setVoiceTranscript] = React.useState('');
  const voiceTranscriptRef = React.useRef('');

  React.useEffect(() => {
    console.log('🎤 Header rendering - Voice support:', {
      onVoiceAdd: !!onVoiceAdd,
      isListening: false,
      micSupported: true
    });
  }, [onVoiceAdd]);

  const handleVoiceResult = React.useCallback((transcript: string) => {
    // Store in both state (for UI) and ref (for click handler)
    console.log('📝 Voice transcript:', transcript);
    voiceTranscriptRef.current = transcript;
    setVoiceTranscript(transcript);
  }, []);

  const { isListening, isSupported, startListening, stopListening, transcript: micTranscript } = useVoiceInput(handleVoiceResult);

  // When user clicks stop button, process the full transcript
  const handleMicClick = React.useCallback(() => {
    console.log('🎤 Mic button clicked - isListening:', isListening, 'transcript from ref:', voiceTranscriptRef.current);

    if (isListening) {
      // User is stopping - process the voice input
      const transcript = voiceTranscriptRef.current;
      console.log('⏹️ Stopping - transcript from ref:', transcript);
      if (transcript.trim()) {
        console.log('✅ Processing transcript:', transcript);
        const taskData = parseVoiceTranscript(transcript);
        console.log('✅ Parsed task data:', taskData);
        onVoiceAdd?.(taskData);
        toast.success(`Created: "${taskData.title}"`);
        voiceTranscriptRef.current = '';
        setVoiceTranscript('');
      } else {
        console.log('❌ No transcript found');
        toast.info('No speech detected');
      }
      stopListening();
    } else {
      // Start listening
      console.log('▶️ Starting microphone');
      voiceTranscriptRef.current = '';
      setVoiceTranscript('');
      startListening();
      toast.info('Listening... speak now');
    }
  }, [isListening, onVoiceAdd, stopListening, startListening]);
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
