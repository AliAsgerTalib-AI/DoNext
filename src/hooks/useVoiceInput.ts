import React from 'react';
import { Task } from '@/src/types';
import { format, addDays, parse, nextMonday, nextTuesday, nextWednesday, nextThursday, nextFriday, nextSaturday, nextSunday, isMonday, isTuesday, isWednesday, isThursday, isFriday, isSaturday, isSunday } from 'date-fns';
import { toast } from 'sonner';

function parseTime(timeStr: string): string | null {
  const match = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(?:a\.?m\.?|p\.?m\.?|am|pm)?/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;

  // Check if PM
  if (/p\.?m\.?|pm/i.test(timeStr)) {
    if (hours !== 12) hours += 12;
  } else if (/a\.?m\.?|am/i.test(timeStr)) {
    if (hours === 12) hours = 0;
  }

  // Validate hours
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function parseDate(text: string): string | null {
  const lowerText = text.toLowerCase();
  const today = new Date();

  // Day names
  const dayMap: Record<string, (d: Date) => Date> = {
    monday: nextMonday,
    tuesday: nextTuesday,
    wednesday: nextWednesday,
    thursday: nextThursday,
    friday: nextFriday,
    saturday: nextSaturday,
    sunday: nextSunday,
  };

  // Check for day names (Monday, Tuesday, etc.)
  for (const [dayName, nextDayFn] of Object.entries(dayMap)) {
    if (lowerText.includes(dayName)) {
      const nextDay = nextDayFn(today);
      return format(nextDay, 'yyyy-MM-dd');
    }
  }

  // Check for month + day patterns (handles both "January 15" and "15 January")
  // Pattern 1: month day (e.g., "January 15", "Jan 15")
  const monthDayMatch = text.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})/i);
  if (monthDayMatch) {
    try {
      const month = monthDayMatch[1];
      const day = monthDayMatch[2];
      const dateStr = `${month} ${day} ${today.getFullYear()}`;
      const parsed = parse(dateStr, 'MMM d yyyy', today);
      return format(parsed, 'yyyy-MM-dd');
    } catch (e) {
      // Invalid date, skip
    }
  }

  // Pattern 2: day month (e.g., "15 January", "15 Jan")
  const dayMonthMatch = text.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)/i);
  if (dayMonthMatch) {
    try {
      const day = dayMonthMatch[1];
      const month = dayMonthMatch[2];
      const dateStr = `${month} ${day} ${today.getFullYear()}`;
      const parsed = parse(dateStr, 'MMM d yyyy', today);
      return format(parsed, 'yyyy-MM-dd');
    } catch (e) {
      // Invalid date, skip
    }
  }

  return null;
}

export function parseVoiceTranscript(text: string): Partial<Task> {
  const lowerText = text.toLowerCase();

  // Extract priority
  let priority: 'low' | 'medium' | 'high' = 'medium';
  if (/\b(high|urgent|important)\b/.test(lowerText)) {
    priority = 'high';
  } else if (/\blow\b/.test(lowerText)) {
    priority = 'low';
  }

  // Extract due date (check today/tomorrow first, then days, then months)
  let dueDate: string | null = null;
  if (/\btoday\b/.test(lowerText)) {
    dueDate = format(new Date(), 'yyyy-MM-dd');
  } else if (/\btomorrow\b/.test(lowerText)) {
    dueDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  } else {
    // Try to parse day names or month + day
    dueDate = parseDate(text);
  }

  // Extract time (e.g., "10am", "10 am", "3:30pm", "3:30 pm", "14:00")
  let dueTime: string | null = null;
  const timeMatch = text.match(/(\d{1,2}):?(\d{2})?\s*(?:a\.?m\.?|p\.?m\.?|am|pm)/i);
  if (timeMatch) {
    const parsed = parseTime(timeMatch[0]);
    if (parsed) dueTime = parsed;
  }

  // Extract category
  let category = 'personal';
  if (/\bwork\b/.test(lowerText)) {
    category = 'work';
  } else if (/\b(shopping|shop)\b/.test(lowerText)) {
    category = 'shopping';
  } else if (/\bhealth\b/.test(lowerText)) {
    category = 'health';
  }

  // Build title by removing keywords
  let title = text;
  title = title
    .replace(/\b(high|urgent|important|low|medium|priority)\b/gi, '')
    .replace(/\b(today|tomorrow)\b/gi, '')
    .replace(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, '')
    .replace(/\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\b/gi, '')
    .replace(/\b(work|shopping|shop|health|personal)\b/gi, '')
    .replace(/\b(\d{1,2})(?:\s*(?:st|nd|rd|th))?\b/gi, '') // Remove day numbers
    .replace(/(\d{1,2}):?(\d{2})?\s*(?:a\.?m\.?|p\.?m\.?|am|pm)?/gi, '')
    .replace(/\b(at|next|on)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Capitalize first letter
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  return {
    title: title || 'Untitled Task',
    priority,
    dueDate,
    dueTime,
    category,
  };
}

interface UseVoiceInputReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
}

export function useVoiceInput(onResult?: (transcript: string) => void, onAutoStop?: (transcript: string) => void): UseVoiceInputReturn {
  const [isListening, setIsListening] = React.useState(false);
  const [transcript, setTranscript] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const recognitionRef = React.useRef<any>(null);
  const onResultRef = React.useRef(onResult);
  const lastTranscriptTimeRef = React.useRef<number>(0);
  const silenceCheckIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const shouldAutoStopRef = React.useRef(false);

  const [isSupported] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  });

  React.useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  React.useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript + ' ';
        }
      }

      const result = final.trim() || interim.trim();
      if (result) {
        setTranscript(result);
        // Update the last transcript time for silence detection
        lastTranscriptTimeRef.current = Date.now();
        // Call onResult with whatever we have (interim or final)
        // This ensures we capture what the user is saying
        onResultRef.current?.(result);
      }
    };

    recognition.onerror = (event: any) => {
      // Ignore 'aborted' errors (expected when user stops listening)
      if (event.error === 'aborted') {
        return;
      }

      const errorMsg = event.error === 'no-speech'
        ? 'No speech detected. Please try again.'
        : event.error === 'network'
        ? 'Network error. Please check your connection.'
        : event.error === 'permission-denied'
        ? 'Microphone permission denied. Please allow access in your browser settings.'
        : `Error: ${event.error}`;

      setError(errorMsg);
      if (event.error !== 'aborted') {
        toast.error(errorMsg);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (silenceCheckIntervalRef.current) {
        clearInterval(silenceCheckIntervalRef.current);
      }
      try {
        recognition.abort();
      } catch (e) {
        // Ignore abort errors
      }
    };
  }, [isSupported]);

  const startListening = React.useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setError(null);
      lastTranscriptTimeRef.current = Date.now();
      shouldAutoStopRef.current = true;

      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Failed to start listening:', e);
      }

      // Set up silence detection
      if (silenceCheckIntervalRef.current) {
        clearInterval(silenceCheckIntervalRef.current);
      }

      silenceCheckIntervalRef.current = setInterval(() => {
        const micPauseDuration = parseInt(localStorage.getItem('micPauseDuration') || '6', 10);
        const silenceThreshold = micPauseDuration * 1000; // Convert to milliseconds
        const timeSinceLastTranscript = Date.now() - lastTranscriptTimeRef.current;

        if (timeSinceLastTranscript > silenceThreshold && shouldAutoStopRef.current) {
          console.log('🔇 Silence detected - auto-stopping microphone');
          shouldAutoStopRef.current = false;

          // Trigger auto-stop callback with current transcript
          if (transcript.trim()) {
            console.log('📤 Triggering auto-stop with transcript:', transcript);
            onAutoStop?.(transcript);
          }

          recognitionRef.current?.abort();
        }
      }, 500);
    }
  }, [isListening]);

  const stopListening = React.useCallback(() => {
    if (silenceCheckIntervalRef.current) {
      clearInterval(silenceCheckIntervalRef.current);
      silenceCheckIntervalRef.current = null;
    }

    if (recognitionRef.current) {
      shouldAutoStopRef.current = false;
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // Ignore errors during abort
      }
      setIsListening(false);
    }
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
  };
}
