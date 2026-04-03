

# Production Data Reset & Seed Plan

## Problem
The platform has test/development data (users, posts, messages, etc.) that needs to be wiped for production launch. Fresh introductory content should be seeded to welcome new users.

## Important Note
Deleting users from `auth.users` (which cascades to profiles) cannot be done via a regular migration since the `auth` schema is reserved. User deletion must be done through the **Supabase Dashboard** (Authentication > Users) or via the Supabase Admin API.

## Step 1: Delete all non-auth data via migration

Run a migration that clears all tables in the correct order (respecting dependencies):

```sql
-- Clear all data tables (order matters for dependencies)
DELETE FROM notification_reads;
DELETE FROM connections_notifications;
DELETE FROM message_read_status;
DELETE FROM post_comments;
DELETE FROM post_likes;
DELETE FROM poll_votes;
DELETE FROM social_posts;
DELETE FROM posts;
DELETE FROM polls;
DELETE FROM messages;
DELETE FROM group_members;
DELETE FROM conversation_participants;
DELETE FROM conversations;
DELETE FROM connections_v2;
DELETE FROM connections;
DELETE FROM connection_requests;
DELETE FROM admin_audit_log;
DELETE FROM notifications;
DELETE FROM student_profiles;
DELETE FROM admin_profiles;
DELETE FROM profiles;
```

## Step 2: Delete auth users via Supabase Dashboard

You'll need to go to **Supabase Dashboard > Authentication > Users** and delete all existing users manually (or I can use the admin API if available).

## Step 3: Seed introductory notifications

After the wipe, insert welcome notifications across multiple categories so new users see useful content:

```sql
-- Welcome & platform info notifications (no sender_id since it's system-generated)
INSERT INTO notifications (category, title, content) VALUES
('events', 'Welcome to ChatPCCOE!', 'ChatPCCOE is your exclusive platform to connect, collaborate, and grow with fellow PCCOE students. Create your profile, connect with classmates, and start conversations!'),
('events', 'Platform Rules & Guidelines', 'Be respectful and supportive. No spam, harassment, or inappropriate content. Keep discussions academic and constructive. Violations may result in account suspension.'),
('clubs', 'Join Club Communities', 'Connect with members of your favorite college clubs! From coding clubs to cultural committees — find your people and stay updated on club activities.'),
('sports', 'Sports Updates Coming Soon', 'Stay tuned for live sports updates, match schedules, and results for all PCCOE inter-college and intra-college tournaments.'),
('exams', 'Exam Resources & Updates', 'Get notified about exam schedules, study group formations, and resource sharing. Help each other succeed academically!'),
('placements', 'Placement Season Updates', 'Placement announcements, company visits, and preparation resources will be shared here. Stay prepared and help your peers!'),
('events', 'What''s Coming Next?', 'We''re working on: Event calendars, study group matching, resource libraries, alumni connections, and more. Your feedback shapes ChatPCCOE''s future!'),
('general', 'Share Your Feedback', 'ChatPCCOE is built for you. Have ideas or found a bug? Reach out to the admin team. Together we''ll make this the best platform for PCCOE students.');
```

## Step 4: Seed an introductory social post

This requires an authenticated admin user to exist (due to RLS). After you create your admin account post-wipe, I'll help you create the intro post. Alternatively, I can create it via a migration using a `SECURITY DEFINER` function that bypasses RLS.

The intro post content will cover:
- What ChatPCCOE is
- Key features (connections, messaging, groups, social feed)
- Community guidelines
- What's planned for the future

## Summary of Changes
1. **Migration**: Delete all data from all tables
2. **Manual step**: Delete auth users from Supabase Dashboard
3. **Migration**: Seed 8 welcome notifications across categories
4. **Post-setup**: Create intro social post once admin account exists

