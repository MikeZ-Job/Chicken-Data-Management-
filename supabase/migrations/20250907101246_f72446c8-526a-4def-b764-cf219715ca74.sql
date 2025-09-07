-- Drop the existing default and create the enum properly
ALTER TABLE public.app_users ALTER COLUMN role DROP DEFAULT;

-- Create enum for specific roles
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('admin', 'farm_manager', 'staff');

-- Add farm assignment for Farm Managers
ALTER TABLE public.app_users 
ADD COLUMN IF NOT EXISTS assigned_farm_id uuid REFERENCES public.farms(id);

-- Update role column to use the enum
ALTER TABLE public.app_users 
ALTER COLUMN role TYPE user_role USING role::text::user_role;

-- Set new default
ALTER TABLE public.app_users 
ALTER COLUMN role SET DEFAULT 'staff'::user_role;

-- Update default permissions based on roles
UPDATE public.app_users 
SET permissions = CASE 
  WHEN role = 'admin' THEN ARRAY['full_access', 'user_management', 'farm_management', 'view_all_farms']
  WHEN role = 'farm_manager' THEN ARRAY['manage_assigned_farm', 'view_reports', 'manage_staff']
  WHEN role = 'staff' THEN ARRAY['record_weights', 'record_food', 'view_assigned_data']
  ELSE permissions
END;

-- Create helper functions for role checking
CREATE OR REPLACE FUNCTION public.is_farm_manager(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.app_users 
    WHERE id = _user_id AND role = 'farm_manager'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.app_users 
    WHERE id = _user_id AND role = 'staff'
  );
$$;