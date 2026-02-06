import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  // Calculated fields from metrics
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

// Fetch campaigns with aggregated metrics
export const useCampaigns = (dateRange?: DateRange) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['campaigns', dateRange, user?.id],
    queryFn: async () => {
      // First get campaigns
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (campaignsError) throw campaignsError;
      if (!campaigns || campaigns.length === 0) return [];

      // Then get metrics for these campaigns
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

      // Aggregate metrics per campaign
      const campaignsWithMetrics = campaigns.map(campaign => {
        const campaignMetrics = metrics?.filter(m => m.campaign_id === campaign.id) || [];
        
        const spend = campaignMetrics.reduce((sum, m) => sum + Number(m.spend), 0);
        const impressions = campaignMetrics.reduce((sum, m) => sum + m.impressions, 0);
        const clicks = campaignMetrics.reduce((sum, m) => sum + m.clicks, 0);
        const conversions = campaignMetrics.reduce((sum, m) => sum + m.conversions, 0);
        const leads = campaignMetrics.reduce((sum, m) => sum + m.leads, 0);
        
        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
        const cpc = clicks > 0 ? spend / clicks : 0;
        const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
        const cpa = conversions > 0 ? spend / conversions : 0;

        return {
          ...campaign,
          spend,
          impressions,
          clicks,
          conversions,
          leads,
          ctr,
          cpc,
          cpm,
          cpa,
        } as Campaign;
      });

      return campaignsWithMetrics;
    },
    enabled: !!user,
  });
};

// Fetch daily metrics for charts
export const useDailyMetrics = (dateRange?: DateRange) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['daily_metrics', dateRange, user?.id],
    queryFn: async () => {
      let query = supabase
        .from('daily_metrics')
        .select('*')
        .order('date', { ascending: true });

      if (dateRange) {
        query = query
          .gte('date', dateRange.startDate)
          .lte('date', dateRange.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Aggregate by date
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
  
  return useQuery({
    queryKey: ['platform_summary', dateRange, user?.id],
    queryFn: async () => {
      // Get campaigns to know which platform each metric belongs to
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id, platform');

      if (campaignsError) throw campaignsError;

      let metricsQuery = supabase
        .from('daily_metrics')
        .select('*');

      if (dateRange) {
        metricsQuery = metricsQuery
          .gte('date', dateRange.startDate)
          .lte('date', dateRange.endDate);
      }

      const { data: metrics, error: metricsError } = await metricsQuery;
      if (metricsError) throw metricsError;

      // Create campaign platform map
      const campaignPlatformMap = new Map(
        (campaigns || []).map(c => [c.id, c.platform as Platform])
      );

      // Aggregate by platform
      const platformMap = new Map<Platform, PlatformSummary>();
      
      (metrics || []).forEach(metric => {
        const platform = campaignPlatformMap.get(metric.campaign_id);
        if (!platform) return;

        const existing = platformMap.get(platform) || {
          platform,
          spend: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          leads: 0,
          revenue: 0,
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
  
  return useQuery({
    queryKey: ['platform_roas', dateRange, user?.id],
    queryFn: async () => {
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id, platform');

      if (campaignsError) throw campaignsError;

      let metricsQuery = supabase
        .from('daily_metrics')
        .select('campaign_id, spend, revenue');

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

      const result: PlatformROAS[] = Array.from(platformData.entries()).map(([platform, data]) => ({
        platform,
        platformName: platformNames[platform],
        spend: data.spend,
        revenue: data.revenue,
        roas: data.spend > 0 ? data.revenue / data.spend : 0,
      }));

      return result;
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
