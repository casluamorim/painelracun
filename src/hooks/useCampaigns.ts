import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useClientSelector } from '@/contexts/ClientContext';

export type Platform = 'meta' | 'google' | 'tiktok';
export type CampaignStatus = 'active' | 'paused' | 'completed';

export interface Campaign {
  id: string;
  client_id: string;
  platform: Platform;
  name: string;
  status: CampaignStatus;
  start_date: string;
  end_date: string | null;
  budget: number | null;
  created_at: string;
  updated_at: string;
  spend?: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  leads?: number;
  ctr?: number;
  cpc?: number;
  cpm?: number;
  cpa?: number;
}

export interface DailyMetric {
  id: string;
  campaign_id: string;
  client_id: string;
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  leads: number;
}

export interface PlatformSummary {
  platform: Platform;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  leads: number;
  revenue: number;
}

export interface PlatformROAS {
  platform: Platform;
  platformName: string;
  spend: number;
  revenue: number;
  roas: number;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

// Helper to apply client filter to a query
const applyClientFilter = <T extends { eq: (col: string, val: string) => T }>(
  query: T,
  clientId: string | null
): T => {
  if (clientId) {
    return query.eq('client_id', clientId);
  }
  return query;
};

// Fetch campaigns with aggregated metrics
export const useCampaigns = (dateRange?: DateRange) => {
  const { user } = useAuth();
  const { selectedClientId } = useClientSelector();

  return useQuery({
    queryKey: ['campaigns', dateRange, user?.id, selectedClientId],
    queryFn: async () => {
      let campaignsQuery = supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedClientId) {
        campaignsQuery = campaignsQuery.eq('client_id', selectedClientId);
      }

      const { data: campaigns, error: campaignsError } = await campaignsQuery;
      if (campaignsError) throw campaignsError;
      if (!campaigns || campaigns.length === 0) return [];

      let metricsQuery = supabase
        .from('daily_metrics')
        .select('*')
        .in('campaign_id', campaigns.map(c => c.id));

      if (dateRange) {
        metricsQuery = metricsQuery
          .gte('date', dateRange.startDate)
          .lte('date', dateRange.endDate);
      }

      const { data: metrics, error: metricsError } = await metricsQuery;
      if (metricsError) throw metricsError;

      return campaigns.map(campaign => {
        const campaignMetrics = metrics?.filter(m => m.campaign_id === campaign.id) || [];
        const spend = campaignMetrics.reduce((sum, m) => sum + Number(m.spend), 0);
        const impressions = campaignMetrics.reduce((sum, m) => sum + m.impressions, 0);
        const clicks = campaignMetrics.reduce((sum, m) => sum + m.clicks, 0);
        const conversions = campaignMetrics.reduce((sum, m) => sum + m.conversions, 0);
        const leads = campaignMetrics.reduce((sum, m) => sum + m.leads, 0);

        return {
          ...campaign,
          spend,
          impressions,
          clicks,
          conversions,
          leads,
          ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
          cpc: clicks > 0 ? spend / clicks : 0,
          cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
          cpa: conversions > 0 ? spend / conversions : 0,
        } as Campaign;
      });
    },
    enabled: !!user,
  });
};

// Fetch daily metrics for charts
export const useDailyMetrics = (dateRange?: DateRange) => {
  const { user } = useAuth();
  const { selectedClientId } = useClientSelector();

  return useQuery({
    queryKey: ['daily_metrics', dateRange, user?.id, selectedClientId],
    queryFn: async () => {
      let query = supabase
        .from('daily_metrics')
        .select('*')
        .order('date', { ascending: true });

      if (selectedClientId) {
        query = query.eq('client_id', selectedClientId);
      }

      if (dateRange) {
        query = query
          .gte('date', dateRange.startDate)
          .lte('date', dateRange.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      const aggregatedByDate = (data || []).reduce((acc, metric) => {
        const existing = acc.find(m => m.date === metric.date);
        if (existing) {
          existing.spend += Number(metric.spend);
          existing.impressions += metric.impressions;
          existing.clicks += metric.clicks;
          existing.conversions += metric.conversions;
        } else {
          acc.push({
            date: metric.date,
            spend: Number(metric.spend),
            impressions: metric.impressions,
            clicks: metric.clicks,
            conversions: metric.conversions,
          });
        }
        return acc;
      }, [] as { date: string; spend: number; impressions: number; clicks: number; conversions: number }[]);

      return aggregatedByDate;
    },
    enabled: !!user,
  });
};

// Fetch platform summary
export const usePlatformSummary = (dateRange?: DateRange) => {
  const { user } = useAuth();
  const { selectedClientId } = useClientSelector();

  return useQuery({
    queryKey: ['platform_summary', dateRange, user?.id, selectedClientId],
    queryFn: async () => {
      let campaignsQuery = supabase
        .from('campaigns')
        .select('id, platform');

      if (selectedClientId) {
        campaignsQuery = campaignsQuery.eq('client_id', selectedClientId);
      }

      const { data: campaigns, error: campaignsError } = await campaignsQuery;
      if (campaignsError) throw campaignsError;

      let metricsQuery = supabase.from('daily_metrics').select('*');

      if (selectedClientId) {
        metricsQuery = metricsQuery.eq('client_id', selectedClientId);
      }

      if (dateRange) {
        metricsQuery = metricsQuery
          .gte('date', dateRange.startDate)
          .lte('date', dateRange.endDate);
      }

      const { data: metrics, error: metricsError } = await metricsQuery;
      if (metricsError) throw metricsError;

      const campaignPlatformMap = new Map(
        (campaigns || []).map(c => [c.id, c.platform as Platform])
      );

      const platformMap = new Map<Platform, PlatformSummary>();

      (metrics || []).forEach(metric => {
        const platform = campaignPlatformMap.get(metric.campaign_id);
        if (!platform) return;

        const existing = platformMap.get(platform) || {
          platform, spend: 0, impressions: 0, clicks: 0, conversions: 0, leads: 0, revenue: 0,
        };

        existing.spend += Number(metric.spend);
        existing.impressions += metric.impressions;
        existing.clicks += metric.clicks;
        existing.conversions += metric.conversions;
        existing.leads += metric.leads;
        existing.revenue += Number(metric.revenue);

        platformMap.set(platform, existing);
      });

      return Array.from(platformMap.values());
    },
    enabled: !!user,
  });
};

// Fetch platform ROAS data
export const usePlatformROAS = (dateRange?: DateRange) => {
  const { user } = useAuth();
  const { selectedClientId } = useClientSelector();

  return useQuery({
    queryKey: ['platform_roas', dateRange, user?.id, selectedClientId],
    queryFn: async () => {
      let campaignsQuery = supabase
        .from('campaigns')
        .select('id, platform');

      if (selectedClientId) {
        campaignsQuery = campaignsQuery.eq('client_id', selectedClientId);
      }

      const { data: campaigns, error: campaignsError } = await campaignsQuery;
      if (campaignsError) throw campaignsError;

      let metricsQuery = supabase
        .from('daily_metrics')
        .select('campaign_id, spend, revenue');

      if (selectedClientId) {
        metricsQuery = metricsQuery.eq('client_id', selectedClientId);
      }

      if (dateRange) {
        metricsQuery = metricsQuery
          .gte('date', dateRange.startDate)
          .lte('date', dateRange.endDate);
      }

      const { data: metrics, error: metricsError } = await metricsQuery;
      if (metricsError) throw metricsError;

      const campaignPlatformMap = new Map(
        (campaigns || []).map(c => [c.id, c.platform as Platform])
      );

      const platformNames: Record<Platform, string> = {
        meta: 'Instagram/Meta',
        google: 'Google Ads',
        tiktok: 'TikTok Ads',
      };

      const platformData = new Map<Platform, { spend: number; revenue: number }>();

      (metrics || []).forEach(metric => {
        const platform = campaignPlatformMap.get(metric.campaign_id);
        if (!platform) return;

        const existing = platformData.get(platform) || { spend: 0, revenue: 0 };
        existing.spend += Number(metric.spend);
        existing.revenue += Number(metric.revenue);
        platformData.set(platform, existing);
      });

      return Array.from(platformData.entries()).map(([platform, data]) => ({
        platform,
        platformName: platformNames[platform],
        spend: data.spend,
        revenue: data.revenue,
        roas: data.spend > 0 ? data.revenue / data.spend : 0,
      }));
    },
    enabled: !!user,
  });
};

// Calculate totals from platform summary
export const calculateTotals = (platformSummary: PlatformSummary[]) => {
  const totalSpend = platformSummary.reduce((acc, p) => acc + p.spend, 0);
  const totalImpressions = platformSummary.reduce((acc, p) => acc + p.impressions, 0);
  const totalClicks = platformSummary.reduce((acc, p) => acc + p.clicks, 0);
  const totalConversions = platformSummary.reduce((acc, p) => acc + p.conversions, 0);
  const totalLeads = platformSummary.reduce((acc, p) => acc + p.leads, 0);
  const totalRevenue = platformSummary.reduce((acc, p) => acc + p.revenue, 0);

  return {
    spend: totalSpend,
    impressions: totalImpressions,
    clicks: totalClicks,
    conversions: totalConversions,
    leads: totalLeads,
    revenue: totalRevenue,
    ctr: totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00',
    cpc: totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : '0.00',
    cpm: totalImpressions > 0 ? ((totalSpend / totalImpressions) * 1000).toFixed(2) : '0.00',
    cpa: totalConversions > 0 ? (totalSpend / totalConversions).toFixed(2) : '0.00',
    cpl: totalLeads > 0 ? (totalSpend / totalLeads).toFixed(2) : 'N/A',
    roas: totalSpend > 0 ? totalRevenue / totalSpend : 0,
  };
};
