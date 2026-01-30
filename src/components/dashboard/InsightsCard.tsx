import React from 'react';
import { Lightbulb, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Insight {
  type: 'positive' | 'negative' | 'neutral';
  text: string;
}

interface InsightsCardProps {
  insights: Insight[];
  title?: string;
}

export const InsightsCard: React.FC<InsightsCardProps> = ({
  insights,
  title = 'Resumo do Período',
}) => {
  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return <TrendingUp size={16} className="text-success" />;
      case 'negative':
        return <TrendingDown size={16} className="text-destructive" />;
      default:
        return <AlertCircle size={16} className="text-warning" />;
    }
  };

  const getBgColor = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return 'bg-success/10';
      case 'negative':
        return 'bg-destructive/10';
      default:
        return 'bg-warning/10';
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg',
              getBgColor(insight.type)
            )}
          >
            <div className="mt-0.5">{getIcon(insight.type)}</div>
            <p className="text-sm text-foreground leading-relaxed">{insight.text}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
        💡 As métricas exibidas dependem do que cada plataforma disponibiliza e do rastreamento configurado.
      </p>
    </div>
  );
};

// Default insights for demo
export const defaultInsights: Insight[] = [
  {
    type: 'positive',
    text: 'O CTR geral aumentou 12% em relação ao período anterior, indicando maior relevância dos anúncios.',
  },
  {
    type: 'negative',
    text: 'O CPC no Google Ads subiu 8%. Recomenda-se revisar os lances e a qualidade dos anúncios.',
  },
  {
    type: 'positive',
    text: 'TikTok Ads apresentou o menor CPL (R$ 31,03), sendo a plataforma mais eficiente para geração de leads.',
  },
];
