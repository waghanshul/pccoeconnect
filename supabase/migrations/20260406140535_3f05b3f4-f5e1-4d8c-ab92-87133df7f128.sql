CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  detected_role text;
  local_part text;
BEGIN
  -- Extract local part of email (before @)
  local_part := split_part(NEW.email, '@', 1);
  
  -- Detect role based on email pattern:
  -- Professor emails have NO digits in local part (e.g. rucha.shinde@pccoepune.org)
  -- Student emails contain digits (e.g. mangal.singhal22@pccoepune.org)
  IF local_part ~ '[0-9]' THEN
    detected_role := 'student';
  ELSE
    detected_role := 'admin';
  END IF;

  -- Create profile with server-enforced role (ignores client-side role override)
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    detected_role
  );
  
  -- If user role is student, create student profile
  IF detected_role = 'student' THEN
    INSERT INTO public.student_profiles (
      id, 
      prn, 
      branch, 
      year, 
      recovery_email
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