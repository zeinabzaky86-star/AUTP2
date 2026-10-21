-- Security Fix Migration: Implement secure admin management and fix RLS policies

-- 1. Create security definer functions for admin role checking
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.admin_count()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM user_roles
  WHERE role = 'admin';
$$;

-- 2. Fix user_roles RLS policies - remove existing ones and create secure ones
DROP POLICY IF EXISTS "Users can create their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;

-- Allow bootstrapping: first user can become admin when no admins exist
CREATE POLICY "Bootstrap admin creation"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  role = 'admin' 
  AND auth.uid() = user_id 
  AND public.admin_count() = 0
);

-- Only existing admins can create new admin roles
CREATE POLICY "Admins can create admin roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  role = 'admin' 
  AND public.is_admin()
);

-- Users can view their own role
CREATE POLICY "Users can view own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Only admins can update roles
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 3. Fix news_updates RLS policies - remove overly broad policy
DROP POLICY IF EXISTS "News updates are viewable by everyone when published" ON public.news_updates;

-- 4. Clean up conflicting RLS policies on notifications table
DROP POLICY IF EXISTS "No user deletes to notifications" ON public.notifications;
DROP POLICY IF EXISTS "No user updates to notifications" ON public.notifications;
DROP POLICY IF EXISTS "Only authenticated users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- System/admins can insert notifications
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- 5. Clean up conflicting RLS policies on profiles table
DROP POLICY IF EXISTS "Users can insert own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;