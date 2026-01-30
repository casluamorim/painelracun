import React from 'react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { CampaignTable } from '@/components/dashboard/CampaignTable';
import { SpendChart } from '@/components/dashboard/SpendChart';
import { PeriodFilter } from '@/components/dashboard/PeriodFilter';
import {
  mockCampaigns,
  mockDailyMetrics,
  mockPreviousPeriodMetrics,
  formatCurrency,
  formatNumber,
  Platform,
} from '@/lib/mockData';
import { GoogleIcon } from '@/components/icons/PlatformIcons';
import {
  DollarSign,
  Target,
  Eye,
  MousePointerClick,
  Percent,
  Coins,
} from 'lucide-react';

const GoogleAds: React.FC = () => {
  const platform: Platform = 'google';
  const campaigns = mockCampaigns.filter((c) => c.platform === platform);
  
  // Calculate platform-specific totals
  const totals = campaigns.reduce(
    (acc, c) => ({
      spend: acc.spend + c.spend,
      impressions: acc.impressions + c.impressions,
      clicks: acc.clicks + c.clicks,
      conversions: acc.conversions + (c.conversions || 0),
    }),
    { spend: 0, impressions: 0, clicks: 0, conversions: 0 }
  );

  const ctr = ((totals.clicks / totals.impressions) * 100).toFixed(2);
  const cpc = (totals.spend / totals.clicks).toFixed(2);
  const cpm = ((totals.spend / totals.impressions) * 1000).toFixed(2);
  const cpa = totals.conversions > 0 ? (totals.spend / totals.conversions).toFixed(2) : 'N/A';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[hsl(217,89%,61%)]/10 flex items-center justify-center">
            <GoogleIcon size={28} />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Google Ads</h1>
            <p className="text-muted-foreground">Desempenho das campanhas no Google Ads</p>
          </div>
        </div>
        <PeriodFilter />
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Investimento"
          value={formatCurrency(totals.spend)}
          trend={{ value: 8.2, label: 'vs período anterior' }}
          icon={<DollarSign size={20} />}
          variant="google"
        />
        <MetricCard
          title="Conversões"
          value={formatNumber(totals.conversions)}
          trend={{ value: 15.6, label: 'vs período anterior' }}
          icon={<Target size={20} />}
        />
        <MetricCard
          title="Impressões"
          value={formatNumber(totals.impressions)}
          trend={{ value: 11.3, label: 'vs período anterior' }}
          icon={<Eye size={20} />}
        />
        <MetricCard
          title="Cliques"
          value={formatNumber(totals.clicks)}
          trend={{ value: 9.8, label: 'vs período anterior' }}
          icon={<MousePointerClick size={20} />}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="CTR"
          value={ctr + '%'}
          icon={<Percent size={18} />}
        />
        <MetricCard
          title="CPC"
          value={formatCurrency(Number(cpc))}
          icon={<Coins size={18} />}
        />
        <MetricCard
          title="CPM"
          value={formatCurrency(Number(cpm))}
          icon={<Eye size={18} />}
        />
        <MetricCard
          title="CPA"
          value={cpa !== 'N/A' ? formatCurrency(Number(cpa)) : 'N/A'}
          icon={<Target size={18} />}
        />
      </div>

      {/* Chart */}
      <SpendChart
        currentData={mockDailyMetrics}
        previousData={mockPreviousPeriodMetrics}
        title="Investimento Diário - Google Ads"
      />

      {/* Campaign Table */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Campanhas Google Ads</h2>
        <CampaignTable campaigns={campaigns} showPlatform={false} />
      </div>
    </div>
  );
};

export default GoogleAds;
