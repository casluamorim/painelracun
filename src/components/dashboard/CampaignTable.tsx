import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Campaign, formatCurrency, formatNumber, getPlatformName } from '@/lib/mockData';
import { getPlatformIcon } from '@/components/icons/PlatformIcons';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CampaignTableProps {
  campaigns: Campaign[];
  showPlatform?: boolean;
  itemsPerPage?: number;
}

export const CampaignTable: React.FC<CampaignTableProps> = ({
  campaigns,
  showPlatform = true,
  itemsPerPage = 5,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(campaigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCampaigns = campaigns.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {showPlatform && <TableHead className="font-semibold">Plataforma</TableHead>}
              <TableHead className="font-semibold">Campanha</TableHead>
              <TableHead className="font-semibold text-right">Gasto</TableHead>
              <TableHead className="font-semibold text-right">Impressões</TableHead>
              <TableHead className="font-semibold text-right">Cliques</TableHead>
              <TableHead className="font-semibold text-right">CTR</TableHead>
              <TableHead className="font-semibold text-right">CPC</TableHead>
              <TableHead className="font-semibold text-right">Conversões</TableHead>
              <TableHead className="font-semibold text-right">CPA</TableHead>
              <TableHead className="font-semibold text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCampaigns.map((campaign) => (
              <TableRow key={campaign.id} className="hover:bg-muted/30 transition-colors">
                {showPlatform && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(campaign.platform)}
                      <span className="text-sm text-muted-foreground hidden md:inline">
                        {getPlatformName(campaign.platform)}
                      </span>
                    </div>
                  </TableCell>
                )}
                <TableCell>
                  <div className="max-w-[200px]">
                    <p className="font-medium text-foreground truncate">{campaign.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(campaign.startDate).toLocaleDateString('pt-BR')} - {new Date(campaign.endDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(campaign.spend)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatNumber(campaign.impressions)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatNumber(campaign.clicks)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {campaign.ctr.toFixed(2)}%
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatCurrency(campaign.cpc)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {campaign.conversions || '-'}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {campaign.cpa ? formatCurrency(campaign.cpa) : '-'}
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={cn(
                      campaign.status === 'active' ? 'status-active' : 'status-paused'
                    )}
                  >
                    {campaign.status === 'active' ? 'Ativo' : 'Pausado'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, campaigns.length)} de {campaigns.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
