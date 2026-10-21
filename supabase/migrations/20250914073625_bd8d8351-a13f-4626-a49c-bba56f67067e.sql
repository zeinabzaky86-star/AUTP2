-- Fix Security Error 1: Remove any security definer views if they exist
DROP VIEW IF EXISTS public.service_view;

-- Fix Security Error 2: Secure applications table with proper RLS policies
-- Drop the overly permissive policy that allows anyone to view applications
DROP POLICY IF EXISTS "Applicants can view their own application with reference code a" ON public.applications;

-- Create a more secure policy for applicants to view only their own applications
CREATE POLICY "Users can view their own applications by email" 
ON public.applications 
FOR SELECT 
USING (
  -- Allow users to view applications that match their authenticated email
  (auth.jwt()->>'email' = email) 
  OR 
  -- Also allow viewing by authenticated user ID if they created it
  (auth.uid() IS NOT NULL AND email = auth.jwt()->>'email')
);

-- Create a public view that excludes sensitive pricing information from services
DROP VIEW IF EXISTS public.public_services;
CREATE VIEW public.public_services AS
SELECT 
  id,
  service_name,
  one_liner,
  description,
  provider,
  status,
  category,
  tags,
  availability_status,
  lead_time,
  requirements,
  -- Exclude sensitive pricing fields: base_price, tenant_price, au_affiliate_price, external_price
  -- Exclude contact information to prevent harvesting
  updated_at
FROM public.services
WHERE status = 'ACTIVE';

-- Grant access to the public view (excludes pricing and contact data)
GRANT SELECT ON public.public_services TO anon, authenticated;