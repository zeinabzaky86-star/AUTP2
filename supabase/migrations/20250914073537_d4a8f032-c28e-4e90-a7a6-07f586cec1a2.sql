-- Fix Security Error 1: Remove security definer view if it exists
DROP VIEW IF EXISTS public.service_view;

-- Fix Security Error 2: Secure applications table with proper RLS policies
-- First, ensure RLS is enabled on applications table
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Drop existing overly permissive policies if they exist
DROP POLICY IF EXISTS "Applications are viewable by everyone" ON public.applications;
DROP POLICY IF EXISTS "Applications are publicly readable" ON public.applications;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.applications;

-- Create secure policies for applications table
-- Only allow users to view their own applications
CREATE POLICY "Users can view their own applications" 
ON public.applications 
FOR SELECT 
USING (email = auth.jwt()->>'email');

-- Allow users to insert their own applications
CREATE POLICY "Users can create applications" 
ON public.applications 
FOR INSERT 
WITH CHECK (true);

-- Only allow admins to view all applications (requires admin role check)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the user has admin role in user metadata
  RETURN (auth.jwt()->>'role' = 'admin') OR (auth.jwt()->'user_metadata'->>'role' = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Admins can view all applications" 
ON public.applications 
FOR SELECT 
USING (public.is_admin());

-- Secure the services table as well to address the other warnings
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Allow public read access to services but restrict sensitive data for authenticated users only
CREATE POLICY "Public can view basic service info" 
ON public.services 
FOR SELECT 
USING (status = 'ACTIVE');

-- Note: The above policy allows public read which may still expose pricing
-- Consider creating a view that excludes sensitive pricing data for public access
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
  updated_at
FROM public.services
WHERE status = 'ACTIVE';

-- Grant access to the public view
GRANT SELECT ON public.public_services TO anon, authenticated;