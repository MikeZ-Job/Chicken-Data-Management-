-- Update the app_users table to have better role structure
ALTER TABLE public.app_users 
ALTER COLUMN role DROP DEFAULT,
ALTER COLUMN role SET DEFAULT 'staff';

-- Add farm assignment for Farm Managers
ALTER TABLE public.app_users 
ADD COLUMN assigned_farm_id uuid REFERENCES public.farms(id);

-- Create enum for specific roles
CREATE TYPE user_role AS ENUM ('admin', 'farm_manager', 'staff');

-- Update role column to use the enum (this will maintain existing data)
ALTER TABLE public.app_users 
ALTER COLUMN role TYPE user_role USING role::user_role;

-- Update default permissions based on roles
UPDATE public.app_users 
SET permissions = CASE 
  WHEN role = 'admin' THEN ARRAY['full_access', 'user_management', 'farm_management', 'view_all_farms']
  WHEN role = 'farm_manager' THEN ARRAY['manage_assigned_farm', 'view_reports', 'manage_staff']
  WHEN role = 'staff' THEN ARRAY['record_weights', 'record_food', 'view_assigned_data']
  ELSE permissions
END;