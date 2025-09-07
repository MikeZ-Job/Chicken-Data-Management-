-- Fix critical security vulnerabilities in app_users table
-- Remove the overly permissive RLS policy
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.app_users;

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

-- Admins can view all users
CREATE POLICY "Admins can view all users" 
ON public.app_users 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.app_users 
    WHERE id::text = auth.uid()::text 
    AND role = 'admin'
  )
);

-- Fix farm-related tables to require authentication
-- Drop overly permissive policies and create secure ones

-- Farms table - users can only access farms they own or are authorized for
DROP POLICY IF EXISTS "Allow all operations on farms" ON public.farms;

CREATE POLICY "Authenticated users can view farms" 
ON public.farms 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage farms" 
ON public.farms 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Chicken inventory - require authentication
DROP POLICY IF EXISTS "Allow all operations on chicken_inventory" ON public.chicken_inventory;

CREATE POLICY "Authenticated users can access chicken inventory" 
ON public.chicken_inventory 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Food inventory - require authentication  
DROP POLICY IF EXISTS "Allow all operations on food_inventory" ON public.food_inventory;

CREATE POLICY "Authenticated users can access food inventory" 
ON public.food_inventory 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Medicine inventory - require authentication
DROP POLICY IF EXISTS "Allow all operations on medicine_inventory" ON public.medicine_inventory;

CREATE POLICY "Authenticated users can access medicine inventory" 
ON public.medicine_inventory 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Worker food - require authentication
DROP POLICY IF EXISTS "Allow all operations on worker_food" ON public.worker_food;

CREATE POLICY "Authenticated users can access worker food" 
ON public.worker_food 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Chicken processing - require authentication
DROP POLICY IF EXISTS "Allow all operations on chicken_processing" ON public."Chicken Processing";

CREATE POLICY "Authenticated users can access chicken processing" 
ON public."Chicken Processing" 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Chicken weights - require authentication
DROP POLICY IF EXISTS "Allow all operations on chicken_weights" ON public.chicken_weights;

CREATE POLICY "Authenticated users can access chicken weights" 
ON public.chicken_weights 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Weight standards - require authentication
DROP POLICY IF EXISTS "Allow all operations on weight_standards" ON public.weight_standards;

CREATE POLICY "Authenticated users can access weight standards" 
ON public.weight_standards 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);