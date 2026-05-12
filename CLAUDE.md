# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DoNext** is a task management and productivity application built with React. It features a multi-view interface (Dashboard, Daily, Calendar) for organizing and tracking tasks with support for categories, priorities, recurring tasks, subtasks, and dependencies.

## Build and Development Commands

- **`npm run dev`** — Start the development server (Vite on port 3000 with HMR enabled)
- **`npm run build`** — Create a production build
- **`npm run preview`** — Preview the production build locally
- **`npm run lint`** — Type-check with TypeScript (no emit)
- **`npm test`** — Run tests with Vitest
- **`npm run clean`** — Remove the dist/ directory

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4 with Vite plugin, Tailwind Animate, CVA (class-variance-authority)
- **UI Components**: Base UI (headless components) + shadcn-style custom components
- **State Management**: React hooks + localStorage (no external state library)
- **Persistence**: Multi-tab sync using `storage` events, keys: `chronos-tasks`, `chronos-categories`
- **Testing**: Vitest + React Testing Library (JSDOM environment)
- **Forms**: React Hook Form
- **Animations**: Motion (Framer Motion)
- **Notifications**: Sonner (toast library)
- **Icons**: Lucide React
- **Theming**: next-themes
- **Dates**: date-fns
- **External API**: Gemini AI API (via `@google/genai`)

## Architecture

### Core State Management

**`src/useTasks.ts`** — Custom React hook providing:
- Task CRUD operations (`addTask`, `updateTask`, `deleteTask`, `toggleTask`, `toggleSubtask`)
- Category CRUD operations
- localStorage persistence with keys: `chronos-tasks`, `chronos-categories`
- Multi-tab synchronization via `storage` event listener

### Component Structure

**Main App** (`src/App.tsx`):
- Central component managing task/category state
- Tabs interface with three views:
  1. **Focus Dashboard** — Today's tasks filtered by category/priority/status
  2. **Daily View** — Task details for a selected day
  3. **Monthly View** — Calendar-based task visualization
- Task filtering: `all`, `active`, `completed`, `urgent`, `blocked`, `overdue`, `unscheduled`
- Dialog-based task/category forms
- Watched tasks sidebar display

**Views** (`src/views/`):
- `DashboardView.tsx` — Main focus view showing filtered tasks, watched tasks, and quick stats
- `DailyView.tsx` — Day-specific view with task timeline and details
- `CalendarView.tsx` — Monthly calendar with task indicators

**Components** (`src/components/`):
- `TaskForm.tsx` — Complete task editor with subtasks, recurrence, dependencies, scheduling
- `CategoryForm.tsx` — Category creation/editing with color and icon selection
- `Sidebar.tsx` — Navigation, category list, filter buttons
- `Header.tsx` — Search bar, view context
- `Footer.tsx` — Footer content
- `DevTools.tsx` — Development utilities (data inspection, reset)

**UI Components** (`components/ui/`):
- Pre-built shadcn-compatible components: Button, Dialog, Tabs, Input, Textarea, Calendar, Popover, etc.

### Data Models

**`src/types.ts`**:
- `Task` — Core task with priority, category, dueDate, dueTime, subtasks, recurrence, dependencies, watched status
- `Subtask` — Nested task structure
- `Priority` — `'low' | 'medium' | 'high'`
- `RecurrenceFrequency` — `'daily' | 'weekly' | 'monthly' | 'none'`
- `Category` — Custom categories with name, color, icon
- `DEFAULT_CATEGORIES` — Pre-defined categories (Work, Personal, Shopping, Health)

### Recurrence Handling

Tasks marked as `isRepeatable: true` support:
- Frequency (`daily`, `weekly`, `monthly`)
- Start/end dates
- Occurrences count
- `recurrenceGroupId` — Links recurring instances together
- When editing, user prompted: "only this occurrence" vs "all future occurrences"

### Filtering and Views

- Dashboard shows today's tasks (`dueDate === todayStr`) plus filtered smart folders
- Daily view shows all tasks for a specific date with timeline layout
- Calendar shows month overview with task count indicators
- Task carried forward with duplicate detection and toast confirmation

## Environment Variables

Set in `.env.local`:
- `GEMINI_API_KEY` — Required for Gemini AI API (configured in AI Studio secrets)
- `GEMINI_MODEL` — Model name (default: `gemini-2.0-flash`)
- `APP_URL` — Deployed URL for self-referential links and OAuth

## Testing

- Test file location: `src/**/*.test.ts(x)`
- Setup file: `src/setupTests.ts` (jsdom environment)
- Run with `npm test`
- Example: `src/useTasks.test.ts` — Tests for task hook logic

## Key Development Notes

### Path Aliases

The import alias `@/` resolves to the project root. Configure in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Toast Notifications

Use `sonner` for user feedback:
```tsx
import { toast } from 'sonner';
toast.success('Task created');
toast.error('Duplicate task exists');
```

### Accessible UI

- Base UI provides unstyled headless components (Dialog, Tabs, etc.)
- Apply Tailwind classes for styling and accessibility
- Avoid hardcoding styles; use CVA for variant management

### localStorage Keys

- `chronos-tasks` — Serialized task array
- `chronos-categories` — Serialized category array

Keep serialization consistent; sync events trigger `useEffect` listeners.

### HMR Configuration

HMR is disabled in AI Studio environments (via `DISABLE_HMR` env var). File watching is disabled during agent edits to prevent flickering. See `vite.config.ts`.

## Common Patterns

**Memoized Filtering**:
```tsx
const filteredTasks = React.useMemo(() => {
  return tasks.filter(/* complex logic */);
}, [tasks, searchQuery, activeCategory, activeFilter]);
```

**useCallback for Stable Functions**:
All event handlers that depend on state use `React.useCallback` to maintain referential stability.

**Dialog-based Forms**:
TaskForm and CategoryForm are rendered inside Dialog components. Close via callback: `setIsDialogOpen(false)`.

**Date Formatting**:
Use `date-fns` for all date operations:
```tsx
const todayStr = format(new Date(), 'yyyy-MM-dd');
const nextDay = addDays(date, 1);
```

## Adding Features

1. **New Task Properties** — Update `Task` type in `types.ts`, add form fields in `TaskForm.tsx`, update localStorage keys if needed
2. **New View** — Create `views/NewView.tsx`, add `TabsContent` in `App.tsx`, update filtering logic
3. **New Category Feature** — Update `Category` type, add UI in `CategoryForm.tsx`
4. **New Filter** — Add filter option to `activeFilter` state, update `filteredTasks` logic, add UI button in `Sidebar.tsx`

## AI Studio Integration

This app is deployed on Google Cloud AI Studio:
- View at: https://ai.studio/apps/b59b5c33-6250-43c4-97f7-ab42a208c8d6
- Gemini API secrets are injected at runtime
- Build and preview automatically handled by AI Studio
