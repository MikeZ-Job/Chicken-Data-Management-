-- Create farms table
CREATE TABLE public.farms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_name TEXT NOT NULL,
  location TEXT,
  owner TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;

-- Create policy for farms (allow all operations for now)
CREATE POLICY "Allow all operations on farms" 
ON public.farms 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add farm_id to existing tables
ALTER TABLE public.food_inventory ADD COLUMN farm_id UUID REFERENCES public.farms(id);
ALTER TABLE public.chicken_inventory ADD COLUMN farm_id UUID REFERENCES public.farms(id);
ALTER TABLE public.medicine_inventory ADD COLUMN farm_id UUID REFERENCES public.farms(id);
ALTER TABLE public.worker_food ADD COLUMN farm_id UUID REFERENCES public.farms(id);
ALTER TABLE public."Chicken Processing" ADD COLUMN farm_id UUID REFERENCES public.farms(id);

-- Create indexes for better performance
CREATE INDEX idx_food_inventory_farm_id ON public.food_inventory(farm_id);
CREATE INDEX idx_chicken_inventory_farm_id ON public.chicken_inventory(farm_id);
CREATE INDEX idx_medicine_inventory_farm_id ON public.medicine_inventory(farm_id);
CREATE INDEX idx_worker_food_farm_id ON public.worker_food(farm_id);
CREATE INDEX idx_chicken_processing_farm_id ON public."Chicken Processing"(farm_id);

-- Insert a default farm for existing data
INSERT INTO public.farms (farm_name, location, owner) 
VALUES ('Main Farm', 'Default Location', 'System Admin');

-- Update existing records to link to the default farm
UPDATE public.food_inventory 
SET farm_id = (SELECT id FROM public.farms WHERE farm_name = 'Main Farm' LIMIT 1)
WHERE farm_id IS NULL;

UPDATE public.chicken_inventory 
SET farm_id = (SELECT id FROM public.farms WHERE farm_name = 'Main Farm' LIMIT 1)
WHERE farm_id IS NULL;

UPDATE public.medicine_inventory 
SET farm_id = (SELECT id FROM public.farms WHERE farm_name = 'Main Farm' LIMIT 1)
WHERE farm_id IS NULL;

UPDATE public.worker_food 
SET farm_id = (SELECT id FROM public.farms WHERE farm_name = 'Main Farm' LIMIT 1)
WHERE farm_id IS NULL;