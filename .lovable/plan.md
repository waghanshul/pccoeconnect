

# Enable Email Verification for Registration

## What This Does
Users who register must confirm their email before they can log in. This prevents fake `@pccoepune.org` accounts from accessing the platform.

## How It Works
Supabase already sends confirmation emails on signup — but currently the app doesn't check if the email is confirmed before granting access. We need to:

1. **Enable email confirmation in Supabase config** (`supabase/config.toml`) — set `enable_confirmations = true` under `[auth]`

2. **Handle unconfirmed users on login** — After `signIn`, check if the user's email is confirmed. If not, show a message like "Please check your inbox and verify your email before signing in" and sign them out.

3. **Update the registration success message** — Make it clearer that they MUST click the confirmation link before they can log in.

## Files Modified

1. **`supabase/config.toml`** — Add `[auth]` section with `enable_confirmations = true`
2. **`src/components/auth/StudentLoginForm.tsx`** — After successful `signIn`, check `user.email_confirmed_at`. If null, show toast and sign out.
3. **`src/components/auth/AdminLoginForm.tsx`** — Same unconfirmed email check after login.
4. **`src/components/RegisterForm.tsx`** — Update success toast to emphasize email verification requirement.
5. **`src/components/auth/AdminRegisterForm.tsx`** — Same registration success message update.

## Important Note
Email confirmation must also be enabled in the **Supabase Dashboard** (Authentication > Settings > Enable email confirmations). The `config.toml` change applies to local dev; the dashboard setting controls production. I'll flag this as a manual step.

