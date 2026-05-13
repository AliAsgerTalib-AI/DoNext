import React from 'react';
import { Task } from '@/src/types';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';

export function parseVoiceTranscript(text: string): Partial<Task> {
  const lowerText = text.toLowerCase();

  // Extract priority
  let priority: 'low' | 'medium' | 'high' = 'medium';
  if (/\b(high|urgent|important)\b/.test(lowerText)) {
    priority = 'high';
  } else if (/\blow\b/.test(lowerText)) {
    priority = 'low';
  }

  // Extract due date
  let dueDate: string | null = null;
  let dateText = '';
  if (/\btoday\b/.test(lowerText)) {
    dueDate = format(new Date(), 'yyyy-MM-dd');
    dateText = 'today';
  } else if (/\btomorrow\b/.test(lowerText)) {
    dueDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    dateText = 'tomorrow';
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
    .replace(/\b(work|shopping|shop|health|personal)\b/gi, '')
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

export function useVoiceInput(onResult?: (transcript: string) => void): UseVoiceInputReturn {
  const [isListening, setIsListening] = React.useState(false);
  const [transcript, setTranscript] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const recognitionRef = React.useRef<any>(null);
  const onResultRef = React.useRef(onResult);

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
        // Only call onResult when we have a final result
        if (final.trim()) {
          onResultRef.current?.(final.trim());
        }
      }
    };

    recognition.onerror = (event: any) => {
      const errorMsg = event.error === 'no-speech'
        ? 'No speech detected. Please try again.'
        : event.error === 'network'
        ? 'Network error. Please check your connection.'
        : `Error: ${event.error}`;
      setError(errorMsg);
      toast.error(errorMsg);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [isSupported]);

  const startListening = React.useCallback(() => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  }, [isListening]);

  const stopListening = React.useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  return {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
  };
}
