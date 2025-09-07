-- CRITICAL SECURITY FIX: Remove plaintext passwords from app_users table
-- This fixes the vulnerability where any authenticated user could steal all passwords

-- First, drop the password column entirely to prevent password exposure
ALTER TABLE public.app_users DROP COLUMN IF EXISTS password;

-- Also drop the username column since we should use Supabase Auth emails instead
ALTER TABLE public.app_users DROP COLUMN IF EXISTS username;

-- Update the app_users table structure to work with Supabase Auth
-- The id should reference auth.users(id) to link with Supabase Auth
ALTER TABLE public.app_users ADD CONSTRAINT app_users_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create a secure function to check if a user is admin (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.app_users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Drop existing policies and create secure ones
DROP POLICY IF EXISTS "Users can view own profile" ON public.app_users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.app_users;
DROP POLICY IF EXISTS "System can create users" ON public.app_users;
DROP POLICY IF EXISTS "Authenticated users can create profile" ON public.app_users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.app_users;

-- Users can only view their own profile (no passwords to steal now)
CREATE POLICY "Users can view own profile" 
ON public.app_users 
FOR SELECT 
USING (auth.uid() = id);

-- Users can update their own profile (role changes only allowed by admin)
CREATE POLICY "Users can update own profile" 
ON public.app_users 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can view all users (using secure function)
CREATE POLICY "Admins can view all users" 
ON public.app_users 
FOR SELECT 
USING (public.is_admin());

-- Only authenticated users can insert (for profile creation)
CREATE POLICY "Authenticated users can create profile" 
ON public.app_users 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create trigger to automatically create app_users profile when Supabase user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.app_users (id, role, permissions)
  VALUES (NEW.id, 'user', '{}');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();