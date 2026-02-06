-- Create enum for ad platforms
CREATE TYPE public.ad_platform AS ENUM ('meta', 'google', 'tiktok');

-- Create enum for campaign status
CREATE TYPE public.campaign_status AS ENUM ('active', 'paused', 'completed');

-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  platform ad_platform NOT NULL,
  name TEXT NOT NULL,
  status campaign_status NOT NULL DEFAULT 'active',
  start_date DATE NOT NULL,
  end_date DATE,
  budget DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_metrics table for campaign performance
CREATE TABLE public.daily_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  spend DECIMAL(12,2) NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  leads INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, date)
);

-- Create platform_summary table for aggregated platform data
CREATE TABLE public.platform_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  platform ad_platform NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_spend DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_impressions BIGINT NOT NULL DEFAULT 0,
  total_clicks INTEGER NOT NULL DEFAULT 0,
  total_conversions INTEGER NOT NULL DEFAULT 0,
  total_revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_leads INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, platform, period_start, period_end)
);

-- Enable RLS on all tables
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_summary ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaigns
CREATE POLICY "Admins can do everything on campaigns"
ON public.campaigns FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view their own campaigns"
ON public.campaigns FOR SELECT
USING (client_id = get_user_client_id(auth.uid()));

-- RLS Policies for daily_metrics
CREATE POLICY "Admins can do everything on daily_metrics"
ON public.daily_metrics FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view their own metrics"
ON public.daily_metrics FOR SELECT
USING (client_id = get_user_client_id(auth.uid()));

-- RLS Policies for platform_summary
CREATE POLICY "Admins can do everything on platform_summary"
ON public.platform_summary FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view their own platform summary"
ON public.platform_summary FOR SELECT
USING (client_id = get_user_client_id(auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_campaigns_client_id ON public.campaigns(client_id);
CREATE INDEX idx_campaigns_platform ON public.campaigns(platform);
CREATE INDEX idx_daily_metrics_campaign_id ON public.daily_metrics(campaign_id);
CREATE INDEX idx_daily_metrics_client_id ON public.daily_metrics(client_id);
CREATE INDEX idx_daily_metrics_date ON public.daily_metrics(date);
CREATE INDEX idx_platform_summary_client_id ON public.platform_summary(client_id);

-- Add triggers for updated_at
CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platform_summary_updated_at
BEFORE UPDATE ON public.platform_summary
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();