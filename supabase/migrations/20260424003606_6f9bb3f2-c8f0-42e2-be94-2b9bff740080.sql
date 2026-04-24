-- Create sync_logs table to track synchronization history
CREATE TABLE public.sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  platform public.ad_platform NOT NULL,
  sync_type TEXT NOT NULL DEFAULT 'manual', -- 'manual' or 'auto'
  status TEXT NOT NULL, -- 'success', 'error', 'partial'
  period_start DATE,
  period_end DATE,
  campaigns_synced INTEGER DEFAULT 0,
  metrics_synced INTEGER DEFAULT 0,
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for efficient queries
CREATE INDEX idx_sync_logs_client_id ON public.sync_logs(client_id);
CREATE INDEX idx_sync_logs_created_at ON public.sync_logs(created_at DESC);
CREATE INDEX idx_sync_logs_platform ON public.sync_logs(platform);

-- Enable RLS
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Admins can manage everything
CREATE POLICY "Admins can do everything on sync_logs"
ON public.sync_logs
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Clients can view their own logs
CREATE POLICY "Clients can view their own sync_logs"
ON public.sync_logs
FOR SELECT
TO authenticated
USING (client_id IS NULL OR public.user_has_client_access(auth.uid(), client_id));