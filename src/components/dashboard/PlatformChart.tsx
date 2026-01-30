import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { PlatformSummary, formatCurrency, formatNumber, getPlatformName } from '@/lib/mockData';

interface PlatformChartProps {
  data: PlatformSummary[];
  metric?: 'spend' | 'conversions' | 'clicks';
  title?: string;
}

const platformColors: Record<string, string> = {
  meta: 'hsl(214, 100%, 45%)',
  google: 'hsl(217, 89%, 61%)',
  tiktok: 'hsl(180, 76%, 48%)',
};

export const PlatformChart: React.FC<PlatformChartProps> = ({
  data,
  metric = 'spend',
  title = 'Resultados por Plataforma',
}) => {
  const chartData = data.map((item) => ({
    platform: getPlatformName(item.platform),
    value: item[metric],
    color: platformColors[item.platform],
    rawPlatform: item.platform,
  }));

  const formatValue = (value: number) => {
    if (metric === 'spend') return formatCurrency(value);
    return formatNumber(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-elevated">
          <p className="text-sm font-medium text-foreground">{data.platform}</p>
          <p className="text-sm text-muted-foreground">
            {metric === 'spend' ? 'Investimento' : metric === 'conversions' ? 'Conversões' : 'Cliques'}:{' '}
            <span className="font-medium text-foreground">{formatValue(data.value)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">{title}</h3>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
            <XAxis
              type="number"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => metric === 'spend' ? `R$${(value / 1000).toFixed(0)}k` : formatNumber(value)}
            />
            <YAxis
              type="category"
              dataKey="platform"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
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
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-muted-foreground">{item.platform}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
