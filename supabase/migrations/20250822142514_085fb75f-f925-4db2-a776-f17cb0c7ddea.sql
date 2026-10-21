-- Fix security issues by recreating functions with proper search_path
-- First drop the trigger, then function, then recreate both

DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
DROP FUNCTION IF EXISTS public.update_services_updated_at();

CREATE OR REPLACE FUNCTION public.update_services_updated_at()
RETURNS TRIGGER 
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_services_updated_at();

-- Fix the handle_new_user function as well
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, contact_name)
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$;