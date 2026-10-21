-- Grant SELECT permission on public_services view to anon and authenticated roles
GRANT SELECT ON public.public_services TO anon;
GRANT SELECT ON public.public_services TO authenticated;

-- Also ensure the view has security invoker set (not definer) so it respects caller permissions
-- But since we want public access, we should use security definer with proper grants
-- The view already exists, so we just need the grants