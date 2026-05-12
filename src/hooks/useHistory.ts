/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface UseHistoryReturn<T> {
  state: T;
  set: (v: T | ((p: T) => T)) => void;
  setSilent: (v: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const MAX_HISTORY = 20;

export function useHistory<T>(initialState: T | (() => T)): UseHistoryReturn<T> {
  const [history, setHistory] = React.useState<HistoryState<T>>(() => {
    const initial = typeof initialState === 'function' ? (initialState as () => T)() : initialState;
    return { past: [], present: initial, future: [] };
  });

  const set = React.useCallback((value: T | ((p: T) => T)) => {
    setHistory(prev => {
      const newState = typeof value === 'function' ? (value as (p: T) => T)(prev.present) : value;

      if (JSON.stringify(newState) === JSON.stringify(prev.present)) {
        return prev;
      }

      return {
        past: [...prev.past, prev.present].slice(-MAX_HISTORY),
        present: newState,
        future: [],
      };
    });
  }, []);

  const setSilent = React.useCallback((value: T) => {
    setHistory(prev => ({
      ...prev,
      present: value,
    }));
  }, []);

  const undo = React.useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev;
      const newPast = prev.past.slice(0, -1);
      return {
        past: newPast,
        present: prev.past[prev.past.length - 1],
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  const redo = React.useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) return prev;
      return {
        past: [...prev.past, prev.present],
        present: prev.future[0],
        future: prev.future.slice(1),
      };
    });
  }, []);

  return {
    state: history.present,
    set,
    setSilent,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
