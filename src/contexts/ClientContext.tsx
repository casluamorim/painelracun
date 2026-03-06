import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ClientOption {
  id: string;
  name: string;
}

interface ClientContextType {
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  clients: ClientOption[];
  selectedClientName: string | null;
  /** true = "Todos os clientes" selected (admin sees everything) */
  isAllSelected: boolean;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const clients: ClientOption[] = (user?.clientIds || []).map((id, i) => ({
    id,
    name: user?.clientNames?.[i] || id,
  }));

  // Default: select first client for 'client' role, null (all) for admin
  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin') {
      setSelectedClientId(null); // "Todos"
    } else if (clients.length > 0 && !selectedClientId) {
      setSelectedClientId(clients[0].id);
    }
  }, [user, clients.length]);

  const selectedClientName = selectedClientId
    ? clients.find(c => c.id === selectedClientId)?.name || null
    : null;

  const isAllSelected = selectedClientId === null;

  return (
    <ClientContext.Provider
      value={{ selectedClientId, setSelectedClientId, clients, selectedClientName, isAllSelected }}
    >
      {children}
    </ClientContext.Provider>
  );
};

export const useClientSelector = (): ClientContextType => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClientSelector must be used within a ClientProvider');
  }
  return context;
};
