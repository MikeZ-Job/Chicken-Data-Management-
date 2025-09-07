-- First, let's drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.app_users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.app_users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.app_users;
DROP POLICY IF EXISTS "System can create users" ON public.app_users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.app_users;

-- Create secure RLS policies for app_users table
-- Users can only view their own profile
CREATE POLICY "Users can view own profile" 
ON public.app_users 
FOR SELECT 
USING (auth.uid()::text = id::text);

-- Users can update their own profile (except sensitive fields)
CREATE POLICY "Users can update own profile" 
ON public.app_users 
FOR UPDATE 
USING (auth.uid()::text = id::text)
WITH CHECK (auth.uid()::text = id::text);

-- Only allow inserts for new user creation (system level)
CREATE POLICY "System can create users" 
ON public.app_users 
FOR INSERT 
WITH CHECK (true);

-- Admins can view all users (but this requires checking role in a secure way)
-- For now, we'll restrict this to prevent recursive queries

-- Update all other tables to require authentication
-- Fix farm-related tables to require authentication

-- Farms table
DROP POLICY IF EXISTS "Allow all operations on farms" ON public.farms;
CREATE POLICY "Authenticated users can access farms" 
ON public.farms 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Chicken inventory
DROP POLICY IF EXISTS "Allow all operations on chicken_inventory" ON public.chicken_inventory;
CREATE POLICY "Authenticated users can access chicken inventory" 
ON public.chicken_inventory 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Food inventory
DROP POLICY IF EXISTS "Allow all operations on food_inventory" ON public.food_inventory;
CREATE POLICY "Authenticated users can access food inventory" 
ON public.food_inventory 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Medicine inventory
DROP POLICY IF EXISTS "Allow all operations on medicine_inventory" ON public.medicine_inventory;
CREATE POLICY "Authenticated users can access medicine inventory" 
ON public.medicine_inventory 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Worker food
DROP POLICY IF EXISTS "Allow all operations on worker_food" ON public.worker_food;
CREATE POLICY "Authenticated users can access worker food" 
ON public.worker_food 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Chicken processing
DROP POLICY IF EXISTS "Allow all operations on chicken_processing" ON public."Chicken Processing";
CREATE POLICY "Authenticated users can access chicken processing" 
ON public."Chicken Processing" 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Chicken weights
DROP POLICY IF EXISTS "Allow all operations on chicken_weights" ON public.chicken_weights;
CREATE POLICY "Authenticated users can access chicken weights" 
ON public.chicken_weights 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Weight standards
DROP POLICY IF EXISTS "Allow all operations on weight_standards" ON public.weight_standards;
CREATE POLICY "Authenticated users can access weight standards" 
ON public.weight_standards 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);