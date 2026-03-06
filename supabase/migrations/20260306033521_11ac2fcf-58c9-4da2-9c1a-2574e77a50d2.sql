
-- Insert profile for existing auth user with admin role
INSERT INTO public.profiles (id, email, full_name, role)
VALUES ('a6118938-0fa8-488b-94a0-416b174b0d0b', 'anshul.wagh22@pccoepune.org', 'Anshul Wagh', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
