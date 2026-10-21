-- Enhance the existing services table with additional fields
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS service_name TEXT,
ADD COLUMN IF NOT EXISTS duration TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'available',
ADD COLUMN IF NOT EXISTS assigned_to TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS media_urls TEXT[],
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Update existing services to use service_name if name exists
UPDATE public.services SET service_name = name WHERE service_name IS NULL AND name IS NOT NULL;

-- Create activity log table for tracking changes
CREATE TABLE IF NOT EXISTS public.service_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'bulk_imported'
  admin_user_id UUID REFERENCES auth.users(id),
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on activity log
ALTER TABLE public.service_activity_log ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access to activity log
CREATE POLICY "Admin can view activity log" 
ON public.service_activity_log 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create policy for admin to insert activity log
CREATE POLICY "Admin can insert activity log" 
ON public.service_activity_log 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Add editor role to user_roles enum if it doesn't exist
DO $$ 
BEGIN
  -- Check if we need to update the role constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name LIKE '%user_roles_role_check%'
    AND check_clause LIKE '%editor%'
  ) THEN
    -- Drop existing constraint and add new one with editor role
    ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check 
    CHECK (role IN ('admin', 'editor'));
  END IF;
END $$;

-- Update services policies to allow editors to read
DROP POLICY IF EXISTS "Services are viewable by authenticated users" ON public.services;

CREATE POLICY "Services are viewable by authenticated users" 
ON public.services 
FOR SELECT 
USING (
  available = true OR 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
);

-- Allow admins to manage services
CREATE POLICY "Admins can manage services" 
ON public.services 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create updated_at trigger for services
CREATE OR REPLACE FUNCTION public.update_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_services_updated_at();

-- Create storage bucket for service media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'service-media', 
  'service-media', 
  true, 
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for service media
CREATE POLICY "Service media is publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'service-media');

CREATE POLICY "Admins can upload service media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'service-media' AND
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update service media" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'service-media' AND
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete service media" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'service-media' AND
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);