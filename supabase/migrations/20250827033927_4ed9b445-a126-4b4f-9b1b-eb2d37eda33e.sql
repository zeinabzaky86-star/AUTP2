-- Drop the security definer view that's causing the security warning
DROP VIEW IF EXISTS public.services_effective_pricing;

-- Recreate the view without security definer if needed
-- This view appears to be a simple data transformation view, so it doesn't need security definer
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
    json_build_object(
        'base', base_price, 
        'tenant', tenant_price, 
        'au_affiliate', au_affiliate_price, 
        'external', external_price
    ) AS pricing,
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