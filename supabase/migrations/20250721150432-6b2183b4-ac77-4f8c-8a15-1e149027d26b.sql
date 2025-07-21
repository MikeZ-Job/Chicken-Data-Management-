-- Add supplier column to the food_inventory table
ALTER TABLE public.food_inventory 
ADD COLUMN supplier TEXT;