# DoNext User Guide

**Version:** 0.3.0  
**Last Updated:** May 12, 2026  
**Platform:** Web, iOS, Android

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Core Concepts](#core-concepts)
3. [Views & Navigation](#views--navigation)
4. [Creating & Managing Tasks](#creating--managing-tasks)
5. [Advanced Features](#advanced-features)
6. [Mobile Features](#mobile-features)
7. [Team Collaboration](#team-collaboration)
8. [Keyboard Shortcuts](#keyboard-shortcuts)
9. [Settings & Preferences](#settings--preferences)
10. [Troubleshooting](#troubleshooting)
11. [FAQ](#faq)

---

## Getting Started

### Creating Your Account

1. **Visit DoNext** — Go to doNext.app
2. **Sign Up** — Choose email, Google, or Microsoft account
3. **Set Password** — Create a secure password
4. **Verify Email** — Check your inbox, click verification link
5. **Welcome Tour** — Optional 2-minute walkthrough (skip anytime)

### First Time Setup (5 Minutes)

1. **Create Your First Task**
   - Click the "+" button (floating action button on mobile)
   - Type task title: "Learn DoNext"
   - Set due date: Today
   - Click "Add Task"

2. **Explore the Dashboard**
   - See your today's tasks
   - Notice the stat cards (Active, Done, Overdue, Blocked)
   - Click a task to see details

3. **Switch Views**
   - **Focus Dashboard** — Today's priorities
   - **Daily View** — Hour-by-hour timeline
   - **Monthly View** — Calendar overview

4. **Create a Category** (Optional)
   - Click "+" next to "Categories" in sidebar
   - Name it (e.g., "Work", "Personal")
   - Pick a color and icon
   - Save

### Profile Setup

**Settings → Account**
- Upload profile photo
- Set name and email
- Choose timezone (important for reminders)
- Set notification preferences
- Enable dark/light mode

---

## Core Concepts

### Tasks

A **task** is a unit of work you need to complete. Each task has:

| Property | What It Does | Required? |
|----------|--------------|-----------|
| **Title** | What the task is | ✅ Yes |
| **Description** | Additional context | ❌ Optional |
| **Due Date** | When it's due | ❌ Optional |
| **Due Time** | What time it's due | ❌ Optional |
| **Priority** | Low, Medium, High | ❌ (Default: Medium) |
| **Category** | Organization/tagging | ❌ (Default: Personal) |
| **Status** | Active or Completed | Automatic |

**Creating a Task (Quick)**
- Mobile: Tap FAB (+) → Type title → Set date → Add Task
- Desktop: Click "Add Task" → Fill form → Save
- Keyboard: Press `Cmd+K` (Mac) or `Ctrl+K` (Windows) → Type → Enter

**Completing a Task**
- Click the circle checkbox next to the task
- Or swipe right on mobile
- Completed tasks fade and strikethrough

**Deleting a Task**
- Hover/long-press the task → Click trash icon
- Or swipe left on mobile

### Subtasks

**Subtasks** are smaller steps within a task. Useful for breaking down complex work.

**How to Add Subtasks:**
1. Open task details (click task title)
2. Scroll to "Subtasks" section
3. Click "+ Add Subtask"
4. Type subtask name
5. Check off as you complete each one

**Example:**
```
Task: Launch new feature
├─ Subtask 1: Design mockups
├─ Subtask 2: Developer review
├─ Subtask 3: QA testing
└─ Subtask 4: Write documentation
```

### Categories

**Categories** help organize tasks by project, client, or context.

**Default Categories:**
- Work
- Personal
- Shopping
- Health

**Creating Custom Categories:**
1. Click "+" next to "Categories" in sidebar
2. Enter category name
3. Pick color (visible as dot next to task)
4. Pick icon (for visual recognition)
5. Save

**Color Legend:**
- 🔴 Red = Urgent/High priority projects
- 🟡 Yellow = In-progress projects
- 🟢 Green = Completed/archived projects
- 🔵 Blue = Personal projects
- 🟣 Purple = Learning/experimental

### Priorities

Every task has a priority: **Low**, **Medium**, or **High**.

**Impact:**
- Affects sorting in "Urgent" filter
- Visual indicator in task row
- Influences AI suggestions

**When to Use:**
- **High** — Deadlines today, critical project work
- **Medium** — Default, normal work items
- **Low** — Nice-to-have, backlog items

### Due Dates & Times

**Due Date** — What day the task is due (format: YYYY-MM-DD)
**Due Time** — What time the task is due (format: HH:MM)

**How to Set:**
1. Open task
2. Click "Due Date" field
3. Pick date from calendar
4. (Optional) Click "Due Time" to set time
5. Save

**Reminders:**
- 9 AM: Overdue task notification
- Custom reminder: Set in settings → Notifications
- Push notification appears on all devices

---

## Views & Navigation

### Focus Dashboard

**What It Is:** Today's priorities at a glance.

**What You See:**
- 📊 Stats cards (Active, Done, Overdue, Blocked)
- 🎯 Filter pills (All, Active, Done, Urgent, Blocked, Overdue, Unscheduled)
- 📋 Today's tasks in priority order
- 👀 Watched tasks sidebar (right side on desktop)
- 🔍 Search bar (filter by keyword)

**Common Tasks:**
- View only today's tasks: Select "Active" filter
- See what's blocking progress: Select "Blocked" filter
- Find a task: Use search bar
- Pin important tasks: Click eye icon → "Watch Task"

**Mobile Differences:**
- Stats cards stacked at top
- Filter pills horizontal scroll (all 7 filters available)
- Watched tasks at bottom (tap to expand)
- Single-column layout

### Daily View

**What It Is:** Hour-by-hour breakdown of a specific day.

**What You See:**
- 📅 Date picker (change which day you're viewing)
- ⏰ Time blocks (6 AM → 10 PM)
- 📌 Tasks organized by due time
- 📋 Unscheduled tasks at bottom

**Common Tasks:**
- Schedule a task for a specific time: Click time slot, add task
- Change task time: Drag task to new time
- See your whole day: Scroll through timeline
- Jump to next/previous day: Use arrow buttons

**Time Blocks:**
- **6 AM - 12 PM** — Morning block
- **12 PM - 6 PM** — Afternoon block
- **6 PM - 10 PM** — Evening block
- **No Time Set** — Unscheduled tasks

### Monthly Calendar View

**What It Is:** Month-at-a-glance with task density visualization.

**What You See:**
- 📆 Full month grid (7 columns, days of week)
- 📍 Task indicators on each day (dots + count)
- 📌 Selected day detail panel (right side on desktop)
- ◀️ Previous/Next month navigation

**Navigation:**
- Click a day to see its tasks
- Click "Week" button on mobile to switch to week view
- Click "Today" to jump to current date

**Color Indicators:**
- 🔴 Red dot = Overdue task(s)
- 🔵 Blue dot = Active task(s)
- ✅ Checked = Completed tasks
- Today's date: Highlighted circle

**Week View (Mobile Only)**
- 7 columns, one per day of week
- Larger cells for touch interaction
- Tap day to expand and see task details

---

## Creating & Managing Tasks

### Add a Task (Detailed)

**Desktop Workflow:**
1. Click "Add Task" button (top right)
2. Fill in the form:
   - **Title** (required)
   - **Description** (optional, for context)
   - **Priority** (Low/Medium/High)
   - **Category** (project/area)
   - **Due Date** (when it's due)
   - **Due Time** (what time)
   - **Watched** (pin to sidebar)
3. Click "Save"

**Mobile Workflow:**
1. Tap FAB (+) button (bottom right)
2. Type task title
3. Set due date (optional)
4. Tap "Add Task"
5. To add more details: Tap task → Edit

**Keyboard Shortcut:**
- **Windows:** `Ctrl+K` → Type task → `Enter`
- **Mac:** `Cmd+K` → Type task → `Enter`

### Edit a Task

1. Click/tap the task row
2. Click "Edit" button or pencil icon
3. Update any field
4. Save changes

**Quick Edits (Without Opening):**
- Change priority: Click priority label → Select new level
- Change category: Click category dot → Select category
- Toggle watched: Click eye icon

### Delete a Task

**Desktop:**
1. Hover over task
2. Click trash icon
3. Confirm delete

**Mobile:**
1. Tap task menu (⋮)
2. Tap "Delete"
3. Confirm

**Recover Deleted Task:**
- Use Undo (Ctrl+Z / Cmd+Z) immediately after delete
- Deleted tasks are permanently gone after 24 hours

### Duplicate a Task

1. Open task details
2. Click "..." menu
3. Select "Duplicate"
4. A copy is created with same details but new ID

**Use Case:** Repeating tasks you don't want marked as recurring

---

## Advanced Features

### Recurring Tasks

A **recurring task** repeats on a schedule (daily, weekly, monthly).

**How to Create:**
1. Create a task normally
2. Toggle "Repeatable" switch
3. Select frequency:
   - **Daily** — Every day
   - **Weekly** — Same day each week
   - **Monthly** — Same date each month
4. (Optional) Set start/end dates
5. Save

**Editing Recurring Tasks:**
When you update a recurring task, DoNext asks:
- **Only this occurrence** — Affects just this instance
- **All future occurrences** — Affects this and all future instances

**Example:**
```
Task: Team standup
├─ Frequency: Daily
├─ Start: May 13, 2026
├─ End: None (forever)
└─ Time: 9:00 AM
```

### Task Dependencies

A **dependency** means one task is blocked by another. If Task A depends on Task B, then Task B must be completed before Task A can start.

**How to Add Dependencies:**
1. Open task details
2. Scroll to "Dependencies" section
3. Click "Add Dependency"
4. Search for task to depend on
5. Save

**Visual Indicator:**
- 🔗 "Blocked by [Task Name]" badge appears
- Task appears in "Blocked" filter
- Dependency visualization shows in calendar

**Use Case:**
```
Task: Deploy to production (depends on)
└─ Task: Code review (must be done first)
```

**Managing Dependencies:**
- Remove: Click X next to dependency
- View blocking tasks: Check "Blocked" filter
- See reverse (what depends on this): Open task → "Blocks" section

### Watched Tasks

**Watched tasks** (starred/pinned) appear in the sidebar for quick access.

**How to Watch:**
1. Hover over task
2. Click star/eye icon
3. Task moves to "Watched" section

**Where They Appear:**
- Right sidebar on Dashboard (desktop)
- Collapsible section at bottom on mobile
- Quick access from any view

**Use Cases:**
- Current project focus
- Important deadlines
- Blocked tasks you're monitoring
- Critical path items

### Filtering & Search

**Quick Filters:**
- **All** — Show every active task
- **Active** — Not completed
- **Done** — Completed tasks (read-only)
- **Urgent** — High priority due soon
- **Blocked** — Tasks waiting on dependencies
- **Overdue** — Due date passed
- **Unscheduled** — No due date set

**Advanced Filters:**
1. Click "Filters" button (sliders icon)
2. Set custom range:
   - Due date range (from/to)
   - Priority level(s)
   - Category
3. Apply filters

**Search:**
- Type in search bar (top of app)
- Searches: Task titles, descriptions, notes
- Results update in real-time
- Clear search to reset

---

## Mobile Features

### Swipe Gestures

**Swipe Right** (on task row)
- ✅ Completes the task
- Shows green checkmark animation
- Task fades away

**Swipe Left** (on task row)
- 🗑️ Deletes the task
- Shows red trash icon animation
- Task removed permanently (use undo quickly if needed)

**Limitations:**
- Completed tasks can't be swiped (they're read-only)
- Undo works immediately after swipe

### Bottom Sheet Quick-Add

**Floating Action Button (FAB)** — Blue "+" button in bottom-right corner

**How to Use:**
1. Tap FAB
2. Bottom sheet slides up
3. Type task title
4. Set due date (optional)
5. Tap "Add Task"

**Two Options:**
- **"Add Task"** → Quick add (title + date only)
- **"More Options"** → Full form with all fields

### Mobile Task Actions

**Tap Menu (⋮)** appears on each task

**Options:**
- ✅ Complete
- ✏️ Edit
- 🗑️ Delete
- 📋 View details

**Long-Press:** Shows context menu (similar to tap menu)

### Responsive Design

**Phone (< 600px):**
- Single-column layout
- Bottom sheet for quick add
- Horizontal scrolling for filters
- Week view for calendar

**Tablet (600px - 1024px):**
- Two-column layout (tasks + details)
- All features available

**Desktop (> 1024px):**
- Three-column layout (sidebar + tasks + details)
- Hover reveals for advanced actions
- Keyboard shortcuts enabled

---

## Team Collaboration

### Shared Workspaces

**What It Is:** A shared task space your whole team can access.

**Setup:**
1. Go to Settings → Workspaces
2. Click "Create Workspace"
3. Name it (e.g., "Q3 Product Roadmap")
4. Invite teammates by email
5. Set their role (Editor, Viewer, or Admin)

**Roles:**
- **Admin** — Full control, can invite/remove members
- **Editor** — Can create/edit tasks, see all details
- **Viewer** — Read-only access

### Comments & @Mentions

**Add a Comment:**
1. Open task
2. Scroll to "Comments" section
3. Type message
4. To mention someone: Type `@Name`
5. Post comment

**Notifications:**
- Comments trigger notifications for task owner
- @Mentions alert that specific person
- Email notification (if enabled in settings)

**Use Cases:**
- Ask a question about a task
- Share context with team
- Flag blockers or risks
- Celebrate completion

### Activity Log

**See Who Did What:**
1. Open task
2. Scroll to "Activity" section
3. View timeline of changes:
   - Who created the task
   - Who marked it complete
   - What fields were edited
   - Timestamps for everything

**Use Cases:**
- Understand task history
- Track collaboration
- Accountability tracking

### Real-Time Sync

**How It Works:**
- Changes appear instantly on all devices
- No refresh needed
- Teammates see your updates live
- Handles conflicts automatically

**Example:**
- You mark a task done on phone
- Teammate sees it completed on desktop immediately
- Calendar updates across all views

---

## Keyboard Shortcuts

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+K` or `Ctrl+K` | New task (quick capture) |
| `Cmd+Z` or `Ctrl+Z` | Undo |
| `Cmd+Y` or `Ctrl+Y` | Redo |
| `/` | Focus search |
| `?` | Show help |
| `D` | Dashboard view |
| `T` | Daily timeline view |
| `C` | Calendar view |

### Task Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Open task details |
| `Space` | Toggle task completion |
| `X` | Delete task |
| `E` | Edit task |
| `1-3` | Set priority (1=Low, 2=Med, 3=High) |

### Navigation Shortcuts

| Shortcut | Action |
|----------|--------|
| `J` | Next item |
| `K` | Previous item |
| `Esc` | Close dialog/details |
| `M` | Toggle mobile menu (mobile only) |

**Enable Shortcuts Cheat Sheet:**
- Press `?` to show all available shortcuts

---

## Settings & Preferences

### Account Settings

**Settings → Account**
- Profile photo
- Name and email
- Password change
- Two-factor authentication (coming soon)
- Delete account

### Notification Preferences

**Settings → Notifications**
- Push notifications (on/off)
- Email digest (daily, weekly, none)
- Reminder timing (9 AM default)
- Sound (on/off)
- Overdue task alerts

**Reminder Times:**
- Morning (9 AM)
- Afternoon (2 PM)
- Evening (6 PM)

### Display & Theme

**Settings → Display**
- Dark mode / Light mode / System default
- Font size (small, medium, large)
- Color scheme
- Compact view (hide descriptions)

### Data & Sync

**Settings → Data**
- Export all tasks (CSV, JSON)
- Backup frequency
- Cloud storage status
- Multi-device sync status

### Integrations

**Settings → Integrations**
- Calendar sync (Google, Outlook)
- Slack notifications
- Zapier/IFTTT webhooks
- API access (Team plan only)

---

## Troubleshooting

### Common Issues

#### "Task not syncing across devices"
**Solution:**
1. Check internet connection
2. Force refresh app (pull down on mobile, F5 on desktop)
3. Sign out and back in
4. If still failing: Contact support

#### "Notifications not working"
**Solution:**
1. Check Settings → Notifications (enabled?)
2. Check OS permissions:
   - **iPhone:** Settings → DoNext → Notifications
   - **Android:** Settings → Apps → DoNext → Notifications
   - **Desktop:** Browser notification permissions
3. Check "Do Not Disturb" is off
4. Restart app

#### "Can't delete task"
**Solution:**
1. Is task completed? Completed tasks can't be deleted directly
2. Try again: Sometimes network glitch
3. Refresh page
4. Contact support if still stuck

#### "Team member can't see shared workspace"
**Solution:**
1. Check they're invited (Settings → Members)
2. Check their email acceptance (sent invite link?)
3. Verify their role is not "Viewer"
4. Ask them to sign out and back in
5. Check their email for workspace notification

#### "Tasks disappeared"
**Solution:**
1. Check filters (might be hidden by filter)
2. Check search bar (clear if there's text)
3. Check category filter
4. Use Undo (Ctrl+Z) if recently deleted
5. Check trash/archive (if feature exists)

### Browser Requirements

**Supported Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Not Supported:**
- Internet Explorer (EOL)
- Opera (untested, may work)

**Mobile:**
- iOS 14+ (via app or Safari)
- Android 10+ (via app or Chrome)

### Performance Tips

**If app feels slow:**
1. Close other browser tabs
2. Clear browser cache (Settings → Privacy)
3. Check internet speed (use speedtest.net)
4. Disable browser extensions (one by one)
5. Try incognito/private mode

**Optimize for mobile:**
1. Close background apps
2. Clear app cache (Settings → Storage)
3. Restart app
4. Update to latest version

---

## FAQ

### General Questions

**Q: Is DoNext free?**
A: Yes! Free tier includes unlimited tasks, 3 views, and 5 categories. Pro tier ($9.99/mo) adds advanced features like dependencies and custom categories. Team tier ($49/mo) adds collaboration.

**Q: Can I use DoNext offline?**
A: Offline mode is coming soon. Currently, you need internet connection, but sync is instant and background.

**Q: Can I import tasks from Todoist/Asana?**
A: Import tool is coming in Q3 2026. For now, you can manually recreate tasks or use CSV import (Pro feature).

**Q: How is my data protected?**
A: All data is encrypted in transit (HTTPS) and at rest (AES-256). We're SOC 2 compliant (pending). Data is stored on secure servers, never shared with third parties.

### Task Questions

**Q: Can a task have multiple categories?**
A: Not currently. Each task has one category. You can use tags in the description for multiple categorizations.

**Q: What happens to recurring tasks when I complete one?**
A: When you complete one instance, only that one is marked done. The recurrence continues as scheduled.

**Q: Can I set a task without a due date?**
A: Yes! Tasks without due dates appear in "Unscheduled" filter and at the bottom of views.

**Q: How long before tasks are deleted?**
A: Deleted tasks are permanently removed immediately. Use Undo (Ctrl+Z) right after delete to recover. Backups kept for 30 days.

### Collaboration Questions

**Q: Can I share a single task with someone?**
A: Not individually. You can create a shared workspace and add them, or share via URL (link-sharing coming soon).

**Q: What if a teammate edits a task I'm working on?**
A: Both edits sync instantly. If there's a conflict, the latest edit wins (timestamps matter).

**Q: Can I see who's currently viewing a task?**
A: Presence indicators (coming soon) will show active viewers.

### Account Questions

**Q: How do I cancel my subscription?**
A: Settings → Billing → "Cancel Subscription". You keep Pro access until end of current period.

**Q: Can I export my data?**
A: Yes! Settings → Data → "Export All Tasks" (CSV or JSON).

**Q: What happens if I delete my account?**
A: All tasks and data are permanently deleted after 30 days. Use export first if you want to keep data.

**Q: Can I have multiple accounts?**
A: Yes, but we recommend one account per person. Multiple accounts make collaboration harder.

### Pricing Questions

**Q: Can I try Pro features free?**
A: Yes! Pro users get 14-day free trial. No credit card required.

**Q: Do I get a discount for annual billing?**
A: Yes! Annual billing is 20% cheaper than monthly. $99/year vs $120/year monthly.

**Q: Is there an education discount?**
A: Yes! Students get 50% off with valid .edu email.

**Q: Do freelancers get special pricing?**
A: Not currently, but we have a community tier in development.

---

## Getting Help

### Support Channels

**In-App Help:**
1. Click "?" icon (help button)
2. Browse help docs
3. Contact support form

**Email Support:**
- Free: support@donext.app (48-hour response)
- Pro: support@donext.app (24-hour response)
- Team: Dedicated support email

**Community:**
- Discord: discord.donext.app
- Reddit: r/DoNext
- Twitter: @DoNextApp

**Status Page:**
- Check system status: status.donext.app

### Providing Feedback

**Feature Requests:**
- Settings → Feedback → "Suggest Feature"
- Discord #feature-requests
- Twitter DM @DoNextApp

**Bug Reports:**
- Click "Report Bug" in help menu
- Email: bugs@donext.app
- Include: Screenshot, device, browser version

---

## Pro Tips & Best Practices

### Organize Like a Pro

1. **Use Categories Strategically**
   - One category per major project
   - Keep under 10 categories (easier to scan)
   - Use colors to distinguish visually

2. **Set Dependencies for Complex Projects**
   - Design → Dev → QA → Launch
   - Helps team see critical path
   - Prevents starting blocked work

3. **Leverage Recurring Tasks**
   - Weekly standup
   - Monthly reviews
   - Quarterly planning
   - Saves time, prevents forgetting

4. **Pin Your Focus**
   - Watch only 3-5 most important tasks
   - Check "Watched" section daily
   - Reduces decision fatigue

### Mobile Power Tips

1. **Use Swipe Gestures**
   - Right swipe = Done (fastest completion)
   - Left swipe = Delete (clean up)
   - Faster than tap menus

2. **Keyboard Shortcuts on Desktop**
   - Cmd+K for quick capture
   - Cmd+Z for undo
   - Spend less time in menus

3. **Daily Review Habit**
   - 5 minutes: Review "Overdue" filter
   - 5 minutes: Review "Today's" tasks
   - 5 minutes: Plan tomorrow via Daily View

### Team Collaboration Tips

1. **Use @Mentions for Accountability**
   - @name → "Can you review this?"
   - Clear ownership
   - Notification makes it visible

2. **Comment for Context**
   - Link related tasks in comments
   - Share relevant docs
   - Leave instructions for next person

3. **Regular Sync**
   - Weekly: Team reviews "Blocked" filter
   - Weekly: Check activity log for updates
   - Monthly: Archive completed projects

---

## Glossary

| Term | Definition |
|------|-----------|
| **FAB** | Floating Action Button (+ button) |
| **MRR** | Monthly Recurring Revenue |
| **Recurring Task** | Task that repeats on a schedule |
| **Dependency** | One task blocked by another |
| **Watched Task** | Pinned/starred task in sidebar |
| **Category** | Project or context grouping |
| **Subtask** | Smaller step within a task |
| **Priority** | Low/Medium/High importance level |
| **Sync** | Real-time data update across devices |
| **Workspace** | Shared space for team collaboration |

---

## Version History

| Version | Date | Notable Changes |
|---------|------|-----------------|
| 0.3.0 | May 2026 | Mobile gestures, bottom sheet, week view |
| 0.2.0 | May 2026 | Responsive design, sticky tabs, filter pills |
| 0.1.0 | May 2026 | Initial launch |

---

## Contact & Support

**DoNext Support**
- Email: support@donext.app
- Discord: discord.donext.app
- Twitter: @DoNextApp
- Website: donext.app
- Status Page: status.donext.app

**Legal**
- Privacy Policy: donext.app/privacy
- Terms of Service: donext.app/terms
- Data Processing Agreement: donext.app/dpa (for Team users)

---

**Made with ❤️ by the DoNext Team**

*Happy task managing!* 🎯

