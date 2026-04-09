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