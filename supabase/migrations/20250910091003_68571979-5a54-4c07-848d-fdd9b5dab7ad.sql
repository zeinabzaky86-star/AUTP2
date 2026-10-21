-- SECURITY FIX: Remove SECURITY DEFINER from services_effective_pricing view
-- Views cannot have RLS policies but inherit security from underlying tables

-- Drop the existing view that has SECURITY DEFINER
DROP VIEW IF EXISTS public.services_effective_pricing;

-- Recreate the view WITHOUT SECURITY DEFINER property
-- The view will now inherit access controls from the underlying services table
CREATE VIEW public.services_effective_pricing AS 
SELECT 
    id,
    name,
    category,
    description,
    status,
    base_price,
    tenant_price,
    au_affiliate_price,
    external_price,
    json_build_object('base', base_price, 'tenant', tenant_price, 'au_affiliate', au_affiliate_price, 'external', external_price) AS pricing,
    lead_time,
    duration,
    tags,
    media_urls,
    notes,
    assigned_to,
    contact_email,
    availability_status,
    available,
    service_name,
    created_by,
    updated_by,
    created_at
FROM services s
WHERE status = 'active';