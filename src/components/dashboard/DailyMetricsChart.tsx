import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatNumber } from '@/lib/mockData';

type MetricKey = 'spend' | 'impressions' | 'clicks' | 'conversions';

interface DailyData {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

interface DailyMetricsChartProps {
  data: DailyData[];
}

const metricConfig: Record<MetricKey, { label: string; color: string; formatter: (v: number) => string }> = {
  spend: { label: 'Investimento', color: 'hsl(var(--primary))', formatter: (v) => formatCurrency(v) },
  impressions: { label: 'Impressões', color: 'hsl(210, 80%, 55%)', formatter: (v) => formatNumber(v) },
  clicks: { label: 'Cliques', color: 'hsl(150, 60%, 45%)', formatter: (v) => formatNumber(v) },
  conversions: { label: 'Conversões', color: 'hsl(35, 90%, 55%)', formatter: (v) => formatNumber(v) },
};

export const DailyMetricsChart: React.FC<DailyMetricsChartProps> = ({ data }) => {
  const [activeMetric, setActiveMetric] = useState<MetricKey>('spend');
  const config = metricConfig[activeMetric];

  const chartData = data.map((item) => ({
    ...item,
    label: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-elevated">
          <p className="text-sm font-medium text-foreground mb-1">{label}</p>
          <p className="text-sm font-semibold" style={{ color: config.color }}>
            {config.label}: {config.formatter(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const yFormatter = (value: number) => {
    if (activeMetric === 'spend') return `R$${(value / 1000).toFixed(1)}k`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return String(value);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-foreground">Evolução Diária</h3>
        <Tabs value={activeMetric} onValueChange={(v) => setActiveMetric(v as MetricKey)}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="spend" className="text-xs">Invest.</TabsTrigger>
            <TabsTrigger value="impressions" className="text-xs">Impr.</TabsTrigger>
            <TabsTrigger value="clicks" className="text-xs">Cliques</TabsTrigger>
            <TabsTrigger value="conversions" className="text-xs">Conv.</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id={`gradient-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={config.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="label"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={yFormatter}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={activeMetric}
              stroke={config.color}
              strokeWidth={2}
              fill={`url(#gradient-${activeMetric})`}
              activeDot={{ r: 6, fill: config.color }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
