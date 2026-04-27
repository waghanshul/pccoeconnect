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
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'prn', ''), 'PENDING-' || substr(NEW.id::text, 1, 8)),
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'branch', ''), 'Unassigned'),
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'year', ''), '1st'),
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'recoveryEmail', ''), NEW.email)
    );
  END IF;

  RETURN NEW;
END;
$$;