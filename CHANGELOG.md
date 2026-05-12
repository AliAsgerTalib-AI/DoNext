# Changelog

All notable changes to DoNext are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.0] - 2026-05-12

### 🎉 Added

#### Mobile-Responsive Enhancements
- **Responsive Layout** — App root now uses `flex-col md:flex-row` for mobile-first design
  - Sidebar converts to off-canvas fixed drawer on mobile (<768px) with smooth slide animations
  - Hamburger menu button appears in header on mobile to toggle sidebar
  - Header becomes compact on mobile: hidden clock, responsive search width
  - Dark backdrop overlay appears when sidebar opens on mobile

- **New Component: `BottomSheet.tsx`** — Reusable mobile slide-up sheet
  - Smooth animations with motion/react
  - Dark backdrop overlay with tap-to-close
  - Drag handle indicator for native mobile feel

- **New Component: `QuickAddForm.tsx`** — Mobile quick-add task form
  - Minimal fields: title + due date
  - "More Options" button escalates to full TaskForm
  - Integrated into bottom sheet for fast mobile task creation

- **New Hook: `useSwipeGesture.ts`** — Custom hook for touch gestures
  - Swipe right (80px threshold) to complete task with green ✓ reveal
  - Swipe left (80px threshold) to delete task with red 🗑️ reveal
  - Built on motion/react's `useMotionValue` and `useTransform`

- **Floating Action Button (FAB)** — Mobile-only quick task button
  - Fixed position bottom-right corner on mobile
  - Opens bottom sheet for quick-add form
  - Smooth scale animations on hover/tap

- **Touch-Friendly Task Actions**
  - Mobile: Tap menu (⋮) reveals Complete / Edit / Delete action buttons
  - Desktop: Retain existing hover-reveal behavior
  - Tap outside menu closes it automatically

- **Mobile-Optimized Header** (`Header.tsx`)
  - Added `onMenuClick` prop for hamburger menu
  - Hamburger button visible on mobile only (`max-md:flex`)
  - Clock widget hidden on mobile (`hidden md:flex`)
  - Search box responsive width (`max-w-[180px]` mobile, `w-96` desktop)
  - Reduced header height on mobile (`h-14`) vs desktop (`h-20`)

- **Mobile-Optimized Sidebar** (`Sidebar.tsx`)
  - Added `isOpen` and `onClose` props for drawer state
  - Motion animation on slide-in/out with spring physics
  - Uses Tailwind `fixed md:static` for layout switching
  - Dark backdrop only visible on mobile (`md:hidden`)

- **Updated TaskRow Component** (`TaskRow.tsx`)
  - Integrated `useSwipeGesture` for swipe-to-complete and swipe-to-delete
  - Animated background reveals (green/red) while dragging
  - Mobile action menu (tap ⋮) for Complete / Edit / Delete
  - Desktop hover-reveal actions unchanged
  - Smooth exit animation when task is completed

### 📖 Documentation
- **Updated README.md** with comprehensive mobile section
  - Added "Mobile Experience" features subsection
  - Gestures & Interactions table showing mobile vs desktop behavior
  - Updated Project Structure with new components and hooks
  - Added mobile-first development notes and testing instructions
  - Updated Roadmap with completed mobile features checkmarks

### 🔧 Technical
- Added `motion` animations for sidebar drawer and bottom sheet
- Responsive Tailwind breakpoints: `max-md:` (<768px) and `md:` (768px+)
- All TypeScript changes compile without errors
- No breaking changes to existing task management logic

---

## [0.1.0] - 2026-05-12

### 🎉 Added

#### Core Features
- Multi-view task management (Dashboard, Daily, Calendar)
- Task creation with full form (title, description, priority, category, due date, time)
- Recurring tasks (daily, weekly, monthly)
- Subtasks with completion tracking
- Task dependencies and blocking visualization
- Advanced filtering (status, priority, category, date range)
- Watched/pinned tasks
- Custom categories with colors and icons
- Undo/Redo history (Ctrl+Z / Ctrl+Y)
- Search across tasks and categories
- Dark/Light theme switching

#### Data & Storage
- localStorage persistence (`chronos-tasks`, `chronos-categories`)
- Multi-tab real-time sync via storage events
- No external database required

#### UI/UX
- Base UI + shadcn-style custom components
- Smooth animations with motion (Framer Motion)
- Toast notifications (Sonner)
- Responsive layout (Desktop-first, later made mobile-responsive)
- Task status indicators (completed, overdue, blocked, urgent, unscheduled)
- Category color indicators
- Dependency badges

#### Developer Experience
- TypeScript strict mode
- React 19 with hooks
- Vite build tool with HMR
- Tailwind CSS v4
- Vitest + React Testing Library
- DevTools component for data inspection and reset
- Settings modal for user preferences

---

## Legend

- 🎉 **Added** — New features or components
- 🔧 **Changed** — Modifications to existing functionality
- ✅ **Fixed** — Bug fixes
- ⚡ **Performance** — Performance improvements
- 📖 **Documentation** — Documentation updates
- 🗑️ **Removed** — Removed features or components
- ⚠️ **Deprecated** — Deprecated features (to be removed)
- 🔒 **Security** — Security-related changes
