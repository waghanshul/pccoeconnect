# Fix "Database error creating new user" when adding users manually in Supabase

## Root Cause

The auth logs show:
```
null value in column "full_name" of relation "profiles" violates not-null constraint
```

When you create a user from the Supabase dashboard, no `raw_user_meta_data` is sent. The `handle_new_user_registration` trigger then runs:

```sql
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name', detected_role);
```

`NEW.raw_user_meta_data->>'name'` is `NULL`, but `profiles.full_name` is `NOT NULL` → insert fails → user creation aborts with a 500.

## Fix (one migration)

Update the `handle_new_user_registration` trigger function to fall back to a sensible default when `name` is missing, so dashboard-created users (and any future signup that omits name) don't break:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  detected_role text;
  local_part text;
  resolved_name text;
BEGIN
  local_part := split_part(NEW.email, '@', 1);

  IF NEW.email = 'anshul.wagh22@pccoepune.org' THEN
    detected_role := 'admin';
  ELSIF local_part ~ '[0-9]' THEN
    detected_role := 'student';
  ELSE
    detected_role := 'admin';
  END IF;

  -- Fall back to email local-part if no name was supplied (e.g. manual dashboard create)
  resolved_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'name', ''),
    local_part
  );

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, resolved_name, detected_role);

  IF detected_role = 'student' THEN
    INSERT INTO public.student_profiles (id, prn, branch, year, recovery_email)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'prn', 'PENDING-' || substr(NEW.id::text, 1, 8)),
      COALESCE(NEW.raw_user_meta_data->>'branch', 'Unassigned'),
      COALESCE(NEW.raw_user_meta_data->>'year', '1st'),
      NEW.raw_user_meta_data->>'recoveryEmail'
    );
  END IF;

  RETURN NEW;
END;
$$;
```

Notes:
- `full_name` defaults to the email local part (e.g. `john.doe22`) when missing — user can edit later in Settings.
- `student_profiles.prn` / `branch` / `year` also get safe defaults so a manually-created student email doesn't fail the second insert. The PRN placeholder is unique per user (uses the uuid) to avoid the unique-PRN constraint colliding.
- Behavior for normal app signups is unchanged because they always send `name`, `prn`, `branch`, `year` in metadata.

## What this does NOT change

- No frontend changes.
- No RLS changes.
- Role-derivation logic (digits = student, none = admin, plus the `anshul.wagh22` whitelist) is preserved exactly.
- Email-confirmation setting (`enable_confirmations = false`) is left as-is per your earlier decision.

After approval, retry creating the user from the Supabase dashboard — it should succeed, and a profile row will be created with the email local-part as the name.
