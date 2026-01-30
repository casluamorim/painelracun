import React from 'react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { CampaignTable } from '@/components/dashboard/CampaignTable';
import { SpendChart } from '@/components/dashboard/SpendChart';
import { PlatformChart } from '@/components/dashboard/PlatformChart';
import { PeriodFilter } from '@/components/dashboard/PeriodFilter';
import { InsightsCard, defaultInsights } from '@/components/dashboard/InsightsCard';
import {
  mockCampaigns,
  mockDailyMetrics,
  mockPreviousPeriodMetrics,
  mockPlatformSummary,
  getTotals,
  formatCurrency,
  formatNumber,
} from '@/lib/mockData';
import {
  DollarSign,
  Target,
  Eye,
  MousePointerClick,
  TrendingUp,
  Users,
  Percent,
  Coins,
} from 'lucide-react';

const Overview: React.FC = () => {
  const totals = getTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Visão Geral</h1>
          <p className="text-muted-foreground">
            Resumo do desempenho de todas as plataformas
          </p>
        </div>
        <PeriodFilter />
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Investimento Total"
          value={formatCurrency(totals.spend)}
          trend={{ value: 15.3, label: 'vs período anterior' }}
          icon={<DollarSign size={20} />}
          variant="primary"
        />
        <MetricCard
          title="Conversões"
          value={formatNumber(totals.conversions)}
          trend={{ value: 8.7, label: 'vs período anterior' }}
          icon={<Target size={20} />}
        />
        <MetricCard
          title="Impressões"
          value={formatNumber(totals.impressions)}
          trend={{ value: 22.1, label: 'vs período anterior' }}
          icon={<Eye size={20} />}
        />
        <MetricCard
          title="Cliques"
          value={formatNumber(totals.clicks)}
          trend={{ value: 12.5, label: 'vs período anterior' }}
          icon={<MousePointerClick size={20} />}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="CTR"
          value={totals.ctr + '%'}
          icon={<Percent size={18} />}
          trend={{ value: 5.2, label: '' }}
        />
        <MetricCard
          title="CPC"
          value={formatCurrency(Number(totals.cpc))}
          icon={<Coins size={18} />}
          trend={{ value: -3.1, label: '' }}
        />
        <MetricCard
          title="CPM"
          value={formatCurrency(Number(totals.cpm))}
          icon={<TrendingUp size={18} />}
          trend={{ value: 1.8, label: '' }}
        />
        <MetricCard
          title="Leads"
          value={formatNumber(totals.leads)}
          icon={<Users size={18} />}
          trend={{ value: 18.2, label: '' }}
        />
        <MetricCard
          title="CPA"
          value={formatCurrency(Number(totals.cpa))}
          icon={<Target size={18} />}
          trend={{ value: -2.4, label: '' }}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SpendChart
          currentData={mockDailyMetrics}
          previousData={mockPreviousPeriodMetrics}
        />
        <PlatformChart data={mockPlatformSummary} metric="spend" />
      </div>

      {/* Insights */}
      <InsightsCard insights={defaultInsights} />

      {/* Campaign Table */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Todas as Campanhas</h2>
        <CampaignTable campaigns={mockCampaigns} />
      </div>
    </div>
  );
};

export default Overview;
