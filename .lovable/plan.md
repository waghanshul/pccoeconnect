

# Fix Notification Badge -- Persistent Count & Flickering

## Root Cause Analysis

**Problem 1: Count never clears after viewing**
`Navigation.tsx` → `fetchNotificationCount()` counts ALL rows in `notifications` table + ALL pending `connections_v2`. It never checks the `notification_reads` table, so even after a user views notifications, the badge stays.

**Problem 2: "Acting weird" / flickering when switching pages**
Three separate Supabase realtime channels listen to the same tables simultaneously:
- `navigation-notifications` channel in `Navigation.tsx`
- `notification-realtime` channel in `Notifications.tsx` page
- `notification-changes` channel in `useNotifications.ts` hook

When any change fires, all three trigger overlapping fetches → rapid state updates → badge flickers.

**Problem 3: "Mark all read" is purely cosmetic**
The "Mark all read" button sets local state `markedRead` but never writes to `notification_reads` table. On page refresh or navigation, it resets.

## Plan

### 1. Fix `fetchNotificationCount` in `Navigation.tsx`
- For `notifications` table: LEFT JOIN with `notification_reads` and only count rows where no read entry exists for the current user
- For `connections_v2`: keep existing pending count (these are inherently "unread" until acted on)
- Use a single RPC or restructured query:
  ```sql
  SELECT count(*) FROM notifications n
  WHERE NOT EXISTS (
    SELECT 1 FROM notification_reads nr
    WHERE nr.notification_id = n.id AND nr.profile_id = auth.uid()
  )
  ```
  Since we can't do this easily with the Supabase JS client's `head: true` count, we'll fetch notification IDs + the user's read IDs and compute the difference client-side, OR create a small RPC function.

**Preferred approach**: Create an RPC function `get_unread_notification_count` that returns the accurate unread count in one call.

### 2. Auto-mark notifications as read when visiting `/notifications`
- In `Notifications.tsx`, when page loads and notifications are fetched, insert into `notification_reads` for all unread notification IDs
- This makes the badge clear automatically when the user visits the page
- Remove the manual "Mark all read" button (or keep it as a fallback)

### 3. Deduplicate realtime channels
- Remove the realtime channel from `Notifications.tsx` page (it's redundant -- `useNotifications.ts` hook already has one)
- Keep Navigation's channel for badge count updates
- Keep useNotifications hook's channel for the notification list

### 4. Debounce badge updates
- Add a simple debounce or `setTimeout` guard in `fetchNotificationCount` to prevent rapid successive calls

## Files Modified
- `src/components/Navigation.tsx` -- fix count query to exclude read notifications
- `src/pages/Notifications.tsx` -- auto-mark as read on visit, remove duplicate realtime channel
- `src/hooks/useNotifications.ts` -- no changes needed (already works correctly)
- **New migration**: Create `get_unread_notification_count` RPC function

## What does NOT change
- Database tables structure
- RLS policies
- Notification fetching logic in useNotifications hook
- UI layout/styling

