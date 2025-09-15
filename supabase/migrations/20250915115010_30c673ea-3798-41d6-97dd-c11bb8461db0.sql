-- Add expiry_date field to app_users table
ALTER TABLE public.app_users 
ADD COLUMN expiry_date DATE NULL;

-- Add index for better performance on expiry date queries
CREATE INDEX idx_app_users_expiry_date ON public.app_users(expiry_date);

-- Add a function to check if user account is expired
CREATE OR REPLACE FUNCTION public.is_user_expired(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN expiry_date IS NULL THEN FALSE
    WHEN expiry_date < CURRENT_DATE THEN TRUE
    ELSE FALSE
  END
  FROM public.app_users
  WHERE id = user_id;
$$;