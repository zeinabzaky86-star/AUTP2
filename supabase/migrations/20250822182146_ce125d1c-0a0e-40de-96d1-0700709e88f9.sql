-- Fix security issues by updating functions to have proper search_path

-- Update the update_services_updated_at function
CREATE OR REPLACE FUNCTION public.update_services_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$function$;

-- Update the update_resources_updated_at function
CREATE OR REPLACE FUNCTION public.update_resources_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add missing RLS policies for Service Entry table
CREATE POLICY "Services Entry are viewable by authenticated users"
ON public."Services Entry"
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create policy for admins to manage Service Entry
CREATE POLICY "Admins can manage Services Entry"
ON public."Services Entry"
FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));