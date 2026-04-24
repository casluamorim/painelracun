import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, AlertCircle, Clock, RefreshCw, History, Zap, User, ShieldOff } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

interface SyncLog {
  id: string;
  client_id: string | null;
  platform: 'meta' | 'google' | 'tiktok';
  sync_type: string;
  status: string;
  period_start: string | null;
  period_end: string | null;
  campaigns_synced: number | null;
  metrics_synced: number | null;
  error_message: string | null;
  duration_ms: number | null;
  created_at: string;
  client_name?: string;
}

interface SyncLogsCardProps {
  clientId?: string;
  limit?: number;
}

export const SyncLogsCard: React.FC<SyncLogsCardProps> = ({ clientId, limit = 10 }) => {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('sync_logs')
      .select('*, clients(name)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, error } = await query;
    if (!error && data) {
      setLogs(
        data.map((row: any) => ({
          ...row,
          client_name: row.clients?.name,
        }))
      );
    }
    setLoading(false);
  }, [clientId, limit]);

  useEffect(() => {
    fetchLogs();

    // Realtime subscription for new logs
    const channel = supabase
      .channel('sync_logs_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sync_logs' },
        () => fetchLogs()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLogs]);

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <History size={22} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Histórico de Sincronizações</h3>
            <p className="text-sm text-muted-foreground">Últimas {limit} execuções</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchLogs} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </Button>
      </div>

      {loading && logs.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">Carregando...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          Nenhuma sincronização registrada ainda.
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const isSuccess = log.status === 'success';
            const isSkipped = log.status === 'skipped';
            const isAuto = log.sync_type === 'auto';
            return (
              <div
                key={log.id}
                className={`p-3 rounded-lg border text-sm ${
                  isSuccess
                    ? 'bg-green-500/5 border-green-500/20'
                    : isSkipped
                    ? 'bg-amber-500/5 border-amber-500/30'
                    : 'bg-destructive/5 border-destructive/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    {isSuccess ? (
                      <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                    ) : isSkipped ? (
                      <ShieldOff size={16} className="text-amber-500 mt-0.5 shrink-0" />
                    ) : (
                      <AlertCircle size={16} className="text-destructive mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground capitalize">
                          {log.platform}
                        </span>
                        {log.client_name && (
                          <span className="text-xs text-muted-foreground">
                            • {log.client_name}
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${
                            isAuto
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {isAuto ? <Zap size={10} /> : <User size={10} />}
                          {isAuto ? 'Auto' : 'Manual'}
                        </span>
                        {isSkipped && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            Pulada
                          </span>
                        )}
                      </div>
                      {isSuccess ? (
                        <p className="text-xs text-muted-foreground mt-1">
                          {log.campaigns_synced} campanhas • {log.metrics_synced} métricas
                          {log.period_start && log.period_end && (
                            <> • {log.period_start} → {log.period_end}</>
                          )}
                        </p>
                      ) : isSkipped ? (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 break-words">
                          {log.error_message || 'Sincronização bloqueada por token inválido.'}
                        </p>
                      ) : (
                        <p className="text-xs text-destructive mt-1 break-words">
                          {log.error_message || 'Erro desconhecido'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                      <Clock size={11} />
                      {format(new Date(log.created_at), "dd/MM HH:mm", { locale: ptBR })}
                    </div>
                    {log.duration_ms != null && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {(log.duration_ms / 1000).toFixed(1)}s
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};