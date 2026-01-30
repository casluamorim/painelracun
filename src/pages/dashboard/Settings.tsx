import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
import { useToast } from '@/hooks/use-toast';
import {
  Lock,
  Globe,
  Clock,
  Loader2,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [currency, setCurrency] = useState('BRL');
  const [timezone, setTimezone] = useState('America/Sao_Paulo');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos.',
        variant: 'destructive',
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem.',
        variant: 'destructive',
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: 'Erro',
        description: 'A nova senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    
    toast({
      title: 'Senha alterada!',
      description: 'Sua senha foi atualizada com sucesso.',
    });
    
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handlePreferencesChange = async () => {
    toast({
      title: 'Preferências salvas!',
      description: 'Suas preferências foram atualizadas.',
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie sua conta e preferências
        </p>
      </div>

      {/* Account Info */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Informações da Conta</h2>
        <div className="space-y-4">
          <div>
            <Label className="text-muted-foreground">Nome</Label>
            <p className="text-foreground font-medium">{user?.name}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">E-mail</Label>
            <p className="text-foreground font-medium">{user?.email}</p>
          </div>
          {user?.clientName && (
            <div>
              <Label className="text-muted-foreground">Empresa</Label>
              <p className="text-foreground font-medium">{user.clientName}</p>
            </div>
          )}
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={20} className="text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Alterar Senha</h2>
        </div>
        
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha atual</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Alterando...
              </>
            ) : (
              'Alterar senha'
            )}
          </Button>
        </form>
      </div>

      {/* Preferences */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Preferências</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-muted-foreground" />
              <Label>Moeda</Label>
            </div>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">Real Brasileiro (R$)</SelectItem>
                <SelectItem value="USD">Dólar Americano ($)</SelectItem>
                <SelectItem value="EUR">Euro (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-muted-foreground" />
              <Label>Fuso Horário</Label>
            </div>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                <SelectItem value="America/New_York">Nova York (GMT-5)</SelectItem>
                <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                <SelectItem value="Europe/Lisbon">Lisboa (GMT+0)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={handlePreferencesChange}>
            Salvar preferências
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
