import React from 'react';
import { Card } from '@/components/ui/card';
import { MetaIcon, GoogleIcon, TikTokIcon } from '@/components/icons/PlatformIcons';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/mockData';

interface PlatformROASData {
  platform: 'meta' | 'google' | 'tiktok';
  spend: number;
  revenue: number;
  roas: number;
  previousRoas?: number;
}

interface PlatformROASCardProps {
  data: PlatformROASData[];
}

const platformConfig = {
  meta: {
    name: 'Instagram/Meta',
    icon: MetaIcon,
    gradient: 'from-pink-500 to-purple-600',
    bgLight: 'bg-gradient-to-br from-pink-50 to-purple-50',
    iconBg: 'bg-gradient-to-br from-pink-500 to-purple-600',
  },
  google: {
    name: 'Google Ads',
    icon: GoogleIcon,
    gradient: 'from-blue-500 to-green-500',
    bgLight: 'bg-gradient-to-br from-blue-50 to-green-50',
    iconBg: 'bg-gradient-to-br from-blue-500 to-yellow-500',
  },
  tiktok: {
    name: 'TikTok Ads',
    icon: TikTokIcon,
    gradient: 'from-cyan-400 to-pink-500',
    bgLight: 'bg-gradient-to-br from-cyan-50 to-pink-50',
    iconBg: 'bg-gradient-to-br from-black to-gray-800',
  },
};

export const PlatformROASCard: React.FC<PlatformROASCardProps> = ({ data }) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Retorno por Plataforma</h3>
          <p className="text-sm text-muted-foreground">Para cada R$ 1 investido</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map((item) => {
          const config = platformConfig[item.platform];
          const Icon = config.icon;
          const roasChange = item.previousRoas 
            ? ((item.roas - item.previousRoas) / item.previousRoas) * 100 
            : 0;
          const isPositive = roasChange >= 0;
          
          return (
            <div
              key={item.platform}
              className={`relative overflow-hidden rounded-xl p-5 ${config.bgLight} border border-border/50`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${config.iconBg} flex items-center justify-center shadow-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
                {item.previousRoas && (
                  <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                    {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {Math.abs(roasChange).toFixed(1)}%
                  </div>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-1">{config.name}</p>
              
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-3xl font-bold text-foreground">{item.roas.toFixed(1)}x</span>
                <span className="text-sm text-muted-foreground">ROAS</span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div>
                  <span className="block text-foreground font-medium">{formatCurrency(item.spend)}</span>
                  <span>Investido</span>
                </div>
                <div className="text-right">
                  <span className="block text-green-600 font-medium">{formatCurrency(item.revenue)}</span>
                  <span>Retorno</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// Mock ROAS data - será substituído por dados reais
export const mockPlatformROAS: PlatformROASData[] = [
  {
    platform: 'meta',
    spend: 16700,
    revenue: 66800,
    roas: 4.0,
    previousRoas: 3.6,
  },
  {
    platform: 'google',
    spend: 12100,
    revenue: 54450,
    roas: 4.5,
    previousRoas: 4.2,
  },
  {
    platform: 'tiktok',
    spend: 11300,
    revenue: 39550,
    roas: 3.5,
    previousRoas: 2.9,
  },
];
