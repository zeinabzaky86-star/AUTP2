-- Fix critical RLS policy gaps identified in security scan

-- 1. Fix security definer view issue by dropping and recreating without SECURITY DEFINER
DROP VIEW IF EXISTS public.services_effective_pricing;

CREATE VIEW public.services_effective_pricing AS
SELECT 
  s.id,
  s.name,
  s.category,
  s.description,
  s.status,
  s.base_price,
  s.tenant_price,
  s.au_affiliate_price,
  s.external_price,
  JSON_BUILD_OBJECT(
    'base', s.base_price,
    'tenant', s.tenant_price,
    'au_affiliate', s.au_affiliate_price,
    'external', s.external_price
  ) as pricing,
  s.lead_time,
  s.duration,
  s.tags,
  s.media_urls,
  s.notes,
  s.assigned_to,
  s.contact_email,
  s.availability_status,
  s.available,
  s.service_name,
  s.created_by,
  s.updated_by,
  s.created_at
FROM services s
WHERE s.status = 'active';

-- Grant select access to authenticated users
GRANT SELECT ON public.services_effective_pricing TO authenticated;

-- 2. Strengthen profiles table RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create more restrictive profiles policies
CREATE POLICY "Users can view own profile only"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile only"
ON public.profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins have full profile access"
ON public.profiles
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 3. Strengthen bookings table RLS policies (remove conflicting policies)
DROP POLICY IF EXISTS "Users can update own pending bookings only" ON public.bookings;

-- Replace with proper admin/user access
CREATE POLICY "Users can update own pending bookings only"
ON public.bookings
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND status = 'pending')
WITH CHECK (user_id = auth.uid() AND status = 'pending');

-- 4. Secure service_activity_log - admin only access
DROP POLICY IF EXISTS "Enable read access for all users" ON public.service_activity_log;

-- The existing policies are already secure, just ensure no broader access exists

-- 5. Secure notifications table - user and admin only
-- The existing policies are already properly configured

-- 6. Ensure all tables have RLS enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;