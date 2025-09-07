-- Create chicken_weights table for daily weight tracking
CREATE TABLE public.chicken_weights (
  id BIGSERIAL PRIMARY KEY,
  chicken_id BIGINT NOT NULL REFERENCES public.chicken_inventory(id) ON DELETE CASCADE,
  date_recorded DATE NOT NULL,
  weight_kg NUMERIC(5,2) NOT NULL CHECK (weight_kg > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(chicken_id, date_recorded)
);

-- Create weight_standards table for comparison
CREATE TABLE public.weight_standards (
  id BIGSERIAL PRIMARY KEY,
  age_in_days INTEGER NOT NULL UNIQUE CHECK (age_in_days >= 0),
  expected_weight_kg NUMERIC(5,2) NOT NULL CHECK (expected_weight_kg > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.chicken_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_standards ENABLE ROW LEVEL SECURITY;

-- Create policies for chicken_weights
CREATE POLICY "Allow all operations on chicken_weights" 
ON public.chicken_weights 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create policies for weight_standards
CREATE POLICY "Allow all operations on weight_standards" 
ON public.weight_standards 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Insert some default weight standards (example data for broiler chickens)
INSERT INTO public.weight_standards (age_in_days, expected_weight_kg) VALUES
(1, 0.04),
(7, 0.18),
(14, 0.45),
(21, 0.85),
(28, 1.40),
(35, 2.10),
(42, 2.90),
(49, 3.80),
(56, 4.70);

-- Create indexes for better performance
CREATE INDEX idx_chicken_weights_chicken_id ON public.chicken_weights(chicken_id);
CREATE INDEX idx_chicken_weights_date ON public.chicken_weights(date_recorded);
CREATE INDEX idx_weight_standards_age ON public.weight_standards(age_in_days);