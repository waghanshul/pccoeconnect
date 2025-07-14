-- Security Fix 1: Prevent role escalation vulnerability
-- Drop the existing update policy that allows users to modify their own profiles including role
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create a restricted update policy that excludes role field
CREATE POLICY "Users can update own profile except role" ON public.profiles
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND (OLD.role = NEW.role OR OLD.role IS NULL));

-- Security Fix 2: Create admin-only role management policy
CREATE POLICY "Only admins can update roles" ON public.profiles
FOR UPDATE 
USING (
  auth.uid() = id AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (true);

-- Security Fix 3: Add role validation constraint
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_roles 
CHECK (role IN ('student', 'admin'));

-- Security Fix 4: Create audit logging table for admin actions
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES public.profiles(id),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Security Fix 5: Create function to safely check user role (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- Security Fix 6: Enhanced admin creation function
CREATE OR REPLACE FUNCTION public.create_admin_user(
  p_email TEXT,
  p_full_name TEXT,
  p_employee_id TEXT,
  p_department TEXT,
  p_designation TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Only existing admins can create new admin users
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Only admins can create admin users');
  END IF;

  -- Generate a UUID for the new admin user
  new_user_id := gen_random_uuid();
  
  -- Insert into profiles table with admin role
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new_user_id, p_email, p_full_name, 'admin');
  
  -- Insert into admin_profiles table
  INSERT INTO public.admin_profiles (id, employee_id, department, designation)
  VALUES (new_user_id, p_employee_id, p_department, p_designation);
  
  -- Log the admin creation
  INSERT INTO public.admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (
    auth.uid(), 
    'create_admin_user', 
    new_user_id,
    jsonb_build_object(
      'email', p_email,
      'employee_id', p_employee_id,
      'department', p_department
    )
  );
  
  RETURN jsonb_build_object('success', true, 'user_id', new_user_id);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;