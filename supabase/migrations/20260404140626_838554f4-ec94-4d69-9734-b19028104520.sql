
ALTER TABLE public.group_members DISABLE TRIGGER trg_prevent_removing_last_lead_delete;
ALTER TABLE public.group_members DISABLE TRIGGER trg_prevent_removing_last_lead_update;

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

ALTER TABLE public.group_members ENABLE TRIGGER trg_prevent_removing_last_lead_delete;
ALTER TABLE public.group_members ENABLE TRIGGER trg_prevent_removing_last_lead_update;
