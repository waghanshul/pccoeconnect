

# Notifications Page -- UI Revamp

## Current State

The notifications page is a flat list of cards grouped by category tabs (connections, sports, exams, events, clubs, placements, celebrations). Problems:

- 7 horizontal tabs overflow on mobile and look cramped
- Empty states use inconsistent styling (`bg-white dark:bg-gray-800` -- leaks white in dark mode)
- All notification items look identical -- no visual distinction between types
- No "All" tab to see everything at once
- No relative time ("2 hours ago") -- uses full date stamps that waste space
- No category icons next to tab labels
- Connection request cards don't stand out enough despite being actionable

## Plan

### 1. `src/components/notifications/NotificationTabs.tsx`
- Add an **"All" tab** as the default (shows everything sorted by date)
- Add category-specific icons next to each tab label (Trophy for sports, GraduationCap for exams, Calendar for events, Users for clubs, Briefcase for placements, PartyPopper for celebrations, UserPlus for connections)
- Show unread count badges per tab
- Make tabs horizontally scrollable on mobile with `overflow-x-auto` and `scrollbar-hide`

### 2. `src/components/notifications/NotificationItem.tsx`
- Replace full date with **relative time** using `formatDistanceToNow` from date-fns (already installed) -- e.g., "2h ago"
- Add a **category icon** on the left for non-connection notifications (replacing the avatar which is only shown for connections anyway)
- Use the category badge color as a left-border accent for all categories (not just connections)
- Connection request cards get a distinct layout: avatar, name, mutual info, and accept/reject as icon buttons (more compact)

### 3. `src/components/notifications/NotificationList.tsx`
- Fix empty state styling -- use `bg-card border border-border` instead of `bg-white dark:bg-gray-800`
- Add a proper empty state with an icon (BellOff) and descriptive text per category
- Wrap items in `AnimatedList` for staggered entrance

### 4. `src/pages/Notifications.tsx`
- Add a header area with notification count summary
- Add a "Mark all as read" button in the header (visual only for now -- no backend change, just sets local state)

### 5. `src/components/notifications/NotificationItem.tsx` -- Connection request refinement
- Make connection request items more prominent with a slightly different card style (elevated border, accent background)
- Show the sender's avatar larger (h-12 w-12) for connection requests

## Files Modified
- `src/components/notifications/NotificationTabs.tsx`
- `src/components/notifications/NotificationItem.tsx`
- `src/components/notifications/NotificationList.tsx`
- `src/pages/Notifications.tsx`

## What does NOT change
- `useNotifications.ts` hook -- all data fetching stays identical
- `useConnectionRequests.ts` -- accept/reject logic untouched
- All Supabase queries, realtime subscriptions
- Component props interfaces (only visual changes)

