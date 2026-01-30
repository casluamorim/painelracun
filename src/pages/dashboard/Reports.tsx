import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PeriodFilter } from '@/components/dashboard/PeriodFilter';
import {
  getTotals,
  formatCurrency,
  formatNumber,
  mockCampaigns,
  getPlatformName,
} from '@/lib/mockData';
import {
  FileText,
  Download,
  FileSpreadsheet,
  Mail,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Reports: React.FC = () => {
  const { toast } = useToast();
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingCsv, setLoadingCsv] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);

  const totals = getTotals();

  const handleExportPdf = async () => {
    setLoadingPdf(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoadingPdf(false);
    toast({
      title: 'Relatório PDF gerado!',
      description: 'O download do arquivo será iniciado em instantes.',
    });
  };

  const handleExportCsv = async () => {
    setLoadingCsv(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoadingCsv(false);
    toast({
      title: 'Relatório CSV gerado!',
      description: 'O download do arquivo será iniciado em instantes.',
    });
  };

  const handleSendEmail = async () => {
    setLoadingEmail(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoadingEmail(false);
    toast({
      title: 'Relatório enviado!',
      description: 'O resumo foi enviado para seu e-mail cadastrado.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">
            Exporte e compartilhe seus relatórios de desempenho
          </p>
        </div>
        <PeriodFilter />
      </div>

      {/* Export Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <button
          onClick={handleExportPdf}
          disabled={loadingPdf}
          className="bg-card border border-border rounded-xl p-6 text-left hover:shadow-elevated transition-all duration-200 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
            {loadingPdf ? (
              <Loader2 size={24} className="text-destructive animate-spin" />
            ) : (
              <FileText size={24} className="text-destructive" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Exportar PDF</h3>
          <p className="text-sm text-muted-foreground">
            Relatório completo com gráficos e análises
          </p>
        </button>

        <button
          onClick={handleExportCsv}
          disabled={loadingCsv}
          className="bg-card border border-border rounded-xl p-6 text-left hover:shadow-elevated transition-all duration-200 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mb-4">
            {loadingCsv ? (
              <Loader2 size={24} className="text-success animate-spin" />
            ) : (
              <FileSpreadsheet size={24} className="text-success" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Exportar CSV</h3>
          <p className="text-sm text-muted-foreground">
            Dados brutos para análise em planilhas
          </p>
        </button>

        <button
          onClick={handleSendEmail}
          disabled={loadingEmail}
          className="bg-card border border-border rounded-xl p-6 text-left hover:shadow-elevated transition-all duration-200 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            {loadingEmail ? (
              <Loader2 size={24} className="text-primary animate-spin" />
            ) : (
              <Mail size={24} className="text-primary" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Enviar por E-mail</h3>
          <p className="text-sm text-muted-foreground">
            Receba o resumo no seu e-mail
          </p>
        </button>
      </div>

      {/* Report Preview */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Prévia do Relatório</h2>
          <p className="text-sm text-muted-foreground">
            Visualize o conteúdo que será exportado
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Report Header */}
          <div className="text-center pb-6 border-b border-border">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Relatório de Desempenho
            </h3>
            <p className="text-muted-foreground">Janeiro 2024</p>
            <p className="text-sm text-muted-foreground mt-1">
              Cliente: Empresa ABC Ltda
            </p>
          </div>

          {/* Summary */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">Resumo Executivo</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Investimento Total</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(totals.spend)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Conversões</p>
                <p className="text-xl font-bold text-foreground">{formatNumber(totals.conversions)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Leads</p>
                <p className="text-xl font-bold text-foreground">{formatNumber(totals.leads)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">CPA Médio</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(Number(totals.cpa))}</p>
              </div>
            </div>
          </div>

          {/* Campaigns Summary */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">Campanhas Ativas</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-medium text-muted-foreground">Campanha</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Plataforma</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Gasto</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Conversões</th>
                  </tr>
                </thead>
                <tbody>
                  {mockCampaigns.slice(0, 5).map((campaign) => (
                    <tr key={campaign.id} className="border-b border-border/50">
                      <td className="py-2 text-foreground">{campaign.name}</td>
                      <td className="py-2 text-muted-foreground">{getPlatformName(campaign.platform)}</td>
                      <td className="py-2 text-right text-foreground">{formatCurrency(campaign.spend)}</td>
                      <td className="py-2 text-right text-foreground">{campaign.conversions || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Observations */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">Observações</h4>
            <div className="bg-muted/50 rounded-lg p-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-success mt-0.5 flex-shrink-0" />
                  CTR geral de {totals.ctr}%, acima da média do mercado.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-success mt-0.5 flex-shrink-0" />
                  TikTok Ads apresentou o menor CPL, ideal para geração de leads.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-success mt-0.5 flex-shrink-0" />
                  Google Ads manteve alta taxa de conversão em campanhas de busca.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
