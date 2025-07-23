-- Create RLS policies for all tables to allow public access
-- Since this is an internal management system, we'll allow all operations

-- Policies for chicken_inventory table
CREATE POLICY "Allow all operations on chicken_inventory" 
ON public.chicken_inventory 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Policies for food_inventory table
CREATE POLICY "Allow all operations on food_inventory" 
ON public.food_inventory 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Policies for medicine_inventory table
CREATE POLICY "Allow all operations on medicine_inventory" 
ON public.medicine_inventory 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Policies for worker_food table
CREATE POLICY "Allow all operations on worker_food" 
ON public.worker_food 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Policies for Chicken Processing table (note the space in table name)
CREATE POLICY "Allow all operations on chicken_processing" 
ON public."Chicken Processing" 
FOR ALL 
USING (true) 
WITH CHECK (true);