-- Fix critical security vulnerability: Remove overly permissive policy that allows any authenticated user to view all applications
-- Only admins should have direct table access, public users should use the secure function

-- Drop the problematic policy that allows any authenticated user to view all applications
DROP POLICY IF EXISTS "Secure application access for authenticated users" ON public.applications;

-- The applications table should only be accessible by admins for direct queries
-- Public users can only access their applications through the secure function that requires both reference code and email
-- This ensures proper data isolation and prevents unauthorized access to sensitive customer information

-- Admin access policies are already in place:
-- - "Admins can view all applications" (SELECT for admins)
-- - "Admins can update applications" (UPDATE for admins) 
-- - "Admins can delete applications" (DELETE for admins)

-- Public access is handled through:
-- - "Public can submit applications" (INSERT with true - allows anonymous submission)
-- - get_application_by_reference_and_email() function (requires both reference code and email verification)