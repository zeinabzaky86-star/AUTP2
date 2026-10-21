-- Fix the security definer view issue by dropping and recreating without SECURITY DEFINER
DROP VIEW IF EXISTS public.services_effective_pricing;

-- Create a regular view without SECURITY DEFINER that relies on RLS policies
CREATE VIEW public.services_effective_pricing AS
SELECT 
  s.id,
  s.name,
  s.service_name,
  s.category,
  s.description,
  s.available,
  s.status,
  s.lead_time,
  s.duration,
  s.tags,
  s.media_urls,
  s.notes,
  s.assigned_to,
  s.contact_email,
  s.availability_status,
  s.created_at,
  s.created_by,
  s.updated_by,
  CASE 
    -- If user is admin, show all pricing
    WHEN is_admin() THEN 
      jsonb_build_object(
        'tenant_price', s.tenant_price,
        'au_affiliate_price', s.au_affiliate_price,
        'external_price', s.external_price,
        'base_price', s.base_price
      )
    -- If user has a profile, show pricing based on tenant_type
    WHEN (SELECT tenant_type FROM profiles WHERE user_id = auth.uid()) = 'tenant' THEN
      jsonb_build_object('price', s.tenant_price)
    WHEN (SELECT tenant_type FROM profiles WHERE user_id = auth.uid()) = 'au_affiliate' THEN
      jsonb_build_object('price', s.au_affiliate_price)
    ELSE
      jsonb_build_object('price', s.external_price)
  END as pricing
FROM services s
WHERE 
  -- Inherit RLS from services table
  (s.available = true OR is_admin());

-- Grant access to the view
GRANT SELECT ON public.services_effective_pricing TO authenticated;