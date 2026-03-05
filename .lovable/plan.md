

## Admin Notification Posts

The admin dashboard currently has a notification form with category selection and text input, but `handleSendNotification` only shows a local toast — it never writes to the database. The `notifications` table already exists with `title`, `content`, `category`, `sender_id` columns and an RLS policy allowing admins to insert. Students already fetch from this table via `useNotifications`.

### Current Issues
1. Admin form doesn't actually insert into the `notifications` table
2. Admin form lacks a "Title" field (the table requires one)
3. `NotificationTabs` filtering logic is broken — it matches on `notif.title` instead of `notif.category`
4. No category badges on notification items
5. Admin notifications and connection requests are mixed in the same filter, causing admin notifications to only show under "connections" tab

### Plan

**1. Update AdminDashboard notification form**
- Add a "Title" input field (e.g. "Exam Schedule Released")
- Wire `handleSendNotification` to insert into `notifications` table via Supabase client with `title`, `content`, `category`, and `sender_id` (from `useAuth`)
- Add a "Sent Notifications" list below the form showing previously sent notifications (fetched from `notifications` table filtered by `sender_id = admin`)
- Show loading state on the send button

**2. Fix NotificationTabs category filtering**
- Change filter from `notif.title?.toLowerCase() === category` to `notif.category?.toLowerCase() === category`
- Connection requests should only appear under "connections" tab (filter by `isConnectionRequest`)
- Admin notifications appear under their respective category tabs (sports, exams, events, etc.)

**3. Add category badges to NotificationItem**
- Display a colored `Badge` component showing the category (e.g. "Sports", "Exams")
- Use distinct badge colors per category for visual differentiation
- Show the admin sender name and avatar for admin notifications

**4. Files to modify**
- `src/pages/AdminDashboard.tsx` — add title field, wire Supabase insert, add sent notifications list
- `src/components/notifications/NotificationTabs.tsx` — fix category filtering logic
- `src/components/notifications/NotificationItem.tsx` — add category badge, style improvements

No database changes needed — the `notifications` table schema and RLS policies already support this flow.

