

# Add "Resend Verification Email" Button to Login Forms

## What This Does
Adds a "Resend verification email" button that appears on both login forms (Student/Professor and Admin) when a user tries to log in but their email isn't verified yet. Uses Supabase's `supabase.auth.resend()` method.

## Changes

### 1. `src/components/auth/StudentLoginForm.tsx`
- Add `showResendButton` state (boolean, default false)
- When the unconfirmed email check triggers (line 32-36), set `showResendButton = true` instead of just showing a toast
- Add a `handleResendVerification` function that calls `supabase.auth.resend({ type: 'signup', email: credentials.email })` with a success/error toast and a cooldown to prevent spam
- Render the resend button below the Sign In button, conditionally visible when `showResendButton` is true

### 2. `src/components/auth/AdminLoginForm.tsx`
- Same pattern: add `showResendButton` state
- When unconfirmed email is detected (line 65-69), set `showResendButton = true`
- Add the same `handleResendVerification` function
- Render the resend button below the Sign In button (before the "Create Admin Account" section)

### Button Design
- Uses `variant="link"` styling with a mail icon
- Shows "Resending..." state while in progress
- After sending, shows a success toast with "Verification email sent! Check your inbox." and disables the button for 60 seconds to prevent spam

