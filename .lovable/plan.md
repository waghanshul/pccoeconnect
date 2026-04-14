

# Admin Dashboard Enhancements

## Changes

### 1. Admin Can Delete Notifications
- **Database migration**: Add RLS policy on `notifications` table allowing admins to DELETE any notification
- **`AdminDashboard.tsx`**: Add a delete button (with confirmation dialog) next to each sent notification in the "Sent Notifications" list. Also fetch ALL notifications (not just sender's) so admin can manage everything.

### 2. Hyperlinks in Notifications
- **Database migration**: Add a `link_url` column (nullable text) to the `notifications` table
- **`AdminDashboard.tsx`**: Add an optional "Link URL" input field in the send notification form; store it when inserting
- **`NotificationItem.tsx`**: If a notification has a `link_url`, render it as a clickable link (e.g., "View Details" button or make the notification card clickable, opening the URL in a new tab)

### 3. Admins List Tab
- **`AdminDashboard.tsx`**: Add an "Admins" tab alongside Students/Posts. Fetch profiles where `role = 'admin'` joined with `admin_profiles` (designation, department, employee_id). Display in a table with columns: Name, Email, Designation, Department, Employee ID, Status.

## Files Modified
1. `src/pages/AdminDashboard.tsx` — add delete notification handler, link_url input, admins tab
2. `src/components/notifications/NotificationItem.tsx` — render link_url as clickable link
3. DB migration — add `link_url` column to notifications, add admin DELETE policy on notifications

## UI Layout
```text
Tabs: [Notifications] [Students] [Admins] [Posts]

Send Notification form:
  Category | Title | Link URL (optional) | Text | [Send]

Sent Notifications list:
  Each row now has a [Delete] button with confirmation

Admins tab:
  Table: Name | Email | Designation | Department | Employee ID | Status
```

