

# Fix: Cannot Delete Users from Supabase

## Problem
Four foreign key constraints on `connections_notifications` and `connections_v2` tables use `NO ACTION` on delete, which blocks Supabase from deleting users. When you try to delete a user, Postgres refuses because rows in these tables still reference the user.

## Root Cause
These constraints lack `ON DELETE CASCADE`:
- `connections_notifications.user_id` → `auth.users`
- `connections_notifications.from_user_id` → `auth.users`
- `connections_v2.sender_id` → `auth.users`
- `connections_v2.receiver_id` → `auth.users`

All other public tables (`profiles`, `social_posts`, `post_likes`, `post_comments`, `poll_votes`) already have `ON DELETE CASCADE` and are fine.

## Fix
One SQL migration that drops the four constraints and re-creates them with `ON DELETE CASCADE`:

```sql
ALTER TABLE connections_notifications
  DROP CONSTRAINT connections_notifications_user_id_fkey,
  ADD CONSTRAINT connections_notifications_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE connections_notifications
  DROP CONSTRAINT connections_notifications_from_user_id_fkey,
  ADD CONSTRAINT connections_notifications_from_user_id_fkey
    FOREIGN KEY (from_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE connections_v2
  DROP CONSTRAINT connections_v2_sender_id_fkey,
  ADD CONSTRAINT connections_v2_sender_id_fkey
    FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE connections_v2
  DROP CONSTRAINT connections_v2_receiver_id_fkey,
  ADD CONSTRAINT connections_v2_receiver_id_fkey
    FOREIGN KEY (receiver_id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

No frontend code changes needed. After this migration, deleting a user from the Supabase dashboard will automatically clean up their connections and notifications.

