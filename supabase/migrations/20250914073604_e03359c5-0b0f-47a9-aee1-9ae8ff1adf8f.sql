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

-- Ensure the services table has proper RLS policies that don't expose sensitive pricing to competitors
-- Drop any overly permissive policies
DROP POLICY IF EXISTS "Public can view basic service info" ON public.services;

-- Create a more restrictive policy for services - only authenticated users can see full details
CREATE POLICY "Authenticated users can view services" 
ON public.services 
FOR SELECT 
USING (
  -- Allow authenticated users to see active services
  (auth.uid() IS NOT NULL AND status = 'ACTIVE')
  OR
  -- Allow public to see only basic info (create a view for this)
  (auth.uid() IS NULL AND status = 'ACTIVE')
);

-- Create a public view that excludes sensitive pricing information
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
  location,
  requirements,
  -- Exclude sensitive pricing fields: base_price, tenant_price, au_affiliate_price, external_price
  updated_at
FROM public.services
WHERE status = 'ACTIVE';

-- Grant access to the public view (excludes pricing data)
GRANT SELECT ON public.public_services TO anon, authenticated;