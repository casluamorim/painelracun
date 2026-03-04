import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MetaSyncCard } from '@/components/dashboard/MetaSyncCard';
import { Plug } from 'lucide-react';

const Integrations: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Integrações</h1>
        <p className="text-muted-foreground">
          Conecte e sincronize dados das plataformas de anúncios
        </p>
      </div>

      {user?.clientId ? (
        <MetaSyncCard clientId={user.clientId} />
      ) : (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Plug size={20} />
            <p>Associe um cliente ao seu perfil para usar as integrações.</p>
          </div>
        </div>
      )}

      {/* Placeholder for future integrations */}
      <div className="bg-card border border-border rounded-xl p-6 opacity-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-lg font-bold">G</div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Google Ads</h3>
            <p className="text-sm text-muted-foreground">Em breve</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 opacity-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-lg font-bold">T</div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">TikTok Ads</h3>
            <p className="text-sm text-muted-foreground">Em breve</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
