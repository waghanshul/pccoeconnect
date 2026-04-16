

# Adding Users to the Platform

## The Constraint
Supabase Auth users (`auth.users`) cannot be created via SQL migrations or direct inserts — they must go through the Auth signup API. The `profiles` and `student_profiles` tables are auto-populated by your existing database trigger on signup.

## Options

### Option A: Bulk Registration via Edge Function (Recommended)
Create a Supabase Edge Function that uses the **Admin Auth API** (service role key) to create users programmatically. You'd provide a list of users, and the function would:
1. Call `supabase.auth.admin.createUser()` for each user (with `email_confirm: true` to skip verification)
2. The existing `handle_new_user_registration` trigger auto-populates `profiles` and `student_profiles`

You could then invoke it from the Admin Dashboard or via curl with a JSON payload of users.

### Option B: Manual Registration via Supabase Dashboard
Go to the Supabase Auth dashboard and use "Add User" to create them one by one:
https://supabase.com/dashboard/project/fkocqxfvrzkrguhbulam/auth/users

### Option C: Admin Dashboard "Add User" Feature
Add an "Add User" form to your Admin Dashboard that calls an Edge Function to create users via the Admin API.

## Recommendation
**Option C** is the most sustainable — it gives admins a UI to add users anytime. Option A is good for a one-time bulk import. Option B works for a handful of users.

## What I Need From You
1. Which option do you prefer?
2. If A or C: provide the list of users (name, email, PRN, branch, year, password) you want added.

