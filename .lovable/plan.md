

# Professor-Only Admin Access & Auto-Role Detection

## Problem
Any student with a `@pccoepune.org` email can register as admin. Need to restrict admin access to professor emails only, and auto-detect professors when they sign up via the student/professor flow.

## Email Pattern Logic
- **Student emails**: contain digits in the local part, e.g. `mangal.singhal22@pccoepune.org`
- **Professor emails**: no digits in the local part, e.g. `rucha.shinde@pccoepune.org`
- Detection rule: if the part before `@` contains any digit → student; otherwise → professor/admin

## Changes

### 1. Add email classification helper (`src/services/security.ts`)
Add a `isProfessorEmail` function that checks if a `@pccoepune.org` email has no digits in the local part (before the `@`). This will be reused across frontend validation and backend logic.

### 2. Block students from admin login & registration (frontend)
- **`AdminLoginForm.tsx`**: After `validatePCCOEEmail`, add a check using `isProfessorEmail`. If the email has digits (student pattern), show an error like "Admin access is restricted to faculty accounts" and block login.
- **`AdminRegisterForm.tsx`**: Add the same `isProfessorEmail` validation to the Zod schema so student emails are rejected at form level with a clear message.

### 3. Auto-assign admin role for professors in student/professor flow
- **`RegisterForm.tsx`** (student registration): Detect if the email is a professor email using `isProfessorEmail`. If so, pass `role: 'admin'` instead of `'student'` in the `registerUser` call.
- **`StudentLoginForm.tsx`**: After successful login, check the user's profile role. If it's `'admin'`, redirect to `/admin/dashboard` instead of `/home`.
- **`src/services/auth.ts`**: In `registerUser`, detect professor emails and set `role: 'admin'` automatically regardless of what flow they came from.

### 4. Backend enforcement (database trigger)
Update the `handle_new_user_registration` trigger function via migration to enforce the rule server-side:
- If email has no digits before `@` → force role to `'admin'`
- If email has digits before `@` → force role to `'student'` (block client-side `role: 'admin'` override)

This prevents any bypass via API calls.

### 5. UI label change (`RoleSelection.tsx`)
- Change "Student" title to "Student / Professor"
- Update description to "Access study materials, connect with peers and faculty"
- Update the feature list text accordingly

### 6. Landing page auth header (`Landing.tsx`)
- When role is "student", update the sign-in heading to show "Student / Professor" instead of "Student"

## Files Modified
1. `src/services/security.ts` — add `isProfessorEmail` helper
2. `src/components/auth/AdminLoginForm.tsx` — block student emails
3. `src/components/auth/AdminRegisterForm.tsx` — block student emails in Zod schema
4. `src/services/auth.ts` — auto-detect professor role
5. `src/components/auth/StudentLoginForm.tsx` — redirect professors to admin dashboard
6. `src/components/landing/RoleSelection.tsx` — rename to "Student / Professor"
7. `src/pages/Landing.tsx` — update auth heading
8. **Migration**: update `handle_new_user_registration()` to enforce role based on email pattern

