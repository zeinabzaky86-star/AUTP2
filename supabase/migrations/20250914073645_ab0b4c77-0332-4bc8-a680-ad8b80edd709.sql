-- Fix remaining Security Definer View errors
-- Remove any views that have security definer property

-- Check for and remove services_effective_pricing if it has security definer
DROP VIEW IF EXISTS public.services_effective_pricing CASCADE;

-- Recreate services_effective_pricing as a regular view (not security definer)
CREATE VIEW public.services_effective_pricing AS
SELECT 
  s.id,
  s.base_price,
  s.tenant_price,
  s.au_affiliate_price,
  s.external_price,
  -- Create a pricing JSON object for easier access
  json_build_object(
    'base_price', s.base_price,
    'tenant_price', s.tenant_price,
    'au_affiliate_price', s.au_affiliate_price,
    'external_price', s.external_price
  ) as pricing,
  s.available,
  s.created_by,
  s.updated_by,
  s.created_at,
  s.name,
  s.category,
  s.description,
  s.status,
  s.lead_time,
  s.duration,
  s.tags,
  s.media_urls,
  s.notes,
  s.assigned_to,
  s.contact_email,
  s.availability_status,
  s.service_name
FROM public.services s
WHERE s.status = 'ACTIVE';

-- Grant appropriate permissions to the view (only for authenticated users to protect pricing)
GRANT SELECT ON public.services_effective_pricing TO authenticated;

-- Remove any other potential security definer views
-- List and check for any other views that might be causing issues
DO $$
DECLARE
    view_name text;
BEGIN
    -- Find and drop any remaining views that might be security definer
    FOR view_name IN 
        SELECT schemaname||'.'||viewname 
        FROM pg_views 
        WHERE schemaname = 'public' 
        AND viewname NOT IN ('public_services', 'services_effective_pricing')
        AND viewowner = 'postgres'
    LOOP
        EXECUTE 'DROP VIEW IF EXISTS ' || view_name || ' CASCADE';
    END LOOP;
END $$;