-- Add missing fields to services table to match PRD requirements
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS one_liner TEXT,
ADD COLUMN IF NOT EXISTS provider TEXT,
ADD COLUMN IF NOT EXISTS contact JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS price_hint JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS requirements TEXT,
ADD COLUMN IF NOT EXISTS links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS location TEXT;

-- Update existing fields to match PRD expectations
-- Ensure availability_status values match PRD: "Available", "By appointment", "Temporarily unavailable"
UPDATE public.services 
SET availability_status = CASE 
  WHEN availability_status = 'available' THEN 'Available'
  WHEN availability_status = 'by_appointment' THEN 'By appointment'
  WHEN availability_status = 'unavailable' THEN 'Temporarily unavailable'
  ELSE 'Available'
END
WHERE availability_status IS NOT NULL;

-- Ensure status values are uppercase for consistency
UPDATE public.services 
SET status = UPPER(status)
WHERE status IS NOT NULL;

-- Create index for better search performance
CREATE INDEX IF NOT EXISTS idx_services_search 
ON public.services USING GIN (
  to_tsvector('english', COALESCE(service_name, '') || ' ' || COALESCE(one_liner, '') || ' ' || COALESCE(description, ''))
);

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_services_category 
ON public.services USING GIN (category);

-- Create index for tags filtering  
CREATE INDEX IF NOT EXISTS idx_services_tags 
ON public.services USING GIN (tags);

-- Add RLS policy for public read access to ACTIVE services
CREATE POLICY "Public can view active services" 
ON public.services 
FOR SELECT 
USING (status = 'ACTIVE');

-- Sample data to match PRD requirements (for testing)
INSERT INTO public.services (
  service_name, 
  one_liner, 
  category, 
  provider, 
  contact, 
  availability_status, 
  lead_time, 
  price_hint, 
  status,
  description,
  tags,
  links
) VALUES 
(
  'Sanger Sequencing',
  'High-quality DNA sequencing for research and diagnostics',
  ARRAY['Scientific', 'Genomics'],
  'Genomics Lab',
  '{"booking_url": "https://booking.autp.edu.eg/sanger", "email": "genomics@autp.edu.eg", "phone": "+20-3-xxx-xxxx"}',
  'Available',
  '2-3 business days',
  '{"mode": "from", "amount": 150, "unit": "per sample", "currency": "EGP"}',
  'ACTIVE',
  'State-of-the-art capillary electrophoresis DNA sequencing service for research applications',
  ARRAY['DNA', 'sequencing', 'research', 'genomics'],
  '{"images": ["https://example.com/sanger-lab.jpg"], "docs": [{"label": "Sample Prep Guide", "url": "https://docs.autp.edu.eg/sanger-prep"}]}'
),
(
  '3D Printing Services', 
  'Rapid prototyping and small-scale manufacturing',
  ARRAY['Facilities', 'Manufacturing'],
  'Innovation Lab',
  '{"email": "fabrication@autp.edu.eg", "phone": "+20-3-yyy-yyyy"}',
  'By appointment',
  '1-2 weeks',
  '{"mode": "quote"}',
  'ACTIVE',
  'Professional 3D printing services using various materials including PLA, ABS, and specialized composites',
  ARRAY['3D printing', 'prototyping', 'manufacturing'],
  '{"images": ["https://example.com/3d-printer.jpg"]}'
) 
ON CONFLICT (id) DO NOTHING;