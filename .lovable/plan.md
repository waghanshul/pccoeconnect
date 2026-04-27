# Plan: Unified Student/Professor App + Separate Superadmin Login

## Goal

1. Students and professors get the **exact same app experience** (no admin dashboard for professors). They're only "tagged" differently in their profile.
2. Move the admin dashboard behind a **separate Superadmin login** with **hardcoded credentials in code** (no signup possible).
3. New landing flow: **Get Started → Choose role (Student / Professor / Superadmin) → enter credentials → log in**.

---

## User Flow

```text
Landing ("Get Started")
        │
        ▼
 Role Selector
 ┌──────────────┬──────────────┬──────────────┐
 │   Student    │  Professor   │  Superadmin  │
 └──────┬───────┴──────┬───────┴──────┬───────┘
        │              │              │
        ▼              ▼              ▼
   Login form     Login form     Login form
   (Supabase)     (Supabase)     (hardcoded)
        │              │              │
        ▼              ▼              ▼
      /home          /home       /admin/dashboard
```

- Student & Professor: same Supabase auth, same `/home` feed, same features. Profile just shows their tag (student/professor).
- Superadmin: completely separate login screen, credentials checked against a hardcoded value in the frontend, no Supabase auth involved. On success, sets a sessionStorage flag and routes to `/admin/dashboard`.
- Registration (signup) only available for Student and Professor — never for Superadmin.

---

## Changes

### 1. Landing page flow (`src/pages/Landing.tsx`)
Replace the current 2-step flow with 3 steps:
- `initial` → Hero with "Get Started"
- `roleSelect` → 3 cards: Student, Professor, Superadmin
- `auth` → Shows the right login form based on selected role

Add a "Back" button on each step.

### 2. Role selector UI (new component `src/components/auth/RoleSelector.tsx`)
Three clickable cards (Student / Professor / Superadmin) with icons. Selecting one advances to the auth step with that role context.

### 3. Login form behavior (`src/components/auth/StudentLoginForm.tsx`)
Rename conceptually to a generic `UserLoginForm` (or keep file, just change behavior):
- Used for both Student and Professor logins (same Supabase auth).
- After successful sign-in, **always navigate to `/home`** — remove the current logic that redirects faculty/admin to `/admin/dashboard`.
- Show "Create an account" only for student/professor flows.

### 4. New Superadmin login form (`src/components/auth/SuperadminLoginForm.tsx`)
- Username + password fields.
- On submit, compare against hardcoded constants (e.g., `SUPERADMIN_USERNAME` / `SUPERADMIN_PASSWORD` in `src/config/superadmin.ts`).
- On match: `sessionStorage.setItem("superadmin", "true")` and `navigate("/admin/dashboard")`.
- On mismatch: toast "Invalid superadmin credentials".
- No "Create account" option.

### 5. Registration form (`src/components/RegisterForm.tsx`)
- Keep Student / Professor only in role dropdown (already the case — no Superadmin option added).
- Professor signup continues to use Supabase auth and stores role as `admin` in the `profiles` table (so the tag is preserved), but **professors will no longer be routed to the admin dashboard** — they go to `/home` like students.

### 6. Route protection (`src/App.tsx`)
- `/home` and all current student routes: accessible to any authenticated Supabase user (student OR professor — no role restriction).
- `/admin/dashboard`: protected by a new `SuperadminRoute` wrapper that checks `sessionStorage.getItem("superadmin") === "true"` instead of Supabase auth/role. If not set, redirect to `/`.
- Remove the `allowedRoles={["admin"]}` Supabase role check on `/admin/dashboard`.

### 7. Admin dashboard logout (`src/pages/AdminDashboard.tsx`)
- Replace `supabase.auth.signOut()` with `sessionStorage.removeItem("superadmin")` then navigate to `/`.

### 8. Profile "tag" display
- Where the profile shows the user role, ensure both `student` and `admin` (professor) values render as friendly labels: "Student" / "Professor". No feature gating based on this anywhere outside the superadmin route.

---

## Technical Notes

- **Hardcoded credentials**: Stored as plain constants in `src/config/superadmin.ts`. The user explicitly requested this. Note: anything in frontend code is visible to anyone who inspects the JS bundle — these credentials are effectively public to anyone who downloads the site. This is acceptable per the request, but worth noting.
- **No Supabase changes needed**. Schema, RLS, and the existing `profiles.role` column stay as-is. The `admin` role value simply becomes a cosmetic tag for professors, no longer a gate to the dashboard.
- **Existing professor accounts** that were being auto-routed to `/admin/dashboard` after login will now land on `/home` like everyone else. The dashboard becomes reachable only via the Superadmin login.
- **Session persistence for superadmin**: using `sessionStorage` means the superadmin session ends when the tab closes. If you'd prefer it to persist across tabs/restarts, swap to `localStorage` — let me know.

---

## Open Question (please confirm before I build)

What hardcoded **superadmin username and password** should I use? For example:
- username: `superadmin`
- password: `<something you choose>`

If you don't specify, I'll use placeholders (`superadmin` / `changeme123`) that you can edit in `src/config/superadmin.ts` afterwards.
