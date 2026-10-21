-- Add the missing updated_at column that the trigger expects
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add missing fields to services table to match PRD requirements  
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS one_liner TEXT,
ADD COLUMN IF NOT EXISTS provider TEXT,
ADD COLUMN IF NOT EXISTS contact JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS price_hint JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS requirements TEXT,
ADD COLUMN IF NOT EXISTS links JSONB DEFAULT '{}';

-- Update existing fields to match PRD expectations
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
SET status = UPPER(COALESCE(status, 'ACTIVE'))
WHERE status IS NULL OR status != 'ACTIVE';

-- Add sample data for testing (using ON CONFLICT to avoid duplicates)
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
)
ON CONFLICT (service_name) DO UPDATE SET
  one_liner = EXCLUDED.one_liner,
  contact = EXCLUDED.contact,
  price_hint = EXCLUDED.price_hint,
  status = EXCLUDED.status;