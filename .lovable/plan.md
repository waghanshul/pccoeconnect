

# Allow Dual Access for Whitelisted Account

## Problem
Your account (`anshul.wagh22@pccoepune.org`) has role `admin` in the database. When you log in via the student form, it detects the admin role and redirects you to `/admin/dashboard` — you can never reach `/home` (the student view).

## Solution
Two small changes:

### 1. `src/components/auth/StudentLoginForm.tsx`
- Remove the auto-redirect to admin dashboard for your whitelisted email
- When your email logs in via the student form, treat it as a student login and navigate to `/home` regardless of role
- Other admin/faculty accounts logging in via student form will still redirect to admin dashboard

### 2. `src/pages/AdminDashboard.tsx` (or Navigation)
- No changes needed — your account already has admin role so the admin dashboard route will still work when you navigate there directly or log in via the admin form

### Result
- Login via **Admin form** → goes to `/admin/dashboard`
- Login via **Student form** → goes to `/home`
- Both routes are accessible since your profile role is `admin` and the `ProtectedRoute` for admin checks `userRole === 'admin'`

### Files Modified
1. `src/components/auth/StudentLoginForm.tsx` — skip admin redirect for `anshul.wagh22@pccoepune.org`

