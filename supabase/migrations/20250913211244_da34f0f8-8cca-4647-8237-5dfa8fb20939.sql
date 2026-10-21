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

-- Update existing availability_status values to match PRD format
UPDATE public.services 
SET availability_status = CASE 
  WHEN availability_status = 'available' THEN 'Available'
  WHEN availability_status = 'by_appointment' THEN 'By appointment'  
  WHEN availability_status = 'unavailable' THEN 'Temporarily unavailable'
  ELSE COALESCE(availability_status, 'Available')
END;

-- Ensure status values are uppercase for consistency  
UPDATE public.services 
SET status = UPPER(COALESCE(status, 'ACTIVE'));