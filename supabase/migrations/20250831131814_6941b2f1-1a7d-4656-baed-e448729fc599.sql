-- Create application_status enum
CREATE TYPE public.application_status AS ENUM (
  'submitted',
  'under_review', 
  'approved',
  'rejected',
  'waitlisted'
);

-- Create applications table
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reference_code TEXT NOT NULL DEFAULT 'ATP-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  applicant_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  status application_status NOT NULL DEFAULT 'submitted',
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  form_data JSONB NOT NULL,
  decision_reason TEXT,
  decided_at TIMESTAMP WITH TIME ZONE,
  decided_by UUID,
  UNIQUE(reference_code)
);

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can submit applications" 
ON public.applications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Applicants can view their own application by reference code" 
ON public.applications 
FOR SELECT 
USING (reference_code IS NOT NULL);

CREATE POLICY "Admins can view all applications" 
ON public.applications 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update applications" 
ON public.applications 
FOR UPDATE 
USING (is_admin(auth.uid())) 
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete applications" 
ON public.applications 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();