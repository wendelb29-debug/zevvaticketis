-- Revoke public/authenticated execute permission from the SECURITY DEFINER function
REVOKE EXECUTE ON FUNCTION public.transfer_attendance(uuid, uuid, uuid, text, text) FROM public, authenticated, anon;

-- Explicitly grant to authenticated only (or narrow it further if needed, but it already checks auth.uid())
GRANT EXECUTE ON FUNCTION public.transfer_attendance(uuid, uuid, uuid, text, text) TO authenticated;
