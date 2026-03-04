import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MetaIcon } from '@/components/icons/PlatformIcons';
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { format, subDays } from 'date-fns';

interface MetaSyncCardProps {
  clientId: string;
}

export const MetaSyncCard: React.FC<MetaSyncCardProps> = ({ clientId }) => {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    campaigns_synced?: number;
    metrics_synced?: number;
    error?: string;
  } | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');
  const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');

  const [dateFrom, setDateFrom] = useState(thirtyDaysAgo);
  const [dateTo, setDateTo] = useState(today);

  const handleSync = async () => {
    setIsSyncing(true);
    setLastResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('sync-meta-ads', {
        body: {
          client_id: clientId,
          date_from: dateFrom,
          date_to: dateTo,
        },
      });

      if (error) throw error;

      setLastResult(data);

      if (data.success) {
        toast({
          title: 'Sincronização concluída!',
          description: `${data.campaigns_synced} campanhas e ${data.metrics_synced} métricas sincronizadas.`,
        });
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao sincronizar';
      setLastResult({ success: false, error: message });
      toast({
        title: 'Erro na sincronização',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-[hsl(214,100%,45%)]/10 flex items-center justify-center">
          <MetaIcon size={22} className="text-[hsl(214,100%,45%)]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Meta Ads</h3>
          <p className="text-sm text-muted-foreground">Sincronizar campanhas e métricas do Meta</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-1.5">
          <Label htmlFor="dateFrom" className="text-sm">Data início</Label>
          <Input
            id="dateFrom"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            disabled={isSyncing}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dateTo" className="text-sm">Data fim</Label>
          <Input
            id="dateTo"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            disabled={isSyncing}
          />
        </div>
      </div>

      <Button onClick={handleSync} disabled={isSyncing} className="w-full">
        {isSyncing ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" />
            Sincronizando...
          </>
        ) : (
          <>
            <RefreshCw size={16} className="mr-2" />
            Sincronizar Meta Ads
          </>
        )}
      </Button>

      {lastResult && (
        <div className={`mt-4 p-3 rounded-lg text-sm flex items-start gap-2 ${
          lastResult.success 
            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
            : 'bg-destructive/10 text-destructive border border-destructive/20'
        }`}>
          {lastResult.success ? (
            <>
              <CheckCircle size={16} className="mt-0.5 shrink-0" />
              <span>{lastResult.campaigns_synced} campanhas e {lastResult.metrics_synced} métricas sincronizadas com sucesso.</span>
            </>
          ) : (
            <>
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{lastResult.error}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
