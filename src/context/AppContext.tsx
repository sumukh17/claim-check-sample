import React, { createContext, useContext, useState, useCallback } from 'react';
import type { PersonaType, PageType, Claim } from '../types';
import { APP_CONFIG } from '../data/config';

interface AppContextType {
  persona: PersonaType | null;
  currentPage: PageType;
  selectedClaimId: string | null;
  claims: Claim[];
  config: typeof APP_CONFIG;
  setPersona: (p: PersonaType) => void;
  navigate: (page: PageType, claimId?: string) => void;
  updateClaimAction: (claimId: string, actionId: string, status: 'pending' | 'in_progress' | 'completed') => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [persona, setPersonaState] = useState<PersonaType | null>(null);
  const [currentPage, setCurrentPage] = useState<PageType>('login');
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [claims, setClaims] = useState<Claim[]>(APP_CONFIG.claims);

  const setPersona = useCallback((p: PersonaType) => {
    setPersonaState(p);
    setCurrentPage('dashboard');
  }, []);

  const navigate = useCallback((page: PageType, claimId?: string) => {
    setCurrentPage(page);
    if (claimId !== undefined) setSelectedClaimId(claimId);
  }, []);

  const updateClaimAction = useCallback((claimId: string, actionId: string, status: 'pending' | 'in_progress' | 'completed') => {
    setClaims(prev => prev.map(c => {
      if (c.id !== claimId) return c;
      return {
        ...c,
        correctiveActions: c.correctiveActions.map(a =>
          a.id === actionId ? { ...a, status } : a
        ),
      };
    }));
  }, []);

  const logout = useCallback(() => {
    setPersonaState(null);
    setCurrentPage('login');
    setSelectedClaimId(null);
  }, []);

  return (
    <AppContext.Provider value={{
      persona, currentPage, selectedClaimId, claims,
      config: APP_CONFIG,
      setPersona, navigate, updateClaimAction, logout,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
