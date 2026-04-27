# Remove Email Verification

Users will be able to sign up and immediately sign in without confirming their email. The PCCOE domain restriction (`@pccoepune.org`) still gates who can register, and role logic still derives from email format — so security stays intact.

## Changes

### 1. Disable Supabase email confirmations
**`supabase/config.toml`**
- Change `enable_confirmations = true` → `enable_confirmations = false`

This stops Supabase from requiring email verification on signup, which also eliminates the rate-limit error you were hitting.

### 2. Database migration — auto-confirm existing & new users
- Run a one-time `UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL` so users who registered earlier but never verified can now sign in.

(New signups will be auto-confirmed by Supabase once `enable_confirmations = false`.)

### 3. Frontend cleanup
**`src/components/auth/StudentLoginForm.tsx`**
- Remove the "please verify your email" check (`!currentUser.email_confirmed_at` block)
- Remove `showResendButton`, `isResending`, `resendCooldown` state
- Remove the `handleResendVerification` function and the "Resend verification email" button
- Remove the `Mail` icon import

**`src/components/RegisterForm.tsx`** (verify and clean up)
- Remove any "check your email to confirm" toast/messaging shown after successful signup
- After successful registration, sign the user in directly (or navigate to `/home` since they're auto-confirmed)

### 4. What stays (security still intact)
- `@pccoepune.org` domain enforcement at the form-validation level
- Role derivation from email format (digits = student, no digits = professor/admin) in the `handle_new_user_registration` trigger
- RLS policies and `has_role()` server-side checks
- Password strength rules

## Technical Notes
- No edge function changes needed
- No changes to RLS or role logic
- `auth-email-hook` and email templates are not in use here, so nothing to disable on that front
