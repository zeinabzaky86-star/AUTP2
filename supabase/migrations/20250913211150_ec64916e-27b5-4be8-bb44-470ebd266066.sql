-- First add the missing updated_at column that the trigger expects
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

-- Update existing location column to be TEXT if it's not already
-- (checking if it exists in the schema, it should be there)

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
SET status = UPPER(COALESCE(status, 'ACTIVE'))
WHERE status IS NULL OR status != 'ACTIVE';

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