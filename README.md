# 🚀 DoNext

A powerful task management and productivity application with multi-view organization, intelligent filtering, mobile-first design, and AI-powered insights.

## ✨ Features

- **Multi-View Interface** — Dashboard (focus view), Daily (timeline view), and Calendar (monthly overview)
- **Smart Task Organization** — Categories, priorities (low/medium/high), and due dates with time support
- **Recurring Tasks** — Daily, weekly, or monthly recurrence with customizable start/end dates
- **Dependencies & Blocking** — Track task dependencies and see what's blocking progress
- **Subtasks** — Break down complex tasks into manageable subtasks with individual completion tracking
- **Advanced Filtering** — Filter by status, priority, category, due dates, and custom search
- **Watched Tasks** — Pin important tasks for quick access
- **AI Assistant** — Integrate with Gemini AI for task suggestions and insights
- **Multi-Tab Sync** — Real-time synchronization across browser tabs via localStorage
- **Dark/Light Mode** — Built-in theme switching with next-themes

### 📱 Mobile Experience
- **Responsive Design** — Fully responsive layout that adapts from 375px mobile to 1440px+ desktop
- **Off-Canvas Sidebar** — Hamburger menu drawer on mobile (fixed) / always-visible on desktop (static)
- **Swipe Gestures** — Swipe right to complete task (green ✓) or left to delete (red 🗑️) with visual feedback
- **Mobile-Optimized Header** — Compact hamburger navigation, hidden clock, responsive search
- **Bottom Sheet Quick-Add** — Floating action button (FAB) opens mobile-native slide-up sheet for fast task creation
- **Touch-Friendly Actions** — Tap menu (⋮) reveals Complete / Edit / Delete buttons; Desktop uses hover-reveal

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend Framework** | React 19 + TypeScript |
| **Build Tool** | Vite 6 |
| **Styling** | Tailwind CSS v4 + Animate |
| **UI Components** | Base UI + shadcn-style custom components |
| **State Management** | React hooks + localStorage |
| **Forms** | React Hook Form |
| **Animations** | Motion (Framer Motion) v12 |
| **Notifications** | Sonner |
| **Icons** | Lucide React |
| **Date Handling** | date-fns |
| **Testing** | Vitest + React Testing Library |
| **AI Integration** | Gemini AI API (@google/genai) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+

### Installation & Development

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your Gemini API key
GEMINI_API_KEY=your_api_key_here

# 3. Start development server (http://localhost:3000)
npm run dev

# 4. Test mobile features: Toggle device toolbar to 375px viewport
```

### Available Commands

```bash
npm run dev       # Start dev server with HMR
npm run build     # Create production build
npm run preview   # Preview production build locally
npm run lint      # TypeScript type-checking
npm test          # Run test suite with Vitest
npm run clean     # Remove dist/ directory
```

## 📁 Project Structure

```
src/
├── App.tsx                      # Main application component
├── main.tsx                     # Entry point
├── types.ts                     # TypeScript type definitions
├── useTasks.ts                  # Core task management hook
├── setupTests.ts                # Test configuration
│
├── components/                  # Reusable UI components
│   ├── TaskForm.tsx            # Task editor with recurrence & dependencies
│   ├── CategoryForm.tsx         # Category creation/editing
│   ├── TaskRow.tsx             # Individual task display (with swipe gestures)
│   ├── BottomSheet.tsx         # Mobile slide-up sheet component
│   ├── QuickAddForm.tsx        # Mobile quick-add task form
│   ├── AdvancedFilterBar.tsx    # Smart filtering interface
│   ├── DependencyGraph.tsx      # Task dependency visualization
│   ├── SettingsModal.tsx        # User preferences & settings
│   ├── Header.tsx              # Responsive app header & search
│   ├── Sidebar.tsx             # Off-canvas drawer (mobile) / static nav (desktop)
│   ├── Footer.tsx              # Footer content
│   ├── DevTools.tsx            # Development utilities
│   └── ui/                     # Base UI shadcn components
│
├── views/                       # Page-level views
│   ├── DashboardView.tsx        # Focus dashboard (today's tasks)
│   ├── DailyView.tsx            # Day-specific view with timeline
│   └── CalendarView.tsx         # Monthly calendar view
│
├── hooks/                       # Custom React hooks
│   ├── useHistory.ts            # History/undo management
│   └── useSwipeGesture.ts       # Swipe gesture detection for mobile
│
└── lib/                         # Utilities & helpers
    └── recurringTasks.ts        # Recurrence calculation logic

```

## 💾 Data Persistence

Tasks and categories are automatically saved to localStorage:
- `chronos-tasks` — Task data array
- `chronos-categories` — Category definitions

Changes sync across multiple browser tabs in real-time via storage events.

## 🔑 Environment Variables

Create `.env.local` in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash
APP_URL=http://localhost:3000
```

## 📚 Key Concepts

### Task Properties
- **Title & Description** — Task name and optional details
- **Priority** — low, medium, high (affects sorting and filtering)
- **Category** — Organize tasks by custom categories
- **Due Date & Time** — Schedule tasks with optional time
- **Recurrence** — Set as daily, weekly, monthly with start/end dates
- **Subtasks** — Nested tasks for complex workflows
- **Dependencies** — Mark tasks that block other tasks
- **Status** — Active, completed, or overdue
- **Watched** — Pin tasks for quick access

### Views

| View | Purpose |
|------|---------|
| **Dashboard** | Focus on today's tasks with smart filtering and quick stats |
| **Daily** | Deep dive into a specific day with timeline layout |
| **Calendar** | Month-at-a-glance with task indicators |

### Smart Filters
- **All** — Show all tasks
- **Active** — Incomplete tasks
- **Completed** — Finished tasks
- **Urgent** — High priority due soon
- **Blocked** — Tasks waiting on dependencies
- **Overdue** — Tasks past due date
- **Unscheduled** — Tasks without due dates

### Mobile Gestures & Interactions

| Action | Mobile | Desktop |
|--------|--------|---------|
| **Open Sidebar** | Tap hamburger menu (📱 appears in header) | Always visible |
| **Complete Task** | Swipe right on task row | Click checkbox |
| **Delete Task** | Swipe left on task row OR tap ⋮ → Delete | Hover-reveal delete button |
| **Edit Task** | Tap ⋮ → Edit | Hover-reveal edit button |
| **Quick Add** | Tap FAB (+) button → bottom sheet | Use "Add Task" button in header |

## 🧪 Testing

Tests are located alongside source files (`*.test.ts` and `*.test.tsx`):

```bash
npm test
```

Uses Vitest with React Testing Library (jsdom environment).

## 🔒 AI Studio Deployment

This app is deployed on Google Cloud AI Studio:
- **View:** https://ai.studio/apps/b59b5c33-6250-43c4-97f7-ab42a208c8d6
- **API Keys:** Injected at runtime from AI Studio secrets
- **Build:** Automatic on commit

## 🗓️ Roadmap

### Completed ✅
- [x] Mobile-responsive design (sidebar drawer, responsive header)
- [x] Swipe-to-complete / swipe-to-delete gestures
- [x] Bottom sheet quick-add for mobile
- [x] Mobile-optimized task actions (tap menu)

### In Progress / Planned
- [ ] Recurring task improvements (custom intervals, exceptions)
- [ ] Subtask templates for common workflows
- [ ] Team collaboration & shared tasks
- [ ] Native mobile app (React Native) with offline sync
- [ ] Integration with calendar services (Google Calendar, Outlook)
- [ ] Advanced analytics & productivity insights
- [ ] Custom themes & styling options
- [ ] Keyboard shortcuts for power users
- [ ] Voice-to-task creation (AI-powered)

## 🤝 Contributing

Contributions welcome! To add features:

1. **New Task Properties** — Update `Task` type in `src/types.ts`, add form fields in `TaskForm.tsx`
2. **New Views** — Create `src/views/NewView.tsx`, add tab in `App.tsx`
3. **New Filters** — Update `activeFilter` state and `filteredTasks` logic in `App.tsx`
4. **Mobile Features** — Update `useSwipeGesture.ts` for new gestures, or add to `QuickAddForm.tsx` for quick-add enhancements
5. **New Components** — Add to `src/components/` and import in relevant views

## 🎨 Development Notes

### Mobile-First Approach
- Use Tailwind's `max-md:` (below 768px) and `md:` (768px+) breakpoints
- Test with DevTools device toolbar at 375px (iPhone) and 1024px (tablet)
- Sidebar is `fixed` on mobile, `static` on desktop
- Header uses responsive classes for padding, icon visibility, and search width

### Gesture Handling
- `useSwipeGesture.ts` wraps Motion's drag API for 80px swipe threshold
- Desktop hovers remain unchanged; mobile uses tap menus to preserve accessibility
- All animations use `motion/react` (not `framer-motion`)

## 📝 License

MIT License — See LICENSE file for details.

---

Made with ❤️ using React, TypeScript, Tailwind CSS, and Motion
