import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
import { Loader2, Users as UsersIcon, Shield, User, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  client_id: string | null;
  created_at: string;
  role: string;
  assignedClientIds: string[];
}

interface Client {
  id: string;
  name: string;
}

const Users: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: clients } = useQuery({
    queryKey: ['admin-clients-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data as Client[];
    },
  });

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (profilesError) throw profilesError;

      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      if (rolesError) throw rolesError;

      const { data: userClientsData, error: ucError } = await supabase
        .from('user_clients')
        .select('user_id, client_id');
      if (ucError) throw ucError;

      const rolesMap = new Map(rolesData?.map(r => [r.user_id, r.role]) || []);
      
      const clientsMap = new Map<string, string[]>();
      (userClientsData || []).forEach(uc => {
        const existing = clientsMap.get(uc.user_id) || [];
        existing.push(uc.client_id);
        clientsMap.set(uc.user_id, existing);
      });

      return (profilesData || []).map(profile => ({
        ...profile,
        role: rolesMap.get(profile.user_id) || 'client',
        assignedClientIds: clientsMap.get(profile.user_id) || [],
      })) as Profile[];
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'client' }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Perfil atualizado!');
    },
    onError: (error) => {
      toast.error('Erro: ' + error.message);
    },
  });

  const toggleClientMutation = useMutation({
    mutationFn: async ({ userId, clientId, assign }: { userId: string; clientId: string; assign: boolean }) => {
      if (assign) {
        const { error } = await supabase
          .from('user_clients')
          .insert({ user_id: userId, client_id: clientId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_clients')
          .delete()
          .eq('user_id', userId)
          .eq('client_id', clientId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Acesso atualizado!');
    },
    onError: (error) => {
      toast.error('Erro: ' + error.message);
    },
  });

  const getClientNames = (profile: Profile): string => {
    if (!clients || profile.assignedClientIds.length === 0) return 'Nenhum';
    const names = profile.assignedClientIds
      .map(id => clients.find(c => c.id === id)?.name)
      .filter(Boolean);
    if (names.length === 0) return 'Nenhum';
    if (names.length <= 2) return names.join(', ');
    return `${names[0]}, +${names.length - 1}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Usuários</h1>
        <p className="text-muted-foreground">Gerencie os usuários e suas permissões</p>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : profiles && profiles.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Usuário</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Clientes com acesso</TableHead>
                  <TableHead>Cadastro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{profile.name}</p>
                        <p className="text-sm text-muted-foreground">{profile.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={profile.role}
                        onValueChange={(value: 'admin' | 'client') =>
                          updateRoleMutation.mutate({ userId: profile.user_id, role: value })
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              Admin
                            </div>
                          </SelectItem>
                          <SelectItem value="client">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Cliente
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-56 justify-start text-left font-normal">
                            <span className="truncate">{getClientNames(profile)}</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-2" align="start">
                          <div className="space-y-1 max-h-60 overflow-y-auto">
                            {clients?.map((client) => {
                              const isAssigned = profile.assignedClientIds.includes(client.id);
                              return (
                                <label
                                  key={client.id}
                                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer text-sm"
                                >
                                  <Checkbox
                                    checked={isAssigned}
                                    onCheckedChange={(checked) =>
                                      toggleClientMutation.mutate({
                                        userId: profile.user_id,
                                        clientId: client.id,
                                        assign: !!checked,
                                      })
                                    }
                                  />
                                  <span>{client.name}</span>
                                </label>
                              );
                            })}
                            {(!clients || clients.length === 0) && (
                              <p className="text-sm text-muted-foreground px-2 py-1.5">
                                Nenhum cliente cadastrado
                              </p>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <UsersIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhum usuário encontrado</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;