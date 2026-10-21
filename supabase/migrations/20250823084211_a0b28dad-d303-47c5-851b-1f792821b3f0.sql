-- Storage hardening: Make news-images bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'news-images';

-- Create a secure pricing view that only shows relevant pricing based on user type
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
FROM services s;

-- Enable RLS on the view
ALTER VIEW public.services_effective_pricing OWNER TO postgres;

-- Grant access to the view
GRANT SELECT ON public.services_effective_pricing TO authenticated;

-- Confirm profiles trigger exists and update it to be more secure
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create profile if one doesn't already exist
  INSERT INTO public.profiles (user_id, email, contact_name, tenant_type)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    'external'  -- Default to external for security
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();