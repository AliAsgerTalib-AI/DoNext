# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DoNext** is a task management app built with React. It has three views (Focus Dashboard, Daily, Calendar) with categories, priorities, recurring tasks, subtasks, dependencies, voice input, and undo/redo.

## Commands

- **`npm run dev`** — Start dev server (Vite on port 3000)
- **`npm run build`** — Production build
- **`npm run lint`** — TypeScript type-check (no emit)
- **`npm test`** — Run Vitest tests
- **`npm test -- --reporter=verbose src/useTasks.test.ts`** — Run a single test file

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4 + CVA (class-variance-authority)
- **UI Components**: shadcn-style components in `components/ui/` (Base UI headless)
- **Animations**: Motion (Framer Motion) — used for swipe gestures and transitions
- **State**: React hooks + localStorage (no external state library)
- **Testing**: Vitest + React Testing Library (JSDOM)
- **Dates**: date-fns
- **External API**: Gemini AI (`@google/genai`)

## Architecture

### State — `src/useTasks.ts`

The central hook. All task and category state lives here.

- Wraps state in `useHistory` (see below) — exposes `undo`, `redo`, `canUndo`, `canRedo` for tasks and `undoCategory`/`redoCategory`/etc. for categories.
- Multi-tab sync: storage events call `setSilent` (bypasses history) to avoid circular undo entries.
- Key operations: `addTask`, `updateTask(id, updates, applyToFuture?)`, `deleteTask`, `toggleTask`, `toggleSubtask`, `carryForwardIncompleteTasks(fromDate, toDate)`.
- Recurring tasks: `addTask` with `isRepeatable: true` generates instances via `generateRecurringTasks`. `updateTask(..., true)` propagates changes to future series via `applyToFutureSeries`.

### Hooks — `src/hooks/`

- **`useHistory<T>`** — Undo/redo wrapper (max 20 steps). Returns `{ state, set, setSilent, undo, redo, canUndo, canRedo }`. Use `setSilent` for external sync to skip history.
- **`useVoiceInput`** — Web Speech API with automatic silence detection. Reads `micPauseDuration` (seconds) from localStorage (default 6). Exposes `parseVoiceTranscript(text)` which extracts title, priority, date, time, and category from natural language.
- **`useSwipeGesture`** — Motion-based swipe-to-action for task rows. Right swipe → complete, left swipe → delete (threshold: 80px).

### Lib Utilities — `src/lib/`

- **`taskFilters.ts`** — Pure `filterTasks(tasks, options)` function. Dashboard mode (filters `all`, `active`, `completed`, `urgent`) shows only today's tasks. Filters `blocked`, `overdue`, `unscheduled` span all dates. Supports `advancedFilters` (dateFrom, dateTo, priorities[]).
- **`recurringTasks.ts`** — `generateRecurringTasks(options)` generates instances up to 100 max. `parseDateString(str)` converts `yyyy-MM-dd` strings to Date objects.
- **`csvParser.ts`** — `parseCSV(content)` auto-detects headers. `validateAndCreateTasks(rows, tasks, categories)` returns `{ result: CSVImportResult, newCategories }` — auto-creates missing categories.

### Main App — `src/App.tsx`

Orchestrates all state and views. Uses `filterTasks` via `useMemo`. Manages dialog open/close state for TaskForm, CategoryForm, SettingsModal, BottomSheet, AdvancedFilterBar, and the mobile Sidebar drawer.

### Views — `src/views/`

- `DashboardView.tsx` — Today's tasks, watched tasks panel, quick stats
- `DailyView.tsx` — Timeline view for a selected date
- `CalendarView.tsx` — Month overview with task count indicators

### Components — `src/components/`

- `TaskForm.tsx` — Full task editor (subtasks, recurrence, dependencies, scheduling)
- `TaskRow.tsx` — Reusable row with swipe-to-complete/delete gestures
- `QuickAddForm.tsx` — Inline quick-add with voice input support
- `AdvancedFilterBar.tsx` — Date range + priority multi-filter UI
- `SettingsModal.tsx` — JSON backup export/import + CSV import
- `BottomSheet.tsx` — Mobile bottom sheet (Motion-animated)
- `SubtaskList.tsx` — Standalone subtask management
- `DependencyGraph.tsx` — Visual task dependency graph
- `DebugPanel.tsx` / `DevTools.tsx` — Dev utilities (data inspection, reset)
- `Sidebar.tsx`, `Header.tsx`, `Footer.tsx` — Layout chrome

### Data Model — `src/types.ts`

```ts
Task {
  id, title, description, notes, completed, priority, category,
  dueDate, dueTime, subtasks, isWatched, dependencyIds, createdAt,
  isRepeatable, frequency, recurrenceStart, recurrenceEnd, occurrences, recurrenceGroupId
}
```

`recurrenceGroupId` links all instances of a recurring series. When editing, prompt "only this occurrence" vs "all future occurrences" — the latter calls `updateTask(id, updates, true)`.

## Persistence

localStorage keys:
- `chronos-tasks` — task array
- `chronos-categories` — category array
- `micPauseDuration` — voice silence threshold in seconds (default: 6)

Import/export (SettingsModal): JSON backup (`donext-backup-*.json`) and CSV import (columns: taskName, description, priority, category, dueDate, duetime, isWatched).

## Environment Variables

Set in `.env.local`:
- `GEMINI_API_KEY` — Gemini AI API key
- `GEMINI_MODEL` — Model name (default: `gemini-2.0-flash`)
- `APP_URL` — Deployed URL
- `DISABLE_HMR` — Disables HMR in AI Studio environments

## Path Aliases

`@/` resolves to the project root (configured in `tsconfig.json`). Use `@/src/types`, `@/components/ui/button`, `@/lib/utils`, etc.

## Adding Features

- **New task property** — Update `Task` in `types.ts`, add field in `TaskForm.tsx`
- **New filter** — Add to `activeFilter` union type, update `filterTasks` in `taskFilters.ts`, add button in `Sidebar.tsx`
- **New view** — Create `views/NewView.tsx`, add `TabsContent` in `App.tsx`
- **New category feature** — Update `Category` type, update `CategoryForm.tsx`

## AI Studio Integration

Deployed at Google Cloud AI Studio. Gemini secrets injected at runtime. Build handled by AI Studio automatically.
