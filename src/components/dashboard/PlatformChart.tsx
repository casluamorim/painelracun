import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatNumber, getPlatformName, Platform } from '@/lib/mockData';

type MetricKey = 'spend' | 'impressions' | 'clicks' | 'conversions' | 'leads';

interface PlatformData {
  platform: Platform;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  leads: number;
}

interface PlatformChartProps {
  data: PlatformData[];
  metric?: MetricKey;
  title?: string;
}

const platformColors: Record<string, string> = {
  meta: 'hsl(214, 100%, 45%)',
  google: 'hsl(45, 93%, 47%)',
  tiktok: 'hsl(180, 76%, 48%)',
};

const metricConfig: Record<MetricKey, { label: string; formatter: (v: number) => string }> = {
  spend: { label: 'Investimento', formatter: (v) => formatCurrency(v) },
  impressions: { label: 'Impressões', formatter: (v) => formatNumber(v) },
  clicks: { label: 'Cliques', formatter: (v) => formatNumber(v) },
  conversions: { label: 'Conversões', formatter: (v) => formatNumber(v) },
  leads: { label: 'Leads', formatter: (v) => formatNumber(v) },
};

export const PlatformChart: React.FC<PlatformChartProps> = ({
  data,
  metric: initialMetric = 'spend',
  title = 'Comparativo por Plataforma',
}) => {
  const [activeMetric, setActiveMetric] = useState<MetricKey>(initialMetric);
  const config = metricConfig[activeMetric];

  const chartData = data.map((item) => ({
    platform: getPlatformName(item.platform),
    value: item[activeMetric],
    color: platformColors[item.platform] || 'hsl(var(--primary))',
    rawPlatform: item.platform,
  }));

  const yFormatter = (value: number) => {
    if (activeMetric === 'spend') return `R$${(value / 1000).toFixed(0)}k`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return String(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-elevated">
          <p className="text-sm font-medium text-foreground">{d.platform}</p>
          <p className="text-sm text-muted-foreground">
            {config.label}:{' '}
            <span className="font-medium text-foreground">{config.formatter(d.value)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <Tabs value={activeMetric} onValueChange={(v) => setActiveMetric(v as MetricKey)}>
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="spend" className="text-xs">Invest.</TabsTrigger>
            <TabsTrigger value="impressions" className="text-xs">Impr.</TabsTrigger>
            <TabsTrigger value="clicks" className="text-xs">Cliques</TabsTrigger>
            <TabsTrigger value="conversions" className="text-xs">Conv.</TabsTrigger>
            <TabsTrigger value="leads" className="text-xs">Leads</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="platform"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 13, fontWeight: 500 }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={yFormatter}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={48}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {chartData.map((item) => (
          <div key={item.rawPlatform} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-sm text-muted-foreground">{item.platform}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
