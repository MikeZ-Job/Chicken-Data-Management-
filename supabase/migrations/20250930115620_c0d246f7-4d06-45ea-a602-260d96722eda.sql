-- Create workers table for worker profiles
CREATE TABLE public.workers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  contact_info TEXT,
  phone_number TEXT,
  national_id_number TEXT,
  food_allocated NUMERIC DEFAULT 0,
  farm_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create salary_tracking table
CREATE TABLE public.salary_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  salary_amount NUMERIC NOT NULL,
  amount_paid NUMERIC DEFAULT 0,
  amount_due NUMERIC GENERATED ALWAYS AS (salary_amount - amount_paid) STORED,
  payment_date DATE,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid')),
  farm_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for workers table
CREATE POLICY "Authenticated users can access workers"
ON public.workers
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Create policies for salary_tracking table
CREATE POLICY "Authenticated users can access salary tracking"
ON public.salary_tracking
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates on workers
CREATE TRIGGER update_workers_updated_at
BEFORE UPDATE ON public.workers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on salary_tracking
CREATE TRIGGER update_salary_tracking_updated_at
BEFORE UPDATE ON public.salary_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_workers_farm_id ON public.workers(farm_id);
CREATE INDEX idx_workers_worker_id ON public.workers(worker_id);
CREATE INDEX idx_salary_tracking_worker_id ON public.salary_tracking(worker_id);
CREATE INDEX idx_salary_tracking_farm_id ON public.salary_tracking(farm_id);