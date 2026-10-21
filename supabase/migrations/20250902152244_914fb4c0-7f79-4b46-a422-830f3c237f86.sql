-- Fix security vulnerability: Restrict application access to require both reference code AND email
-- This prevents unauthorized access while still allowing legitimate applicants to view their applications

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Applicants can view their own application by reference code" ON public.applications;

-- Create a new, more secure policy that restricts access to authenticated users and admins only
CREATE POLICY "Secure application access for authenticated users" 
ON public.applications 
FOR SELECT 
USING (
  -- Only authenticated users or admins can access application data directly
  auth.uid() IS NOT NULL OR is_admin(auth.uid())
);

-- Create a secure function to allow applicants to view their applications with reference code and email verification
CREATE OR REPLACE FUNCTION public.get_application_by_reference_and_email(
  _reference_code text,
  _email text
) 
RETURNS TABLE (
  id uuid,
  reference_code text,
  applicant_name text,
  email text,
  phone text,
  status application_status,
  submitted_at timestamp with time zone,
  decided_at timestamp with time zone,
  decision_reason text
) 
LANGUAGE sql 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    a.id,
    a.reference_code,
    a.applicant_name,
    a.email,
    a.phone,
    a.status,
    a.submitted_at,
    a.decided_at,
    a.decision_reason
  FROM public.applications a
  WHERE a.reference_code = _reference_code 
    AND LOWER(a.email) = LOWER(_email)
  LIMIT 1;
$$;