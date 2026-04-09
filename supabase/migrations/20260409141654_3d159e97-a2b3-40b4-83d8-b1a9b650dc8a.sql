
-- 1. Update the trigger to whitelist anshul.wagh22@pccoepune.org as admin
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  detected_role text;
  local_part text;
BEGIN
  local_part := split_part(NEW.email, '@', 1);
  
  -- Whitelist specific emails as admin
  IF NEW.email = 'anshul.wagh22@pccoepune.org' THEN
    detected_role := 'admin';
  ELSIF local_part ~ '[0-9]' THEN
    detected_role := 'student';
  ELSE
    detected_role := 'admin';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    detected_role
  );
  
  IF detected_role = 'student' THEN
    INSERT INTO public.student_profiles (
      id, prn, branch, year, recovery_email
    )
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'prn',
      NEW.raw_user_meta_data->>'branch',
      NEW.raw_user_meta_data->>'year',
      NEW.raw_user_meta_data->>'recoveryEmail'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 2. Update existing profile role for this user if already registered
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'anshul.wagh22@pccoepune.org' AND role != 'admin';

-- 3. Add RLS policy so admins can delete any social post
CREATE POLICY "Admins can delete any post"
ON public.social_posts
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
