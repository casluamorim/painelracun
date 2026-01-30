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
import { MetaIcon } from '@/components/icons/PlatformIcons';
import {
  DollarSign,
  Target,
  Eye,
  MousePointerClick,
  Percent,
  Coins,
  Users,
} from 'lucide-react';

const MetaAds: React.FC = () => {
  const platform: Platform = 'meta';
  const campaigns = mockCampaigns.filter((c) => c.platform === platform);
  
  // Calculate platform-specific totals
  const totals = campaigns.reduce(
    (acc, c) => ({
      spend: acc.spend + c.spend,
      impressions: acc.impressions + c.impressions,
      clicks: acc.clicks + c.clicks,
      conversions: acc.conversions + (c.conversions || 0),
      leads: acc.leads + (c.leads || 0),
    }),
    { spend: 0, impressions: 0, clicks: 0, conversions: 0, leads: 0 }
  );

  const ctr = ((totals.clicks / totals.impressions) * 100).toFixed(2);
  const cpc = (totals.spend / totals.clicks).toFixed(2);
  const cpm = ((totals.spend / totals.impressions) * 1000).toFixed(2);
  const cpa = totals.conversions > 0 ? (totals.spend / totals.conversions).toFixed(2) : 'N/A';
  const cpl = totals.leads > 0 ? (totals.spend / totals.leads).toFixed(2) : 'N/A';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[hsl(214,100%,45%)]/10 flex items-center justify-center">
            <MetaIcon size={28} className="text-[hsl(214,100%,45%)]" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Instagram/Meta</h1>
            <p className="text-muted-foreground">Desempenho das campanhas no Meta Ads</p>
          </div>
        </div>
        <PeriodFilter />
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Investimento"
          value={formatCurrency(totals.spend)}
          trend={{ value: 12.5, label: 'vs período anterior' }}
          icon={<DollarSign size={20} />}
          variant="meta"
        />
        <MetricCard
          title="Conversões"
          value={formatNumber(totals.conversions)}
          trend={{ value: 9.3, label: 'vs período anterior' }}
          icon={<Target size={20} />}
        />
        <MetricCard
          title="Impressões"
          value={formatNumber(totals.impressions)}
          trend={{ value: 18.7, label: 'vs período anterior' }}
          icon={<Eye size={20} />}
        />
        <MetricCard
          title="Cliques"
          value={formatNumber(totals.clicks)}
          trend={{ value: 14.2, label: 'vs período anterior' }}
          icon={<MousePointerClick size={20} />}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
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
          title="Leads"
          value={formatNumber(totals.leads)}
          icon={<Users size={18} />}
        />
        <MetricCard
          title={totals.leads > 0 ? 'CPL' : 'CPA'}
          value={totals.leads > 0 ? formatCurrency(Number(cpl)) : (cpa !== 'N/A' ? formatCurrency(Number(cpa)) : 'N/A')}
          icon={<Target size={18} />}
        />
      </div>

      {/* Chart */}
      <SpendChart
        currentData={mockDailyMetrics}
        previousData={mockPreviousPeriodMetrics}
        title="Investimento Diário - Meta Ads"
      />

      {/* Campaign Table */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Campanhas Meta Ads</h2>
        <CampaignTable campaigns={campaigns} showPlatform={false} />
      </div>
    </div>
  );
};

export default MetaAds;
