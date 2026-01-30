// Mock data for Portal de Resultados - Tráfego Pago

export type Platform = 'meta' | 'google' | 'tiktok';
export type CampaignStatus = 'active' | 'paused';

export interface Campaign {
  id: string;
  platform: Platform;
  name: string;
  startDate: string;
  endDate: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversions?: number;
  leads?: number;
  cpa?: number;
  cpl?: number;
  status: CampaignStatus;
}

export interface DailyMetric {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

export interface PlatformSummary {
  platform: Platform;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  leads: number;
}

// Mock campaigns data
export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    platform: 'meta',
    name: 'Campanha Verão 2024 - Conversão',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    spend: 12500.00,
    impressions: 850000,
    clicks: 25500,
    ctr: 3.0,
    cpc: 0.49,
    cpm: 14.71,
    conversions: 425,
    leads: 312,
    cpa: 29.41,
    cpl: 40.06,
    status: 'active',
  },
  {
    id: '2',
    platform: 'meta',
    name: 'Remarketing - Carrinho Abandonado',
    startDate: '2024-01-15',
    endDate: '2024-01-31',
    spend: 4200.00,
    impressions: 320000,
    clicks: 12800,
    ctr: 4.0,
    cpc: 0.33,
    cpm: 13.13,
    conversions: 180,
    leads: 95,
    cpa: 23.33,
    cpl: 44.21,
    status: 'active',
  },
  {
    id: '3',
    platform: 'google',
    name: 'Google Search - Palavras-chave',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    spend: 8900.00,
    impressions: 420000,
    clicks: 18900,
    ctr: 4.5,
    cpc: 0.47,
    cpm: 21.19,
    conversions: 520,
    cpa: 17.12,
    status: 'active',
  },
  {
    id: '4',
    platform: 'google',
    name: 'Display - Público Semelhante',
    startDate: '2024-01-10',
    endDate: '2024-01-31',
    spend: 3200.00,
    impressions: 580000,
    clicks: 8700,
    ctr: 1.5,
    cpc: 0.37,
    cpm: 5.52,
    conversions: 145,
    cpa: 22.07,
    status: 'paused',
  },
  {
    id: '5',
    platform: 'tiktok',
    name: 'TikTok Awareness - Gen Z',
    startDate: '2024-01-05',
    endDate: '2024-01-31',
    spend: 6800.00,
    impressions: 1200000,
    clicks: 42000,
    ctr: 3.5,
    cpc: 0.16,
    cpm: 5.67,
    conversions: 280,
    leads: 195,
    cpa: 24.29,
    cpl: 34.87,
    status: 'active',
  },
  {
    id: '6',
    platform: 'tiktok',
    name: 'Spark Ads - Influenciadores',
    startDate: '2024-01-12',
    endDate: '2024-01-31',
    spend: 4500.00,
    impressions: 890000,
    clicks: 31150,
    ctr: 3.5,
    cpc: 0.14,
    cpm: 5.06,
    conversions: 210,
    leads: 145,
    cpa: 21.43,
    cpl: 31.03,
    status: 'active',
  },
];

// Mock daily metrics for charts
export const mockDailyMetrics: DailyMetric[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2024, 0, i + 1);
  const baseSpend = 1200 + Math.random() * 800;
  const baseImpressions = 100000 + Math.random() * 50000;
  const baseClicks = 3000 + Math.random() * 2000;
  const baseConversions = 50 + Math.random() * 30;
  
  return {
    date: date.toISOString().split('T')[0],
    spend: Math.round(baseSpend * 100) / 100,
    impressions: Math.round(baseImpressions),
    clicks: Math.round(baseClicks),
    conversions: Math.round(baseConversions),
  };
});

// Previous period for comparison
export const mockPreviousPeriodMetrics: DailyMetric[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2023, 11, i + 2);
  const baseSpend = 1000 + Math.random() * 600;
  const baseImpressions = 80000 + Math.random() * 40000;
  const baseClicks = 2500 + Math.random() * 1500;
  const baseConversions = 40 + Math.random() * 25;
  
  return {
    date: date.toISOString().split('T')[0],
    spend: Math.round(baseSpend * 100) / 100,
    impressions: Math.round(baseImpressions),
    clicks: Math.round(baseClicks),
    conversions: Math.round(baseConversions),
  };
});

// Platform summary
export const mockPlatformSummary: PlatformSummary[] = [
  {
    platform: 'meta',
    spend: 16700,
    impressions: 1170000,
    clicks: 38300,
    conversions: 605,
    leads: 407,
  },
  {
    platform: 'google',
    spend: 12100,
    impressions: 1000000,
    clicks: 27600,
    conversions: 665,
    leads: 0,
  },
  {
    platform: 'tiktok',
    spend: 11300,
    impressions: 2090000,
    clicks: 73150,
    conversions: 490,
    leads: 340,
  },
];

// Calculate totals
export const getTotals = () => {
  const totalSpend = mockPlatformSummary.reduce((acc, p) => acc + p.spend, 0);
  const totalImpressions = mockPlatformSummary.reduce((acc, p) => acc + p.impressions, 0);
  const totalClicks = mockPlatformSummary.reduce((acc, p) => acc + p.clicks, 0);
  const totalConversions = mockPlatformSummary.reduce((acc, p) => acc + p.conversions, 0);
  const totalLeads = mockPlatformSummary.reduce((acc, p) => acc + p.leads, 0);
  
  return {
    spend: totalSpend,
    impressions: totalImpressions,
    clicks: totalClicks,
    conversions: totalConversions,
    leads: totalLeads,
    ctr: ((totalClicks / totalImpressions) * 100).toFixed(2),
    cpc: (totalSpend / totalClicks).toFixed(2),
    cpm: ((totalSpend / totalImpressions) * 1000).toFixed(2),
    cpa: (totalSpend / totalConversions).toFixed(2),
    cpl: totalLeads > 0 ? (totalSpend / totalLeads).toFixed(2) : 'N/A',
  };
};

// Format currency
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Format number with abbreviation
export const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  return value.toLocaleString('pt-BR');
};

// Format percentage
export const formatPercentage = (value: number): string => {
  return value.toFixed(2) + '%';
};

// Get platform name
export const getPlatformName = (platform: Platform): string => {
  const names: Record<Platform, string> = {
    meta: 'Instagram/Meta',
    google: 'Google Ads',
    tiktok: 'TikTok Ads',
  };
  return names[platform];
};

// Last update timestamp
export const getLastUpdate = (): string => {
  const now = new Date();
  return now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};
