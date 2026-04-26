

# Admin Notification Management + Admins List

## Changes

### 1. Database Migration
- Add `link_url` (nullable text) column to `notifications` table
- Add RLS policy allowing admins to DELETE from `notifications`

### 2. Admin Dashboard (`AdminDashboard.tsx`)
- **Send Notification form**: Add optional "Link URL" input field; include `link_url` in the insert
- **Sent Notifications list**: Show all notifications (not just sender's), add delete button with confirmation dialog per notification, show link_url if present
- **New "Admins" tab**: Fetch `profiles` where `role = 'admin'` joined with `admin_profiles`; display table with Name, Email, Designation, Department, Employee ID, Status

### 3. Student-facing Notification (`NotificationItem.tsx`)
- Accept optional `link_url` prop
- If present, render a clickable "View Details" link (opens in new tab) below the notification content

### 4. Notification Hook (`useNotifications.ts`)
- Pass through `link_url` from the fetched notification data to the component

## Files Modified
1. DB migration — `ALTER TABLE notifications ADD COLUMN link_url text`; admin DELETE policy
2. `src/pages/AdminDashboard.tsx` — link_url input, delete notifications, admins tab
3. `src/components/notifications/NotificationItem.tsx` — render link_url
4. `src/hooks/useNotifications.ts` — include link_url in Notification type
5. `src/components/notifications/NotificationList.tsx` — pass link_url through

