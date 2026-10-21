-- Create tenant profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  tenant_type TEXT DEFAULT 'external' CHECK (tenant_type IN ('tenant', 'au_affiliate', 'external')),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2),
  tenant_price DECIMAL(10,2),
  au_affiliate_price DECIMAL(10,2),
  external_price DECIMAL(10,2),
  lead_time TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_progress', 'completed', 'cancelled')),
  booking_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  quote_amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for services (public read)
CREATE POLICY "Services are viewable by authenticated users" 
ON public.services 
FOR SELECT 
TO authenticated
USING (available = true);

-- RLS Policies for bookings
CREATE POLICY "Users can view their own bookings" 
ON public.bookings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" 
ON public.bookings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample services data
INSERT INTO public.services (category, name, description, base_price, tenant_price, au_affiliate_price, external_price, lead_time) VALUES
('Scientific Excellence', 'Genomics Lab', 'Advanced DNA sequencing and analysis', 500.00, 300.00, 400.00, 500.00, '2-5 Days'),
('Scientific Excellence', 'Analytical Chemistry', 'Chemical composition analysis and testing', 300.00, 200.00, 250.00, 300.00, '1-3 Days'),
('Business Support', 'Market Research', 'Comprehensive market analysis and insights', 800.00, 600.00, 700.00, 800.00, '1-2 Weeks'),
('Legal & IP Services', 'Patent Filing', 'Professional patent application services', 1200.00, 800.00, 1000.00, 1200.00, '2-4 Weeks'),
('Creative & Design', 'Fab Lab Access', '3D printing and fabrication services', 100.00, 50.00, 75.00, 100.00, 'Same Day'),
('Education & Training', 'Technical Workshops', 'Specialized skill development workshops', 200.00, 100.00, 150.00, 200.00, '1 Week');

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
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

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();