-- Add unique constraint for upsert to work on daily_metrics
ALTER TABLE public.daily_metrics ADD CONSTRAINT daily_metrics_campaign_date_unique UNIQUE (campaign_id, date);