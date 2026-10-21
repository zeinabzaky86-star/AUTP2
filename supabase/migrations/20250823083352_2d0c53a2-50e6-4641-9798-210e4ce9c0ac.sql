-- Drop the overly permissive "System can insert notifications" policy
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;