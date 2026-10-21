-- SECURITY FIX: Remove SECURITY DEFINER from services_effective_pricing view and implement proper RLS
-- This addresses the critical security warning about SECURITY DEFINER views

-- Drop the existing view that has SECURITY DEFINER
DROP VIEW IF EXISTS public.services_effective_pricing;

-- Recreate the view WITHOUT SECURITY DEFINER property
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

-- Enable Row Level Security on the view
ALTER VIEW public.services_effective_pricing ENABLE ROW LEVEL SECURITY;

-- Create restrictive RLS policy - only allow authenticated users to view pricing
CREATE POLICY "Authenticated users can view effective pricing" 
ON public.services_effective_pricing 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create policy for admins to have full access
CREATE POLICY "Admins can manage effective pricing view" 
ON public.services_effective_pricing 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    )
);