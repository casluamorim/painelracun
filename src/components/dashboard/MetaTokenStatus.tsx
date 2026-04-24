import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ValidationResult {
  valid: boolean;
  error?: string;
  error_code?: number;
  account_id?: string;
  account_name?: string;
  account_status?: number;
  expires_at?: number | null;
  scopes?: string[];
}

export const MetaTokenStatus: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  const validate = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-meta-token', {
        body: {},
      });
      if (error) {
        setResult({ valid: false, error: error.message || 'Falha ao validar token' });
      } else {
        setResult(data as ValidationResult);
      }
      setCheckedAt(new Date());
    } catch (e) {
      setResult({
        valid: false,
        error: e instanceof Error ? e.message : 'Erro ao validar token',
      });
      setCheckedAt(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    validate();
  }, [validate]);

  const expiresLabel = (() => {
    if (!result?.expires_at) return null;
    if (result.expires_at === 0) return 'Não expira (long-lived)';
    const date = new Date(result.expires_at * 1000);
    const days = Math.ceil((date.getTime() - Date.now()) / 86400000);
    return `${format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} (em ${days} dias)`;
  })();

  const isExpiringSoon =
    result?.valid &&
    result.expires_at &&
    result.expires_at > 0 &&
    result.expires_at * 1000 - Date.now() < 7 * 86400000;

  // Loading state
  if (loading && !result) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
        <Loader2 size={18} className="animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Validando token do Meta...</span>
      </div>
    );
  }

  // Invalid token
  if (result && !result.valid) {
    return (
      <div className="bg-destructive/5 border border-destructive/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h4 className="font-semibold text-destructive">Token do Meta inválido</h4>
              <Button variant="ghost" size="sm" onClick={validate} disabled={loading}>
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                <span className="ml-1.5">Revalidar</span>
              </Button>
            </div>
            <p className="text-sm text-foreground mt-1">{result.error}</p>
            <div className="mt-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Como resolver:</p>
              <ol className="list-decimal list-inside space-y-0.5 ml-1">
                <li>
                  Acesse o{' '}
                  <a
                    href="https://developers.facebook.com/tools/explorer/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    Graph API Explorer
                  </a>
                </li>
                <li>Selecione seu App e gere um token com permissões <code className="px-1 rounded bg-muted">ads_read</code>, <code className="px-1 rounded bg-muted">ads_management</code></li>
                <li>Copie o token completo (começa com <code className="px-1 rounded bg-muted">EAA...</code>)</li>
                <li>Atualize o segredo <code className="px-1 rounded bg-muted">META_ACCESS_TOKEN</code> nas configurações do projeto</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Valid token (with optional expiring-soon warning)
  if (result?.valid) {
    const warnColor = isExpiringSoon ? 'amber' : 'green';
    const bgClass = isExpiringSoon
      ? 'bg-amber-500/5 border-amber-500/30'
      : 'bg-green-500/5 border-green-500/30';
    const iconBgClass = isExpiringSoon ? 'bg-amber-500/10' : 'bg-green-500/10';
    const iconColorClass = isExpiringSoon ? 'text-amber-500' : 'text-green-500';
    const titleColorClass = isExpiringSoon ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400';

    return (
      <div className={`border rounded-xl p-4 ${bgClass}`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBgClass}`}>
            {isExpiringSoon ? (
              <AlertTriangle size={20} className={iconColorClass} />
            ) : (
              <ShieldCheck size={20} className={iconColorClass} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h4 className={`font-semibold ${titleColorClass}`}>
                {isExpiringSoon ? 'Token expira em breve' : 'Token do Meta válido'}
              </h4>
              <Button variant="ghost" size="sm" onClick={validate} disabled={loading}>
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                <span className="ml-1.5">Revalidar</span>
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-1.5 space-y-0.5">
              {result.account_name && (
                <p>
                  <span className="text-foreground font-medium">Conta:</span> {result.account_name} ({result.account_id})
                </p>
              )}
              {expiresLabel && (
                <p>
                  <span className="text-foreground font-medium">Expira:</span> {expiresLabel}
                </p>
              )}
              {checkedAt && (
                <p className="text-[11px] opacity-70">
                  Verificado em {format(checkedAt, "dd/MM HH:mm:ss", { locale: ptBR })}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};