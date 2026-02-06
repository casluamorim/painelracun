import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
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
import { Loader2, Users as UsersIcon, Shield, User } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  client_id: string | null;
  created_at: string;
  clients?: { name: string } | null;
  user_roles?: { role: string }[];
}

interface Client {
  id: string;
  name: string;
}

const Users: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // First get all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*, clients(name)')
        .order('created_at', { ascending: false });
      if (profilesError) throw profilesError;

      // Then get all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      if (rolesError) throw rolesError;

      // Create a map of user_id to role
      const rolesMap = new Map(rolesData?.map(r => [r.user_id, r.role]) || []);

      // Combine profiles with roles
      const profilesWithRoles = (profilesData || []).map(profile => ({
        ...profile,
        user_roles: rolesMap.has(profile.user_id) 
          ? [{ role: rolesMap.get(profile.user_id)! }] 
          : []
      }));

      return profilesWithRoles as Profile[];
    },
  });

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

  const updateClientMutation = useMutation({
    mutationFn: async ({ profileId, clientId }: { profileId: string; clientId: string | null }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ client_id: clientId })
        .eq('id', profileId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Cliente atualizado!');
    },
    onError: (error) => {
      toast.error('Erro: ' + error.message);
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

  const getRole = (profile: Profile): string => {
    return profile.user_roles?.[0]?.role || 'client';
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
                  <TableHead>Cliente</TableHead>
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
                        value={getRole(profile)}
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
                      <Select
                        value={profile.client_id || 'none'}
                        onValueChange={(value) =>
                          updateClientMutation.mutate({
                            profileId: profile.id,
                            clientId: value === 'none' ? null : value,
                          })
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Nenhum cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum cliente</SelectItem>
                          {clients?.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
