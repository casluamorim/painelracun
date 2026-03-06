
CREATE OR REPLACE FUNCTION public.auto_assign_client_to_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Auto-assign new clients to all admin users
  INSERT INTO public.user_clients (user_id, client_id)
  SELECT ur.user_id, NEW.id
  FROM public.user_roles ur
  WHERE ur.role = 'admin'
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_client_created_assign_admins
  AFTER INSERT ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_client_to_admin();
