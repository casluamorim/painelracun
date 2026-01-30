import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'meta' | 'google' | 'tiktok';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = 'default',
  className,
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp size={14} className="text-success" />;
    if (trend.value < 0) return <TrendingDown size={14} className="text-destructive" />;
    return <Minus size={14} className="text-muted-foreground" />;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.value > 0) return 'text-success';
    if (trend.value < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary text-primary-foreground';
      case 'meta':
        return 'bg-gradient-to-br from-[hsl(214,100%,45%)] to-[hsl(240,70%,55%)] text-white';
      case 'google':
        return 'bg-gradient-to-br from-[hsl(217,89%,61%)] to-[hsl(142,71%,45%)] text-white';
      case 'tiktok':
        return 'bg-gradient-to-br from-[hsl(180,76%,48%)] to-[hsl(330,81%,60%)] text-white';
      default:
        return 'bg-card';
    }
  };

  const isColoredVariant = variant !== 'default';

  return (
    <div
      className={cn(
        'card-metric animate-fade-in',
        getVariantStyles(),
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <span
          className={cn(
            'text-sm font-medium',
            isColoredVariant ? 'opacity-90' : 'text-muted-foreground'
          )}
        >
          {title}
        </span>
        {icon && (
          <div className={cn('opacity-80', isColoredVariant ? '' : 'text-muted-foreground')}>
            {icon}
          </div>
        )}
      </div>
      
      <div className={cn('text-2xl lg:text-3xl font-bold mb-1', isColoredVariant ? '' : 'text-foreground')}>
        {value}
      </div>
      
      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-2">
          {trend && (
            <div className={cn('flex items-center gap-1 text-xs font-medium', isColoredVariant ? 'opacity-90' : getTrendColor())}>
              {getTrendIcon()}
              <span>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
              <span className={cn('ml-1', isColoredVariant ? 'opacity-70' : 'text-muted-foreground')}>
                {trend.label}
              </span>
            </div>
          )}
          {subtitle && !trend && (
            <span className={cn('text-xs', isColoredVariant ? 'opacity-70' : 'text-muted-foreground')}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
