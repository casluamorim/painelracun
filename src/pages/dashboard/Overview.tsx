import React from 'react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { CampaignTable } from '@/components/dashboard/CampaignTable';
import { DailyMetricsChart } from '@/components/dashboard/DailyMetricsChart';
import { PlatformChart } from '@/components/dashboard/PlatformChart';
import { PeriodFilter } from '@/components/dashboard/PeriodFilter';
import { InsightsCard, defaultInsights } from '@/components/dashboard/InsightsCard';
import { QuickSummary } from '@/components/dashboard/QuickSummary';
import { PlatformROASCard } from '@/components/dashboard/PlatformROASCard';
import { formatCurrency, formatNumber } from '@/lib/mockData';
import {
  useCampaigns,
  useDailyMetrics,
  usePlatformSummary,
  usePlatformROAS,
  calculateTotals,
} from '@/hooks/useCampaigns';
import {
  DollarSign,
  Target,
  Eye,
  MousePointerClick,
  TrendingUp,
  Users,
  Percent,
  Coins,
  Loader2,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Overview: React.FC = () => {
  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns();
  const { data: dailyMetrics, isLoading: metricsLoading } = useDailyMetrics();
  const { data: platformSummary, isLoading: summaryLoading } = usePlatformSummary();
  const { data: platformROAS, isLoading: roasLoading } = usePlatformROAS();

  const isLoading = campaignsLoading || metricsLoading || summaryLoading || roasLoading;

  // Calculate totals from real data
  const totals = platformSummary ? calculateTotals(platformSummary) : null;
  const totalRevenue = platformROAS?.reduce((acc, p) => acc + p.revenue, 0) || 0;
  const overallRoas = totals && totals.spend > 0 ? totalRevenue / totals.spend : 0;

  // Transform campaigns for table
  const tableCampaigns = (campaigns || []).map(c => ({
    id: c.id,
    platform: c.platform,
    name: c.name,
    startDate: c.start_date,
    endDate: c.end_date || c.start_date,
    spend: c.spend || 0,
    impressions: c.impressions || 0,
    clicks: c.clicks || 0,
    ctr: c.ctr || 0,
    cpc: c.cpc || 0,
    cpm: c.cpm || 0,
    conversions: c.conversions,
    cpa: c.cpa,
    status: c.status === 'completed' ? 'paused' : c.status,
  }));

  // Transform platform summary for chart
  const chartData = (platformSummary || []).map(p => ({
    platform: p.platform,
    spend: p.spend,
    impressions: p.impressions,
    clicks: p.clicks,
    conversions: p.conversions,
    leads: p.leads,
  }));

  // Transform ROAS data for card
  const roasData = (platformROAS || []).map(p => ({
    platform: p.platform,
    platformName: p.platformName,
    spend: p.spend,
    revenue: p.revenue,
    roas: p.roas,
  }));

  // Check if we have any data
  const hasData = campaigns && campaigns.length > 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Visão Geral</h1>
            <p className="text-muted-foreground">
              Resumo do desempenho de todas as plataformas
            </p>
          </div>
          <PeriodFilter />
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Carregando dados...</span>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Visão Geral</h1>
            <p className="text-muted-foreground">
              Resumo do desempenho de todas as plataformas
            </p>
          </div>
          <PeriodFilter />
        </div>
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Nenhuma campanha encontrada
            </h2>
            <p className="text-muted-foreground mb-4">
              Ainda não há campanhas cadastradas para visualizar. Entre em contato com o administrador para adicionar suas campanhas.
            </p>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Quick Summary - Visão Resumida */}
      {totals && (
        <QuickSummary
          totalSpend={totals.spend}
          totalRevenue={totalRevenue}
          totalConversions={totals.conversions}
          overallRoas={overallRoas}
        />
      )}

      {/* ROAS por Plataforma */}
      {roasData.length > 0 && <PlatformROASCard data={roasData} />}

      {/* Primary Metrics */}
      {totals && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Investimento Total"
            value={formatCurrency(totals.spend)}
            trend={{ value: 0, label: 'período atual' }}
            icon={<DollarSign size={20} />}
            variant="primary"
          />
          <MetricCard
            title="Conversões"
            value={formatNumber(totals.conversions)}
            trend={{ value: 0, label: 'período atual' }}
            icon={<Target size={20} />}
          />
          <MetricCard
            title="Impressões"
            value={formatNumber(totals.impressions)}
            trend={{ value: 0, label: 'período atual' }}
            icon={<Eye size={20} />}
          />
          <MetricCard
            title="Cliques"
            value={formatNumber(totals.clicks)}
            trend={{ value: 0, label: 'período atual' }}
            icon={<MousePointerClick size={20} />}
          />
        </div>
      )}

      {/* Secondary Metrics */}
      {totals && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            title="CTR"
            value={totals.ctr + '%'}
            icon={<Percent size={18} />}
          />
          <MetricCard
            title="CPC"
            value={formatCurrency(Number(totals.cpc))}
            icon={<Coins size={18} />}
          />
          <MetricCard
            title="CPM"
            value={formatCurrency(Number(totals.cpm))}
            icon={<TrendingUp size={18} />}
          />
          <MetricCard
            title="Leads"
            value={formatNumber(totals.leads)}
            icon={<Users size={18} />}
          />
          <MetricCard
            title="CPA"
            value={formatCurrency(Number(totals.cpa))}
            icon={<Target size={18} />}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <DailyMetricsChart data={dailyMetrics || []} />
        <PlatformChart data={chartData} metric="spend" />
      </div>

      {/* Insights */}
      <InsightsCard insights={defaultInsights} />

      {/* Campaign Table */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Todas as Campanhas</h2>
        <CampaignTable campaigns={tableCampaigns} />
      </div>
    </div>
  );
};

export default Overview;
