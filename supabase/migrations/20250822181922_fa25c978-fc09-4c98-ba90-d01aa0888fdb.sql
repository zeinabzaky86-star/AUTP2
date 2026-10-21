-- Enhance bookings table for comprehensive booking system
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS scheduled_time time,
ADD COLUMN IF NOT EXISTS duration_hours integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS equipment_needed text[],
ADD COLUMN IF NOT EXISTS requirements text,
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS confirmation_number text UNIQUE DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS cancellation_reason text,
ADD COLUMN IF NOT EXISTS rating integer CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS feedback text,
ADD COLUMN IF NOT EXISTS assigned_staff text,
ADD COLUMN IF NOT EXISTS resource_ids text[],
ADD COLUMN IF NOT EXISTS recurring_pattern text,
ADD COLUMN IF NOT EXISTS recurring_until date;

-- Create index for better performance on scheduled dates
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_date_time ON public.bookings(scheduled_date, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_bookings_confirmation ON public.bookings(confirmation_number);
CREATE INDEX IF NOT EXISTS idx_bookings_status_date ON public.bookings(status, scheduled_date);

-- Create resources table for equipment and facility booking
CREATE TABLE IF NOT EXISTS public.resources (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL, -- 'equipment', 'facility', 'room'
  description text,
  location text,
  capacity integer,
  hourly_rate numeric,
  available boolean DEFAULT true,
  specifications jsonb,
  image_url text,
  booking_rules jsonb, -- rules like max duration, advance booking required
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on resources table
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Create policy for resources - viewable by authenticated users
CREATE POLICY "Resources are viewable by authenticated users"
ON public.resources
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create policy for admins to manage resources
CREATE POLICY "Admins can manage resources"
ON public.resources
FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create booking_resources junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.booking_resources (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(booking_id, resource_id)
);

-- Enable RLS on booking_resources table
ALTER TABLE public.booking_resources ENABLE ROW LEVEL SECURITY;

-- Create policies for booking_resources
CREATE POLICY "Users can view their own booking resources"
ON public.booking_resources
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM bookings 
  WHERE bookings.id = booking_resources.booking_id 
  AND bookings.user_id = auth.uid()
));

CREATE POLICY "Users can manage their own booking resources"
ON public.booking_resources
FOR ALL
USING (EXISTS (
  SELECT 1 FROM bookings 
  WHERE bookings.id = booking_resources.booking_id 
  AND bookings.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM bookings 
  WHERE bookings.id = booking_resources.booking_id 
  AND bookings.user_id = auth.uid()
));

-- Create notifications table for booking updates
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
  read boolean DEFAULT false,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (user_id = auth.uid());

-- Insert some sample resources
INSERT INTO public.resources (name, type, description, location, capacity, hourly_rate, specifications, booking_rules) VALUES
('3D Printer - Ultimaker S3', 'equipment', 'Professional 3D printer for prototyping and manufacturing', 'Fab Lab - Floor 2', 1, 50.00, 
 '{"print_volume": "230 x 190 x 200 mm", "materials": ["PLA", "ABS", "PETG"], "resolution": "0.1mm"}',
 '{"max_duration_hours": 24, "advance_booking_hours": 4, "training_required": true}'),

('Microscopy Lab', 'facility', 'Advanced microscopy facility with electron and optical microscopes', 'Research Wing - Floor 3', 8, 150.00,
 '{"equipment": ["SEM", "TEM", "Confocal", "Fluorescence"], "capabilities": ["High-resolution imaging", "Sample preparation"]}',
 '{"max_duration_hours": 8, "advance_booking_hours": 48, "certification_required": true}'),

('Conference Room A', 'room', 'Modern conference room with presentation equipment', 'Main Building - Floor 1', 12, 25.00,
 '{"amenities": ["Projector", "Video conferencing", "Whiteboard", "WiFi"], "size": "25 sqm"}',
 '{"max_duration_hours": 8, "advance_booking_hours": 2}'),

('Spectrophotometer UV-Vis', 'equipment', 'High-precision UV-Visible spectrophotometer for chemical analysis', 'Chemistry Lab - Floor 2', 1, 75.00,
 '{"wavelength_range": "190-1100 nm", "accuracy": "±0.3 nm", "applications": ["Quantitative analysis", "Kinetics", "Spectrum scanning"]}',
 '{"max_duration_hours": 6, "advance_booking_hours": 8, "training_required": true}'),

('Innovation Workshop', 'facility', 'Open workshop space with various tools and equipment', 'Fab Lab - Floor 1', 20, 30.00,
 '{"tools": ["Laser cutter", "CNC machine", "Hand tools", "Workbenches"], "area": "150 sqm"}',
 '{"max_duration_hours": 12, "advance_booking_hours": 4}')

ON CONFLICT DO NOTHING;

-- Add trigger for updating timestamps on resources
CREATE OR REPLACE FUNCTION public.update_resources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_resources_updated_at();