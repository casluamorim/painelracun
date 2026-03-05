
-- 1. Create user_clients junction table
CREATE TABLE public.user_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, client_id)
);

-- 2. Enable RLS
ALTER TABLE public.user_clients ENABLE ROW LEVEL SECURITY;

-- 3. RLS policies
CREATE POLICY "Admins can manage user_clients"
  ON public.user_clients FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own client assignments"
  ON public.user_clients FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 4. Migrate existing data from profiles.client_id
INSERT INTO public.user_clients (user_id, client_id)
SELECT user_id, client_id FROM public.profiles
WHERE client_id IS NOT NULL
ON CONFLICT (user_id, client_id) DO NOTHING;

-- 5. Create security definer function for multi-client RLS
CREATE OR REPLACE FUNCTION public.user_has_client_access(_user_id uuid, _client_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_clients
    WHERE user_id = _user_id
      AND client_id = _client_id
  )
$$;

-- 6. Update RLS policies on campaigns to use multi-client
DROP POLICY IF EXISTS "Clients can view their own campaigns" ON public.campaigns;
CREATE POLICY "Clients can view their own campaigns"
  ON public.campaigns FOR SELECT
  TO authenticated
  USING (public.user_has_client_access(auth.uid(), client_id));

-- 7. Update RLS policies on daily_metrics
DROP POLICY IF EXISTS "Clients can view their own metrics" ON public.daily_metrics;
CREATE POLICY "Clients can view their own metrics"
  ON public.daily_metrics FOR SELECT
  TO authenticated
  USING (public.user_has_client_access(auth.uid(), client_id));

-- 8. Update RLS policies on platform_summary
DROP POLICY IF EXISTS "Clients can view their own platform summary" ON public.platform_summary;
CREATE POLICY "Clients can view their own platform summary"
  ON public.platform_summary FOR SELECT
  TO authenticated
  USING (public.user_has_client_access(auth.uid(), client_id));

-- 9. Update RLS policies on clients
DROP POLICY IF EXISTS "Clients can view their own client" ON public.clients;
CREATE POLICY "Clients can view their own client"
  ON public.clients FOR SELECT
  TO authenticated
  USING (public.user_has_client_access(auth.uid(), id));
