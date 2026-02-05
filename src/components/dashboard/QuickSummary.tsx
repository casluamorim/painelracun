import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, DollarSign, Target, ArrowUpRight } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/mockData';

interface QuickSummaryProps {
  totalSpend: number;
  totalRevenue: number;
  totalConversions: number;
  overallRoas: number;
  period?: string;
}

export const QuickSummary: React.FC<QuickSummaryProps> = ({
  totalSpend,
  totalRevenue,
  totalConversions,
  overallRoas,
  period = 'Últimos 30 dias',
}) => {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full translate-y-24 -translate-x-24" />
      
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Resumo de Performance</h3>
            <p className="text-sm text-muted-foreground">{period}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30">
            <TrendingUp size={14} className="text-green-600" />
            <span className="text-sm font-medium text-green-600">+18.5%</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Investido */}
          <div className="bg-background/60 backdrop-blur-sm rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <DollarSign size={16} className="text-blue-600" />
              </div>
              <span className="text-xs text-muted-foreground">Investido</span>
            </div>
            <p className="text-xl font-bold text-foreground">{formatCurrency(totalSpend)}</p>
          </div>
          
          {/* Retorno Total */}
          <div className="bg-background/60 backdrop-blur-sm rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <ArrowUpRight size={16} className="text-green-600" />
              </div>
              <span className="text-xs text-muted-foreground">Retorno</span>
            </div>
            <p className="text-xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
          </div>
          
          {/* ROAS Geral */}
          <div className="bg-background/60 backdrop-blur-sm rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <TrendingUp size={16} className="text-purple-600" />
              </div>
              <span className="text-xs text-muted-foreground">ROAS Geral</span>
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-xl font-bold text-foreground">{overallRoas.toFixed(1)}x</p>
              <span className="text-xs text-muted-foreground">retorno</span>
            </div>
          </div>
          
          {/* Conversões */}
          <div className="bg-background/60 backdrop-blur-sm rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Target size={16} className="text-orange-600" />
              </div>
              <span className="text-xs text-muted-foreground">Conversões</span>
            </div>
            <p className="text-xl font-bold text-foreground">{formatNumber(totalConversions)}</p>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-background/40 rounded-lg border border-border/30">
          <p className="text-sm text-center text-muted-foreground">
            Para cada <span className="font-semibold text-foreground">R$ 1,00</span> investido, você recebeu{' '}
            <span className="font-semibold text-green-600">R$ {overallRoas.toFixed(2)}</span> de volta
          </p>
        </div>
      </div>
    </Card>
  );
};
