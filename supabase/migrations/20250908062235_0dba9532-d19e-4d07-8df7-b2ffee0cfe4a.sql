-- Insert mikejob202@gmail.com into app_users with admin role
INSERT INTO app_users (id, role, permissions, assigned_farm_id)
SELECT 
  u.id,
  'admin'::user_role,
  ARRAY['full_access'],
  NULL
FROM auth.users u 
WHERE u.email = 'mikejob202@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin'::user_role,
  permissions = ARRAY['full_access'],
  assigned_farm_id = NULL,
  updated_at = now();