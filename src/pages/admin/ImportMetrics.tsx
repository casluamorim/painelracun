import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileSpreadsheet, Loader2, AlertCircle, CheckCircle2, Download, Info } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, formatNumber } from '@/lib/mockData';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Campaign {
  id: string;
  name: string;
  client_id: string;
  platform: string;
  clients?: { name: string };
}

interface ParsedMetric {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  leads: number;
  isValid: boolean;
  errors: string[];
}

const ImportMetrics: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [parsedData, setParsedData] = useState<ParsedMetric[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: campaigns } = useQuery({
    queryKey: ['admin-campaigns-import'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name, client_id, platform, clients(name)')
        .order('name');
      if (error) throw error;
      return data as Campaign[];
    },
  });

  const importMutation = useMutation({
    mutationFn: async (metrics: ParsedMetric[]) => {
      const campaign = campaigns?.find((c) => c.id === selectedCampaign);
      if (!campaign) throw new Error('Campanha não encontrada');

      const validMetrics = metrics.filter((m) => m.isValid);
      
      const records = validMetrics.map((m) => ({
        campaign_id: selectedCampaign,
        client_id: campaign.client_id,
        date: m.date,
        spend: m.spend,
        impressions: m.impressions,
        clicks: m.clicks,
        conversions: m.conversions,
        revenue: m.revenue,
        leads: m.leads,
      }));

      // Upsert to handle duplicates
      const { error } = await supabase
        .from('daily_metrics')
        .upsert(records, { onConflict: 'campaign_id,date' });
      
      if (error) throw error;
      return validMetrics.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['daily_metrics'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success(`${count} registros importados com sucesso!`);
      setParsedData([]);
      setSelectedCampaign('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: (error) => {
      toast.error('Erro ao importar: ' + error.message);
    },
  });

  const parseCSV = (content: string): ParsedMetric[] => {
    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];

    // Parse header
    const header = lines[0].toLowerCase().split(/[,;\t]/).map((h) => h.trim());
    
    // Find column indices
    const dateIndex = header.findIndex((h) => h.includes('data') || h.includes('date'));
    const spendIndex = header.findIndex((h) => h.includes('gasto') || h.includes('spend') || h.includes('custo') || h.includes('cost'));
    const impressionsIndex = header.findIndex((h) => h.includes('impress'));
    const clicksIndex = header.findIndex((h) => h.includes('clique') || h.includes('click'));
    const conversionsIndex = header.findIndex((h) => h.includes('convers'));
    const revenueIndex = header.findIndex((h) => h.includes('receita') || h.includes('revenue') || h.includes('faturamento'));
    const leadsIndex = header.findIndex((h) => h.includes('lead'));

    const metrics: ParsedMetric[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(/[,;\t]/).map((v) => v.trim());
      const errors: string[] = [];

      // Parse date
      let date = '';
      if (dateIndex >= 0 && values[dateIndex]) {
        const dateValue = values[dateIndex];
        // Try different date formats
        if (dateValue.includes('/')) {
          const parts = dateValue.split('/');
          if (parts.length === 3) {
            // DD/MM/YYYY or MM/DD/YYYY
            const day = parseInt(parts[0]);
            const month = parseInt(parts[1]);
            const year = parseInt(parts[2]);
            if (day > 12) {
              // DD/MM/YYYY
              date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            } else {
              // Could be either, assume DD/MM/YYYY for pt-BR
              date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            }
          }
        } else if (dateValue.includes('-')) {
          date = dateValue;
        }
      }

      if (!date) {
        errors.push('Data inválida');
      }

      const parseNumber = (value: string | undefined): number => {
        if (!value) return 0;
        // Remove currency symbols and convert comma to dot
        const cleaned = value.replace(/[R$\s]/g, '').replace(',', '.');
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
      };

      const spend = spendIndex >= 0 ? parseNumber(values[spendIndex]) : 0;
      const impressions = impressionsIndex >= 0 ? Math.round(parseNumber(values[impressionsIndex])) : 0;
      const clicks = clicksIndex >= 0 ? Math.round(parseNumber(values[clicksIndex])) : 0;
      const conversions = conversionsIndex >= 0 ? Math.round(parseNumber(values[conversionsIndex])) : 0;
      const revenue = revenueIndex >= 0 ? parseNumber(values[revenueIndex]) : 0;
      const leads = leadsIndex >= 0 ? Math.round(parseNumber(values[leadsIndex])) : 0;

      metrics.push({
        date,
        spend,
        impressions,
        clicks,
        conversions,
        revenue,
        leads,
        isValid: errors.length === 0 && date !== '',
        errors,
      });
    }

    return metrics;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const content = await file.text();
      const parsed = parseCSV(content);
      setParsedData(parsed);
      
      const validCount = parsed.filter((p) => p.isValid).length;
      const invalidCount = parsed.filter((p) => !p.isValid).length;
      
      if (invalidCount > 0) {
        toast.warning(`${validCount} registros válidos, ${invalidCount} com erros`);
      } else {
        toast.success(`${validCount} registros prontos para importar`);
      }
    } catch (error) {
      toast.error('Erro ao processar arquivo');
    }
    setIsProcessing(false);
  };

  const handleImport = () => {
    if (!selectedCampaign) {
      toast.error('Selecione uma campanha');
      return;
    }
    if (parsedData.length === 0) {
      toast.error('Nenhum dado para importar');
      return;
    }
    importMutation.mutate(parsedData);
  };

  const downloadTemplate = () => {
    const template = `data,gasto,impressoes,cliques,conversoes,receita,leads
01/01/2024,1500.00,50000,1500,45,6000.00,30
02/01/2024,1200.00,42000,1200,38,4800.00,25`;
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template_metricas.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const validCount = parsedData.filter((p) => p.isValid).length;
  const invalidCount = parsedData.filter((p) => !p.isValid).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Importar Métricas</h1>
        <p className="text-muted-foreground">Importe métricas diárias via arquivo CSV</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload de Arquivo
            </CardTitle>
            <CardDescription>
              Selecione a campanha e faça upload do arquivo CSV com as métricas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Campanha *</Label>
              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma campanha" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns?.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.clients?.name} - {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Arquivo CSV</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <FileSpreadsheet className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Clique para selecionar ou arraste o arquivo CSV
                  </p>
                </label>
              </div>
            </div>

            <Button variant="outline" onClick={downloadTemplate} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Baixar Template CSV
            </Button>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Instruções
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Formato do CSV</AlertTitle>
              <AlertDescription>
                O arquivo deve conter as seguintes colunas (separadas por vírgula, ponto-e-vírgula ou tab):
              </AlertDescription>
            </Alert>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li><strong>data:</strong> Data no formato DD/MM/AAAA ou AAAA-MM-DD</li>
              <li><strong>gasto/spend:</strong> Valor investido</li>
              <li><strong>impressoes:</strong> Número de impressões</li>
              <li><strong>cliques:</strong> Número de cliques</li>
              <li><strong>conversoes:</strong> Número de conversões</li>
              <li><strong>receita/revenue:</strong> Receita gerada</li>
              <li><strong>leads:</strong> Número de leads (opcional)</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Valores monetários podem usar vírgula ou ponto como separador decimal.
              Registros duplicados (mesma campanha e data) serão atualizados.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Preview Table */}
      {parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Prévia dos Dados</CardTitle>
                <CardDescription>
                  {validCount} registros válidos
                  {invalidCount > 0 && `, ${invalidCount} com erros`}
                </CardDescription>
              </div>
              <Button
                onClick={handleImport}
                disabled={importMutation.isPending || validCount === 0}
              >
                {importMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Importar {validCount} Registros
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Gasto</TableHead>
                    <TableHead className="text-right">Impressões</TableHead>
                    <TableHead className="text-right">Cliques</TableHead>
                    <TableHead className="text-right">Conversões</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                    <TableHead className="text-right">Leads</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 20).map((metric, index) => (
                    <TableRow key={index} className={!metric.isValid ? 'bg-destructive/10' : ''}>
                      <TableCell>
                        {metric.isValid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                      </TableCell>
                      <TableCell>{metric.date || '-'}</TableCell>
                      <TableCell className="text-right">{formatCurrency(metric.spend)}</TableCell>
                      <TableCell className="text-right">{formatNumber(metric.impressions)}</TableCell>
                      <TableCell className="text-right">{formatNumber(metric.clicks)}</TableCell>
                      <TableCell className="text-right">{metric.conversions}</TableCell>
                      <TableCell className="text-right">{formatCurrency(metric.revenue)}</TableCell>
                      <TableCell className="text-right">{metric.leads}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {parsedData.length > 20 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Mostrando 20 de {parsedData.length} registros
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImportMetrics;
