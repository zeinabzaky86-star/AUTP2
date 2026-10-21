-- Fix remaining security vulnerabilities (corrected column names)
-- 1. Secure services table - prevent competitors from seeing pricing
-- 2. Secure news_updates table - prevent draft content leaks

-- Fix services table RLS - currently publicly readable
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Drop any existing overly permissive policies
DROP POLICY IF EXISTS "Services are publicly viewable" ON public.services;
DROP POLICY IF EXISTS "Public can view services" ON public.services;

-- Allow authenticated users to view only published/available services
CREATE POLICY "Authenticated users can view available services" 
ON public.services 
FOR SELECT 
USING (
  auth.role() = 'authenticated' 
  AND status = 'available'
);

-- Allow service staff/admins to view all services
CREATE POLICY "Admins can view all services" 
ON public.services 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);

-- Admin/staff can manage services
CREATE POLICY "Admins can insert services" 
ON public.services 
FOR INSERT 
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can update services" 
ON public.services 
FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);

-- Fix news_updates table RLS - prevent draft content leaks
ALTER TABLE public.news_updates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that might be too permissive
DROP POLICY IF EXISTS "Anyone can view published news" ON public.news_updates;
DROP POLICY IF EXISTS "Authenticated users can view news" ON public.news_updates;

-- Public users (unauthenticated) can only view published news
CREATE POLICY "Public can view published news only" 
ON public.news_updates 
FOR SELECT 
USING (
  status = 'published' 
  AND published_date <= now()
);

-- Authenticated users can view published news
CREATE POLICY "Authenticated users can view published news" 
ON public.news_updates 
FOR SELECT 
USING (
  auth.role() = 'authenticated' 
  AND status = 'published' 
  AND published_date <= now()
);

-- Only admins can view drafts and manage news
CREATE POLICY "Admins can view all news including drafts" 
ON public.news_updates 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can insert news" 
ON public.news_updates 
FOR INSERT 
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can update news" 
ON public.news_updates 
FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can delete news" 
ON public.news_updates 
FOR DELETE 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);