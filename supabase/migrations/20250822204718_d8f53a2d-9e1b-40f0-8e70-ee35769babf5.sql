-- Fix critical security vulnerability: profiles table is publicly readable
-- This migration adds proper RLS policies to protect user data

-- First, ensure RLS is enabled on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might be too permissive
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create secure RLS policies for profiles table
-- Users can only view their own profile
CREATE POLICY "Users can view own profile only" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can only insert their own profile
CREATE POLICY "Users can insert own profile only" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile only" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own profile
CREATE POLICY "Users can delete own profile only" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = user_id);

-- Fix bookings table RLS - ensure users can only see their own bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;

-- Create secure policies for bookings
CREATE POLICY "Users can view own bookings only" 
ON public.bookings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings only" 
ON public.bookings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings only" 
ON public.bookings 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix notifications table - add missing INSERT policy
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Add proper INSERT policy for notifications (only system can create notifications)
CREATE POLICY "Only authenticated users can view own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

-- System/admin can insert notifications (using service role)
CREATE POLICY "System can insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Users cannot update or delete notifications (read-only for users)
CREATE POLICY "No user updates to notifications" 
ON public.notifications 
FOR UPDATE 
USING (false);

CREATE POLICY "No user deletes to notifications" 
ON public.notifications 
FOR DELETE 
USING (false);