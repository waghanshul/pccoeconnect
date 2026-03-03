CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow querying own role unless caller is admin
  IF user_id != auth.uid() THEN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
      RAISE EXCEPTION 'Unauthorized: cannot query other users roles';
    END IF;
  END IF;
  RETURN (SELECT role FROM public.profiles WHERE id = user_id);
END;
$$;