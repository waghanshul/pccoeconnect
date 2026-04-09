

# Admin Dashboard Enhancements

## Overview
Three changes: grant your account admin access, then build out the admin dashboard with user count, student list, and post deletion.

## Changes

### 1. Grant Admin Exception for Your Account

**Problem**: Your email `anshul.wagh22@pccoepune.org` contains digits, so the DB trigger assigns "student" and the admin login form blocks it via `isProfessorEmail`.

**Fix (3 places)**:
- **`src/services/security.ts`** — Update `isProfessorEmail` to whitelist `anshul.wagh22@pccoepune.org`
- **DB trigger `handle_new_user_registration`** — Add exception so this email gets 'admin' role instead of 'student'
- If you already registered, a data migration to update your profile role to 'admin'

### 2. Admin Dashboard — Total User Count (Stats Card)

**`src/pages/AdminDashboard.tsx`**:
- Add an "Overview" tab (or stats cards at the top before tabs)
- Fetch `SELECT count(*) FROM profiles` and `SELECT count(*) FROM profiles WHERE role = 'student'` on mount
- Display stat cards: "Total Users", "Students", "Admins"

### 3. Admin Dashboard — Students List (Real Data)

**`src/pages/AdminDashboard.tsx`**:
- Replace mock data in "Students Data" tab with real Supabase query
- Fetch from `profiles` joined with `student_profiles`: name, email, branch, year, PRN, status
- Display in the existing table with proper columns

### 4. Admin Can Delete Any Post

**Database**: Add a new RLS policy on `social_posts` for DELETE that allows admins:
```sql
CREATE POLICY "Admins can delete any post"
ON social_posts FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));
```

**`src/pages/AdminDashboard.tsx`**:
- Add a "Posts" tab showing all social posts fetched from `social_posts` with author info
- Each post row has a delete button that calls `supabase.from('social_posts').delete().eq('id', postId)`
- Confirmation dialog before deletion

## Files Modified
1. `src/services/security.ts` — whitelist email
2. `src/pages/AdminDashboard.tsx` — full rebuild with stats, real student list, posts management
3. DB migration — update trigger + add admin delete policy on social_posts + update existing profile role

## UI Layout
```text
+------------------------------------------+
| Admin Dashboard                          |
+------------------------------------------+
| [Total Users: 3] [Students: 2] [Admin: 1]|
+------------------------------------------+
| [Overview] [Notifications] [Students] [Posts] |
+------------------------------------------+
| (tab content)                            |
+------------------------------------------+
```

