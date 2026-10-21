-- CRITICAL SECURITY FIX: Remove dangerous policy that allows anyone with reference code to view applications
-- This policy currently allows unauthorized access to sensitive personal data

-- Drop the extremely dangerous policy that only checks reference_code IS NOT NULL
-- This essentially allows anyone to view any application
DROP POLICY IF EXISTS "Applicants can view their own application by reference code" ON public.applications;

-- Verify that only secure access remains:
-- 1. Admins can manage all applications (existing policies)
-- 2. Public can submit new applications (existing policy) 
-- 3. Applicants can ONLY view their data through the secure function get_application_by_reference_and_email()
--    which requires BOTH reference code AND email verification

-- No additional policies needed - the secure function provides proper access control