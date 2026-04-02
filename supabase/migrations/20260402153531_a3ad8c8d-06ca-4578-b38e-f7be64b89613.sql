
CREATE OR REPLACE FUNCTION public.get_unread_notification_count(user_uuid uuid)
RETURNS json
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  unread_notif_count INTEGER;
  pending_connection_count INTEGER;
BEGIN
  -- Count notifications not yet read by this user
  SELECT COUNT(*) INTO unread_notif_count
  FROM notifications n
  WHERE NOT EXISTS (
    SELECT 1 FROM notification_reads nr
    WHERE nr.notification_id = n.id AND nr.profile_id = user_uuid
  );

  -- Count pending connection requests for this user
  SELECT COUNT(*) INTO pending_connection_count
  FROM connections_v2
  WHERE receiver_id = user_uuid AND status = 'pending';

  RETURN json_build_object(
    'unread_notifications', unread_notif_count,
    'pending_connections', pending_connection_count,
    'total', unread_notif_count + pending_connection_count
  );
END;
$$;
